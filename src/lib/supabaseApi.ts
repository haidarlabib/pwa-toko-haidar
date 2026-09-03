import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Product,
  Category,
  Unit,
  PriceHistory,
  StockCheck,
  StockCheckEditRequest,
  ActivityLog,
  PriceChangeType,
  DayOfWeek,
} from '../types/database.types';
import { getPriceChangeType } from '../utils/priceColor';

/**
 * Helper to check if online and Supabase is ready
 */
export function isRemoteReady(): boolean {
  return isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine;
}

// ==============================================================================
// 1. PRODUCTS & CATALOG
// ==============================================================================

export async function supabaseGetProducts(options?: {
  includeInactive?: boolean;
  isAdmin?: boolean;
}): Promise<Product[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  // If staff/user, query safe view or safe columns strictly without purchase_price
  if (!options?.isAdmin) {
    let query = supabase
      .from('user_safe_products')
      .select('*')
      .order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category_id: p.category_id,
      subcategory: p.subcategory,
      unit_id: p.unit_id,
      purchase_price: 0, // Zeroed out for staff safety (BR-U04)
      selling_price: Number(p.selling_price),
      current_price_version: p.price_version || 1,
      stock: Number(p.stock),
      minimum_stock: Number(p.minimum_stock),
      image_url: p.image_url,
      notes: p.notes,
      is_active: p.is_active,
      created_at: p.created_at,
      updated_at: p.updated_at,
      category: p.category_name ? { id: p.category_id, name: p.category_name, is_active: true, created_at: '', updated_at: '' } : undefined,
      unit: p.unit_symbol ? { id: p.unit_id, name: p.unit_name || p.unit_symbol, symbol: p.unit_symbol, is_active: true, created_at: '', updated_at: '' } : undefined,
    }));
  }

  // Admin query
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      unit:units(*),
      inspection_schedules(day_of_week)
    `)
    .order('name', { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category_id: p.category_id,
    subcategory: p.subcategory,
    unit_id: p.unit_id,
    purchase_price: Number(p.purchase_price),
    selling_price: Number(p.selling_price),
    current_price_version: p.price_version || 1,
    stock: Number(p.stock),
    minimum_stock: Number(p.minimum_stock),
    image_url: p.image_url,
    notes: p.notes,
    inspection_days: p.inspection_schedules ? p.inspection_schedules.map((s: any) => s.day_of_week) : [],
    is_active: p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at,
    category: p.category,
    unit: p.unit,
  }));
}

export async function supabaseAddProduct(input: {
  name: string;
  sku?: string;
  category_id: string;
  subcategory?: string;
  unit_id: string;
  purchase_price: number;
  selling_price: number;
  initial_stock: number;
  minimum_stock?: number;
  notes?: string;
  image_url?: string;
  inspection_days?: DayOfWeek[];
}): Promise<Product> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      category_id: input.category_id,
      subcategory: input.subcategory?.trim() || null,
      unit_id: input.unit_id,
      purchase_price: Number(input.purchase_price) || 0,
      selling_price: Number(input.selling_price) || 0,
      price_version: 1, // Starts strictly at v1
      stock: Number(input.initial_stock) || 0,
      minimum_stock: Number(input.minimum_stock) || 0,
      notes: input.notes?.trim() || null,
      image_url: input.image_url?.trim() || null,
      is_active: true,
    })
    .select(`*, category:categories(*), unit:units(*)`)
    .single();

  if (error) throw error;

  // Insert inspection schedule rows
  if (input.inspection_days && input.inspection_days.length > 0) {
    const scheduleRows = input.inspection_days.map((day) => ({
      product_id: data.id,
      day_of_week: day,
    }));
    await supabase.from('inspection_schedules').insert(scheduleRows);
  }

  // Activity log
  await supabaseLogActivity({
    action: 'CREATE_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: data.id,
    description: `Admin menambahkan barang baru: ${data.name}`,
    new_data: {
      name: data.name,
      purchase_price: data.purchase_price,
      selling_price: data.selling_price,
      stock: data.stock,
      price_version: 1,
      inspection_days: input.inspection_days,
    },
  });

  return {
    id: data.id,
    sku: data.sku,
    name: data.name,
    category_id: data.category_id,
    subcategory: data.subcategory,
    unit_id: data.unit_id,
    purchase_price: Number(data.purchase_price),
    selling_price: Number(data.selling_price),
    current_price_version: data.price_version,
    stock: Number(data.stock),
    minimum_stock: Number(data.minimum_stock),
    image_url: data.image_url,
    notes: data.notes,
    inspection_days: input.inspection_days || [],
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
    category: data.category,
    unit: data.unit,
  };
}

export async function supabaseEditProduct(
  id: string,
  input: {
    name: string;
    sku?: string;
    category_id: string;
    subcategory?: string;
    unit_id: string;
    minimum_stock?: number;
    stock?: number;
    notes?: string;
    image_url?: string;
    inspection_days?: DayOfWeek[];
  }
): Promise<Product> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  // Normal master edit does NOT increment price_version (BR-09)
  const { data, error } = await supabase
    .from('products')
    .update({
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      category_id: input.category_id,
      subcategory: input.subcategory?.trim() || null,
      unit_id: input.unit_id,
      minimum_stock: Number(input.minimum_stock) || 0,
      stock: input.stock !== undefined ? Number(input.stock) : undefined,
      notes: input.notes?.trim() || null,
      image_url: input.image_url?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`*, category:categories(*), unit:units(*)`)
    .single();

  if (error) throw error;

  // Update inspection schedule rows
  if (input.inspection_days) {
    await supabase.from('inspection_schedules').delete().eq('product_id', id);
    if (input.inspection_days.length > 0) {
      const scheduleRows = input.inspection_days.map((day) => ({
        product_id: id,
        day_of_week: day,
      }));
      await supabase.from('inspection_schedules').insert(scheduleRows);
    }
  }

  // Activity log
  await supabaseLogActivity({
    action: 'UPDATE_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin mengubah data barang: ${data.name}`,
    new_data: input,
  });

  return {
    id: data.id,
    sku: data.sku,
    name: data.name,
    category_id: data.category_id,
    subcategory: data.subcategory,
    unit_id: data.unit_id,
    purchase_price: Number(data.purchase_price),
    selling_price: Number(data.selling_price),
    current_price_version: data.price_version,
    stock: Number(data.stock),
    minimum_stock: Number(data.minimum_stock),
    image_url: data.image_url,
    notes: data.notes,
    inspection_days: input.inspection_days,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
    category: data.category,
    unit: data.unit,
  };
}

export async function supabaseUpdateProductPrice(
  id: string,
  input: {
    new_purchase_price: number;
    new_selling_price: number;
    reason: string;
    updated_by_name?: string;
  }
): Promise<{ product: Product; priceHistory: PriceHistory }> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  // Fetch current product
  const { data: current, error: getErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (getErr || !current) throw new Error('Barang tidak ditemukan');

  const oldPurchase = Number(current.purchase_price);
  const oldSelling = Number(current.selling_price);
  const newPurchase = Number(input.new_purchase_price);
  const newSelling = Number(input.new_selling_price);
  const nextVersion = (current.price_version || 1) + 1;
  const changeType: PriceChangeType = getPriceChangeType(oldSelling, newSelling);

  // Update product price & version (BR-10, BR-24)
  const { data: updatedProd, error: updateErr } = await supabase
    .from('products')
    .update({
      purchase_price: newPurchase,
      selling_price: newSelling,
      price_version: nextVersion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`*, category:categories(*), unit:units(*)`)
    .single();

  if (updateErr) throw updateErr;

  // Insert price history record (BR-11)
  const { data: historyData, error: histErr } = await supabase
    .from('price_history')
    .insert({
      product_id: id,
      version: nextVersion,
      old_purchase_price: oldPurchase,
      new_purchase_price: newPurchase,
      old_selling_price: oldSelling,
      new_selling_price: newSelling,
      change_type: changeType,
      reason: input.reason.trim(),
      updated_by_name: input.updated_by_name || 'Admin',
    })
    .select('*')
    .single();

  if (histErr) throw histErr;

  // Activity log (BR-12)
  await supabaseLogActivity({
    action: 'UPDATE_PRICE',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin memperbarui harga resmi ${updatedProd.name} (v${current.price_version} → v${nextVersion}): Jual ${oldSelling} → ${newSelling}`,
    old_data: {
      purchase_price: oldPurchase,
      selling_price: oldSelling,
      price_version: current.price_version,
    },
    new_data: {
      purchase_price: newPurchase,
      selling_price: newSelling,
      price_version: nextVersion,
      reason: input.reason,
    },
  });

  const priceHistory: PriceHistory = {
    id: historyData.id,
    product_id: id,
    product_name: updatedProd.name,
    version: nextVersion,
    old_purchase_price: oldPurchase,
    new_purchase_price: newPurchase,
    old_selling_price: oldSelling,
    new_selling_price: newSelling,
    change_type: changeType,
    reason: input.reason.trim(),
    updated_by_name: input.updated_by_name || 'Admin',
    created_at: historyData.created_at,
  };

  const product: Product = {
    id: updatedProd.id,
    sku: updatedProd.sku,
    name: updatedProd.name,
    category_id: updatedProd.category_id,
    subcategory: updatedProd.subcategory,
    unit_id: updatedProd.unit_id,
    purchase_price: newPurchase,
    selling_price: newSelling,
    current_price_version: nextVersion,
    stock: Number(updatedProd.stock),
    minimum_stock: Number(updatedProd.minimum_stock),
    image_url: updatedProd.image_url,
    notes: updatedProd.notes,
    is_active: updatedProd.is_active,
    created_at: updatedProd.created_at,
    updated_at: updatedProd.updated_at,
    category: updatedProd.category,
    unit: updatedProd.unit,
  };

  return { product, priceHistory };
}

export async function supabaseDeactivateProduct(id: string): Promise<void> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  await supabaseLogActivity({
    action: 'DEACTIVATE_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin menonaktifkan barang ID ${id}`,
  });
}

// ==============================================================================
// 2. CATEGORIES & UNITS
// ==============================================================================

export async function supabaseGetCategories(): Promise<Category[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function supabaseAddCategory(name: string, description?: string): Promise<Category> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), description: description?.trim() || null, is_active: true })
    .select('*')
    .single();

  if (error) throw error;

  await supabaseLogActivity({
    action: 'CREATE_CATEGORY',
    entity_type: 'CATEGORY',
    entity_id: data.id,
    description: `Admin menambahkan kategori baru: ${data.name}`,
  });

  return data;
}

export async function supabaseGetUnits(): Promise<Unit[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function supabaseAddUnit(name: string, symbol: string): Promise<Unit> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('units')
    .insert({ name: name.trim(), symbol: symbol.trim().toUpperCase(), is_active: true })
    .select('*')
    .single();

  if (error) throw error;

  await supabaseLogActivity({
    action: 'CREATE_UNIT',
    entity_type: 'UNIT',
    entity_id: data.id,
    description: `Admin menambahkan satuan baru: ${data.name} (${data.symbol})`,
  });

  return data;
}

// ==============================================================================
// 3. INSPECTION SCHEDULES
// ==============================================================================

export async function supabaseUpdateProductInspectionSchedule(
  productId: string,
  days: DayOfWeek[]
): Promise<void> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  // Replace schedule rows
  await supabase.from('inspection_schedules').delete().eq('product_id', productId);

  if (days.length > 0) {
    const rows = days.map((d) => ({
      product_id: productId,
      day_of_week: d,
    }));
    const { error } = await supabase.from('inspection_schedules').insert(rows);
    if (error) throw error;
  }

  await supabaseLogActivity({
    action: 'UPDATE_INSPECTION_SCHEDULE',
    entity_type: 'PRODUCT',
    entity_id: productId,
    description: `Admin memperbarui jadwal pemeriksaan produk ID ${productId}: ${days.join(', ')}`,
    new_data: { inspection_days: days },
  });
}

// ==============================================================================
// 4. STOCK CHECKS & EDIT REQUESTS (Staff Operational Workflow)
// ==============================================================================

export async function supabaseGetStockChecks(checkDate?: string): Promise<StockCheck[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  let query = supabase
    .from('stock_checks')
    .select(`*, product:products(name)`)
    .order('created_at', { ascending: false });

  if (checkDate) {
    query = query.eq('check_date', checkDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((c: any) => ({
    id: c.id,
    product_id: c.product_id,
    product_name: c.product?.name,
    user_id: c.user_id,
    user_name: c.user_name,
    check_date: c.check_date,
    previous_stock: c.previous_stock, // Preserves raw text string (BR-13)
    current_stock: c.current_stock,   // Preserves raw text string (BR-13)
    note: c.note,
    status: c.status,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));
}

export async function supabaseAddStockCheck(input: {
  product_id: string;
  user_id?: string;
  user_name: string;
  check_date: string;
  previous_stock: string;
  current_stock: string;
  note?: string;
}): Promise<StockCheck> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  // Raw text observation preserved, locked to 'SUBMITTED' (BR-U14, BR-U15)
  const { data, error } = await supabase
    .from('stock_checks')
    .insert({
      product_id: input.product_id,
      user_id: input.user_id || null,
      user_name: input.user_name.trim(),
      check_date: input.check_date,
      previous_stock: input.previous_stock.trim(),
      current_stock: input.current_stock.trim(),
      note: input.note?.trim() || null,
      status: 'SUBMITTED',
    })
    .select(`*, product:products(name)`)
    .single();

  if (error) throw error;

  await supabaseLogActivity({
    action: 'SUBMIT_STOCK_CHECK',
    entity_type: 'STOCK_CHECK',
    entity_id: data.id,
    description: `Staf ${input.user_name} mengirim pemeriksaan fisik untuk ${data.product?.name || input.product_id}`,
    new_data: input,
  });

  return {
    id: data.id,
    product_id: data.product_id,
    product_name: data.product?.name,
    user_id: data.user_id,
    user_name: data.user_name,
    check_date: data.check_date,
    previous_stock: data.previous_stock,
    current_stock: data.current_stock,
    note: data.note,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function supabaseRequestStockCheckEdit(input: {
  stock_check_id: string;
  requested_by_id?: string;
  requested_by_name: string;
  reason: string;
}): Promise<StockCheckEditRequest> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  // Insert edit request
  const { data, error } = await supabase
    .from('edit_requests')
    .insert({
      stock_check_id: input.stock_check_id,
      requested_by: input.requested_by_id || null,
      requested_by_name: input.requested_by_name.trim(),
      reason: input.reason.trim(),
      status: 'PENDING',
    })
    .select('*')
    .single();

  if (error) throw error;

  // Update check status to EDIT_REQUESTED
  await supabase
    .from('stock_checks')
    .update({ status: 'EDIT_REQUESTED' })
    .eq('id', input.stock_check_id);

  await supabaseLogActivity({
    action: 'REQUEST_STOCK_CHECK_EDIT',
    entity_type: 'STOCK_CHECK',
    entity_id: input.stock_check_id,
    description: `Staf ${input.requested_by_name} mengajukan koreksi pemeriksaan: "${input.reason}"`,
  });

  return data;
}

export async function supabaseGetEditRequests(): Promise<(StockCheckEditRequest & { product_name?: string })[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('edit_requests')
    .select(`
      *,
      stock_check:stock_checks(
        product_id,
        product:products(name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    stock_check_id: r.stock_check_id,
    requested_by: r.requested_by_name,
    reason: r.reason,
    status: r.status,
    reviewed_by: r.reviewed_by,
    reviewed_at: r.reviewed_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    product_name: r.stock_check?.product?.name,
  }));
}

export async function supabaseReviewEditRequest(
  stockCheckId: string,
  decision: 'APPROVED' | 'REJECTED',
  reviewerName: string = 'Admin'
): Promise<void> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const newStatus = decision === 'APPROVED' ? 'EDIT_APPROVED' : 'EDIT_REJECTED';

  // Update edit_requests
  await supabase
    .from('edit_requests')
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
    })
    .eq('stock_check_id', stockCheckId);

  // Update stock_checks
  await supabase
    .from('stock_checks')
    .update({ status: newStatus })
    .eq('id', stockCheckId);

  await supabaseLogActivity({
    action: decision === 'APPROVED' ? 'APPROVE_EDIT_REQUEST' : 'REJECT_EDIT_REQUEST',
    entity_type: 'STOCK_CHECK',
    entity_id: stockCheckId,
    description: `Admin ${reviewerName} ${decision === 'APPROVED' ? 'menyetujui' : 'menolak'} permintaan edit pemeriksaan`,
  });
}

// ==============================================================================
// 5. PRICE HISTORY & ACTIVITY LOGS
// ==============================================================================

export async function supabaseGetPriceHistory(productId?: string): Promise<PriceHistory[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  let query = supabase
    .from('price_history')
    .select(`*, product:products(name)`)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((h: any) => ({
    id: h.id,
    product_id: h.product_id,
    product_name: h.product?.name,
    version: h.version,
    old_purchase_price: Number(h.old_purchase_price),
    new_purchase_price: Number(h.new_purchase_price),
    old_selling_price: Number(h.old_selling_price),
    new_selling_price: Number(h.new_selling_price),
    change_type: h.change_type,
    reason: h.reason,
    updated_by_name: h.updated_by_name,
    created_at: h.created_at,
  }));
}

export async function supabaseGetActivityLogs(): Promise<ActivityLog[]> {
  if (!isRemoteReady()) throw new Error('Supabase not ready');

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data || []).map((a: any) => ({
    id: a.id,
    user_id: a.user_id,
    user_name: a.user_name || 'Admin',
    action: a.action,
    entity_type: a.entity_type,
    entity_id: a.entity_id,
    description: a.description,
    old_data: a.old_data,
    new_data: a.new_data,
    created_at: a.created_at,
  }));
}

export async function supabaseLogActivity(input: {
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  old_data?: any;
  new_data?: any;
  user_id?: string;
  user_name?: string;
}): Promise<void> {
  if (!isRemoteReady()) return;

  try {
    await supabase.from('activity_logs').insert({
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id || null,
      description: input.description,
      old_data: input.old_data || null,
      new_data: input.new_data || null,
      user_id: input.user_id || null,
      user_name: input.user_name || 'Admin',
    });
  } catch (err) {
    console.warn('Failed to insert activity log to Supabase:', err);
  }
}
