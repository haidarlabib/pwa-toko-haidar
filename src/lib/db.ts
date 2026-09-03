import { openDB, type IDBPDatabase } from 'idb';
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
import {
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_PRODUCTS,
  INITIAL_PRICE_HISTORY,
  INITIAL_STOCK_CHECKS,
  INITIAL_ACTIVITY_LOGS,
} from './seedData';
import { getPriceChangeType } from '../utils/priceColor';
import { getCurrentDate, getJakartaNow } from './datetime';
import {
  isRemoteReady,
  supabaseGetProducts,
  supabaseAddProduct,
  supabaseEditProduct,
  supabaseUpdateProductPrice,
  supabaseUpdateProductInspectionSchedule,
  supabaseDeactivateProduct,
  supabaseGetCategories,
  supabaseAddCategory,
  supabaseGetUnits,
  supabaseAddUnit,
  supabaseGetStockChecks,
  supabaseAddStockCheck,
  supabaseRequestStockCheckEdit,
  supabaseGetEditRequests,
  supabaseReviewEditRequest,
  supabaseGetPriceHistory,
  supabaseGetActivityLogs,
  supabaseLogActivity,
} from './supabaseApi';

const DB_NAME = 'haidar_plastik_db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export const INDONESIAN_DAYS: DayOfWeek[] = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function getIndonesianDayName(date: Date = getJakartaNow()): DayOfWeek {
  return INDONESIAN_DAYS[date.getDay()];
}

export function getTodayDateString(date?: Date): string {
  if (!date) return getCurrentDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('units')) {
          db.createObjectStore('units', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('category_id', 'category_id');
          productStore.createIndex('is_active', 'is_active');
        }
        if (!db.objectStoreNames.contains('price_history')) {
          const historyStore = db.createObjectStore('price_history', { keyPath: 'id' });
          historyStore.createIndex('product_id', 'product_id');
          historyStore.createIndex('created_at', 'created_at');
        }
        if (!db.objectStoreNames.contains('stock_checks')) {
          const checkStore = db.createObjectStore('stock_checks', { keyPath: 'id' });
          checkStore.createIndex('product_id', 'product_id');
          checkStore.createIndex('created_at', 'created_at');
          checkStore.createIndex('check_date', 'check_date');
        } else if (oldVersion < 2) {
          const checkStore = transaction.objectStore('stock_checks');
          if (!checkStore.indexNames.contains('check_date')) {
            checkStore.createIndex('check_date', 'check_date');
          }
        }
        if (!db.objectStoreNames.contains('activity_logs')) {
          const logStore = db.createObjectStore('activity_logs', { keyPath: 'id' });
          logStore.createIndex('created_at', 'created_at');
        }
        if (!db.objectStoreNames.contains('stock_check_edit_requests')) {
          const editStore = db.createObjectStore('stock_check_edit_requests', { keyPath: 'id' });
          editStore.createIndex('stock_check_id', 'stock_check_id');
          editStore.createIndex('status', 'status');
          editStore.createIndex('created_at', 'created_at');
        }
      },
    });

    const db = await dbPromise;
    const productCount = await db.count('products');
    if (productCount === 0) {
      await seedDatabase(db);
    }
  }
  return dbPromise;
}

async function seedDatabase(db: IDBPDatabase) {
  const tx = db.transaction(
    ['categories', 'units', 'products', 'price_history', 'stock_checks', 'activity_logs'],
    'readwrite'
  );

  for (const cat of INITIAL_CATEGORIES) {
    await tx.objectStore('categories').put(cat);
  }
  for (const unit of INITIAL_UNITS) {
    await tx.objectStore('units').put(unit);
  }
  for (const prod of INITIAL_PRODUCTS) {
    await tx.objectStore('products').put(prod);
  }
  for (const hist of INITIAL_PRICE_HISTORY) {
    await tx.objectStore('price_history').put(hist);
  }
  for (const check of INITIAL_STOCK_CHECKS) {
    await tx.objectStore('stock_checks').put(check);
  }
  for (const log of INITIAL_ACTIVITY_LOGS) {
    await tx.objectStore('activity_logs').put(log);
  }

  await tx.done;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['categories', 'units', 'products', 'price_history', 'stock_checks', 'activity_logs'],
    'readwrite'
  );
  await tx.objectStore('categories').clear();
  await tx.objectStore('units').clear();
  await tx.objectStore('products').clear();
  await tx.objectStore('price_history').clear();
  await tx.objectStore('stock_checks').clear();
  await tx.objectStore('activity_logs').clear();
  await tx.done;

  await seedDatabase(db);
}

// ==========================================
// PRODUCTS DATA ACCESS
// ==========================================

export async function getProducts(filters?: {
  search?: string;
  categoryId?: string;
  unitId?: string;
  stockStatus?: 'Semua' | 'Tersedia' | 'Menipis' | 'Habis';
  includeInactive?: boolean;
}): Promise<Product[]> {
  // 1. Try Supabase remote fetch if online
  if (isRemoteReady()) {
    try {
      const remoteProducts = await supabaseGetProducts({
        includeInactive: filters?.includeInactive,
        isAdmin: true,
      });

      // Cache to IndexedDB
      const db = await getDB();
      const tx = db.transaction('products', 'readwrite');
      for (const p of remoteProducts) {
        await tx.objectStore('products').put(p);
      }
      await tx.done;

      return applyProductFilters(remoteProducts, filters);
    } catch (err) {
      console.warn('Remote products query failed, using local cache:', err);
    }
  }

  // 2. Local fallback
  const db = await getDB();
  const allProducts = (await db.getAll('products')) as Product[];
  const allCategories = (await db.getAll('categories')) as Category[];
  const allUnits = (await db.getAll('units')) as Unit[];

  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));
  const unitMap = new Map(allUnits.map((u) => [u.id, u]));

  const joined = allProducts.map((p) => ({
    ...p,
    category: categoryMap.get(p.category_id),
    unit: unitMap.get(p.unit_id),
  }));

  return applyProductFilters(joined, filters);
}

function applyProductFilters(products: Product[], filters?: any): Product[] {
  let filtered = products;

  if (!filters?.includeInactive) {
    filtered = filtered.filter((p) => p.is_active);
  }

  if (filters?.categoryId && filters.categoryId !== 'all') {
    filtered = filtered.filter((p) => p.category_id === filters.categoryId);
  }

  if (filters?.unitId && filters.unitId !== 'all') {
    filtered = filtered.filter((p) => p.unit_id === filters.unitId);
  }

  if (filters?.stockStatus && filters.stockStatus !== 'Semua') {
    if (filters.stockStatus === 'Habis') {
      filtered = filtered.filter((p) => Number(p.stock) <= 0);
    } else if (filters.stockStatus === 'Menipis') {
      filtered = filtered.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minimum_stock));
    } else if (filters.stockStatus === 'Tersedia') {
      filtered = filtered.filter((p) => Number(p.stock) > Number(p.minimum_stock));
    }
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
    );
  }

  return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

/**
 * Returns products for User view: STRICTLY STRIPS purchase_price (BR-U04)
 */
export async function getUserProducts(filters?: {
  search?: string;
  categoryId?: string;
}): Promise<Omit<Product, 'purchase_price'>[]> {
  if (isRemoteReady()) {
    try {
      const safeProds = await supabaseGetProducts({
        includeInactive: false,
        isAdmin: false,
      });
      return safeProds;
    } catch (err) {
      console.warn('Remote safe view query failed, using local stripped data:', err);
    }
  }

  const products = await getProducts({
    search: filters?.search,
    categoryId: filters?.categoryId,
    includeInactive: false,
  });

  return products.map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { purchase_price: _, ...userSafeProduct } = p;
    return userSafeProduct;
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDB();
  const product = (await db.get('products', id)) as Product | undefined;
  if (!product) return null;

  const category = (await db.get('categories', product.category_id)) as Category | undefined;
  const unit = (await db.get('units', product.unit_id)) as Unit | undefined;

  return {
    ...product,
    category,
    unit,
  };
}

export async function addProduct(input: {
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
  if (isRemoteReady()) {
    try {
      const remoteProd = await supabaseAddProduct(input);
      const db = await getDB();
      await db.put('products', remoteProd);
      return remoteProd;
    } catch (err) {
      console.warn('Remote add product failed, saving locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();
  const newId = 'p-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  const product: Product = {
    id: newId,
    sku: input.sku?.trim() || undefined,
    name: input.name.trim(),
    category_id: input.category_id,
    subcategory: input.subcategory?.trim() || undefined,
    unit_id: input.unit_id,
    purchase_price: Number(input.purchase_price) || 0,
    selling_price: Number(input.selling_price) || 0,
    current_price_version: 1, // Starts strictly at v1 per PRD
    stock: Number(input.initial_stock) || 0,
    minimum_stock: Number(input.minimum_stock) || 0,
    notes: input.notes?.trim() || undefined,
    image_url: input.image_url?.trim() || undefined,
    inspection_days: input.inspection_days || ['Senin', 'Rabu', 'Sabtu'],
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  await db.put('products', product);

  await addActivityLog({
    action: 'CREATE_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: newId,
    description: `Admin menambahkan barang baru: ${product.name}`,
    user_name: 'Admin Haidar',
    new_data: {
      name: product.name,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      stock: product.stock,
      price_version: 1,
      inspection_days: product.inspection_days,
    },
  });

  return product;
}

export async function editProduct(
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
  if (isRemoteReady()) {
    try {
      const remoteProd = await supabaseEditProduct(id, input);
      const db = await getDB();
      await db.put('products', remoteProd);
      return remoteProd;
    } catch (err) {
      console.warn('Remote edit product failed, updating locally:', err);
    }
  }

  const db = await getDB();
  const existing = (await db.get('products', id)) as Product | undefined;
  if (!existing) throw new Error('Barang tidak ditemukan');

  const now = new Date().toISOString();
  const oldData = { ...existing };

  const updated: Product = {
    ...existing,
    name: input.name.trim(),
    sku: input.sku?.trim() || undefined,
    category_id: input.category_id,
    subcategory: input.subcategory?.trim() || undefined,
    unit_id: input.unit_id,
    minimum_stock: Number(input.minimum_stock) || 0,
    stock: input.stock !== undefined ? Number(input.stock) : existing.stock,
    notes: input.notes?.trim() || undefined,
    image_url: input.image_url?.trim() || undefined,
    inspection_days: input.inspection_days || existing.inspection_days || ['Senin', 'Rabu', 'Sabtu'],
    updated_at: now,
  };

  await db.put('products', updated);

  await addActivityLog({
    action: 'EDIT_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin mengubah data barang: ${updated.name}`,
    user_name: 'Admin Haidar',
    old_data: {
      name: oldData.name,
      category_id: oldData.category_id,
      unit_id: oldData.unit_id,
      notes: oldData.notes,
      inspection_days: oldData.inspection_days,
    },
    new_data: {
      name: updated.name,
      category_id: updated.category_id,
      unit_id: updated.unit_id,
      notes: updated.notes,
      inspection_days: updated.inspection_days,
    },
  });

  return updated;
}

export async function updateProductInspectionSchedule(
  id: string,
  days: DayOfWeek[]
): Promise<Product> {
  if (isRemoteReady()) {
    try {
      await supabaseUpdateProductInspectionSchedule(id, days);
    } catch (err) {
      console.warn('Remote update schedule failed, updating locally:', err);
    }
  }

  const db = await getDB();
  const existing = (await db.get('products', id)) as Product | undefined;
  if (!existing) throw new Error('Barang tidak ditemukan');

  const now = new Date().toISOString();
  const updated: Product = {
    ...existing,
    inspection_days: days,
    updated_at: now,
  };

  await db.put('products', updated);

  await addActivityLog({
    action: 'EDIT_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin memperbarui jadwal pemeriksaan ${updated.name}: ${days.join(', ')}`,
    user_name: 'Admin Haidar',
    new_data: { inspection_days: days },
  });

  return updated;
}

export async function updateProductPrice(
  id: string,
  input: {
    new_purchase_price: number;
    new_selling_price: number;
    reason: string;
  }
): Promise<{ product: Product; priceHistory: PriceHistory }> {
  if (isRemoteReady()) {
    try {
      const res = await supabaseUpdateProductPrice(id, input);
      const db = await getDB();
      await db.put('products', res.product);
      await db.put('price_history', res.priceHistory);
      return res;
    } catch (err) {
      console.warn('Remote price update failed, updating locally:', err);
    }
  }

  const db = await getDB();
  const existing = (await db.get('products', id)) as Product | undefined;
  if (!existing) throw new Error('Barang tidak ditemukan');

  const now = new Date().toISOString();
  const oldPurchase = existing.purchase_price;
  const oldSelling = existing.selling_price;
  const newPurchase = Number(input.new_purchase_price);
  const newSelling = Number(input.new_selling_price);

  const nextVersion = existing.current_price_version + 1;
  const changeType: PriceChangeType = getPriceChangeType(oldSelling, newSelling);

  const updatedProduct: Product = {
    ...existing,
    purchase_price: newPurchase,
    selling_price: newSelling,
    current_price_version: nextVersion,
    updated_at: now,
  };

  const historyRecord: PriceHistory = {
    id: 'h-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    product_id: id,
    product_name: existing.name,
    version: nextVersion,
    old_purchase_price: oldPurchase,
    new_purchase_price: newPurchase,
    old_selling_price: oldSelling,
    new_selling_price: newSelling,
    change_type: changeType,
    reason: input.reason.trim(),
    updated_by_name: 'Admin Haidar',
    created_at: now,
  };

  await db.put('products', updatedProduct);
  await db.put('price_history', historyRecord);

  await addActivityLog({
    action: 'UPDATE_PRICE',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin mengupdate harga resmi ${existing.name} (v${existing.current_price_version} → v${nextVersion}): Jual ${oldSelling} → ${newSelling}`,
    user_name: 'Admin Haidar',
    old_data: {
      purchase_price: oldPurchase,
      selling_price: oldSelling,
      price_version: existing.current_price_version,
    },
    new_data: {
      purchase_price: newPurchase,
      selling_price: newSelling,
      price_version: nextVersion,
      reason: input.reason,
    },
  });

  return { product: updatedProduct, priceHistory: historyRecord };
}

export async function deactivateProduct(id: string): Promise<void> {
  if (isRemoteReady()) {
    try {
      await supabaseDeactivateProduct(id);
    } catch (err) {
      console.warn('Remote deactivate failed, deactivating locally:', err);
    }
  }

  const db = await getDB();
  const existing = (await db.get('products', id)) as Product | undefined;
  if (!existing) return;

  const updated: Product = {
    ...existing,
    is_active: false,
    updated_at: new Date().toISOString(),
  };

  await db.put('products', updated);

  await addActivityLog({
    action: 'DEACTIVATE_PRODUCT',
    entity_type: 'PRODUCT',
    entity_id: id,
    description: `Admin menonaktifkan barang: ${existing.name}`,
    user_name: 'Admin Haidar',
  });
}

// ==========================================
// CATEGORIES & UNITS DATA ACCESS
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (isRemoteReady()) {
    try {
      const cats = await supabaseGetCategories();
      const db = await getDB();
      const tx = db.transaction('categories', 'readwrite');
      for (const c of cats) {
        await tx.objectStore('categories').put(c);
      }
      await tx.done;
      return cats;
    } catch (err) {
      console.warn('Remote categories query failed, using local cache:', err);
    }
  }

  const db = await getDB();
  const all = (await db.getAll('categories')) as Category[];
  return all.filter((c) => c.is_active).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCategory(name: string, description?: string): Promise<Category> {
  if (isRemoteReady()) {
    try {
      const remoteCat = await supabaseAddCategory(name, description);
      const db = await getDB();
      await db.put('categories', remoteCat);
      return remoteCat;
    } catch (err) {
      console.warn('Remote add category failed, adding locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();
  const newCat: Category = {
    id: 'c-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    description: description?.trim() || undefined,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  await db.put('categories', newCat);

  await addActivityLog({
    action: 'CREATE_CATEGORY',
    entity_type: 'CATEGORY',
    entity_id: newCat.id,
    description: `Admin menambahkan kategori baru: ${newCat.name}`,
    user_name: 'Admin Haidar',
  });

  return newCat;
}

export async function getUnits(): Promise<Unit[]> {
  if (isRemoteReady()) {
    try {
      const units = await supabaseGetUnits();
      const db = await getDB();
      const tx = db.transaction('units', 'readwrite');
      for (const u of units) {
        await tx.objectStore('units').put(u);
      }
      await tx.done;
      return units;
    } catch (err) {
      console.warn('Remote units query failed, using local cache:', err);
    }
  }

  const db = await getDB();
  const all = (await db.getAll('units')) as Unit[];
  return all.filter((u) => u.is_active).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addUnit(name: string, symbol: string): Promise<Unit> {
  if (isRemoteReady()) {
    try {
      const remoteUnit = await supabaseAddUnit(name, symbol);
      const db = await getDB();
      await db.put('units', remoteUnit);
      return remoteUnit;
    } catch (err) {
      console.warn('Remote add unit failed, adding locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();
  const newUnit: Unit = {
    id: 'u-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    symbol: symbol.trim().toUpperCase(),
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  await db.put('units', newUnit);

  await addActivityLog({
    action: 'CREATE_UNIT',
    entity_type: 'UNIT',
    entity_id: newUnit.id,
    description: `Admin menambahkan satuan baru: ${newUnit.name} (${newUnit.symbol})`,
    user_name: 'Admin Haidar',
  });

  return newUnit;
}

// ==========================================
// STOCK CHECKS & EDIT REQUESTS
// ==========================================

export async function getStockChecks(checkDate?: string): Promise<StockCheck[]> {
  if (isRemoteReady()) {
    try {
      const checks = await supabaseGetStockChecks(checkDate);
      const db = await getDB();
      const tx = db.transaction('stock_checks', 'readwrite');
      for (const c of checks) {
        await tx.objectStore('stock_checks').put(c);
      }
      await tx.done;
      return checks;
    } catch (err) {
      console.warn('Remote stock checks query failed, using local cache:', err);
    }
  }

  const db = await getDB();
  let checks: StockCheck[];

  if (checkDate) {
    try {
      checks = (await db.getAllFromIndex('stock_checks', 'check_date', checkDate)) as StockCheck[];
    } catch {
      const all = (await db.getAll('stock_checks')) as StockCheck[];
      checks = all.filter((c) => c.check_date === checkDate);
    }
  } else {
    checks = (await db.getAll('stock_checks')) as StockCheck[];
  }

  const products = (await db.getAll('products')) as Product[];
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return checks
    .map((c) => ({
      ...c,
      product_name: productMap.get(c.product_id) || c.product_name,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getTodayStockChecks(date?: Date | string): Promise<StockCheck[]> {
  const dateStr = date instanceof Date ? getTodayDateString(date) : (date || getTodayDateString());
  return getStockChecks(dateStr);
}

export async function addStockCheck(input: {
  product_id: string;
  product_name?: string;
  user_id?: string;
  user_name: string;
  check_date?: string;
  previous_stock: string;
  current_stock: string;
  note?: string;
}): Promise<StockCheck> {
  const finalInput = {
    ...input,
    check_date: input.check_date || getTodayDateString(),
  };

  if (isRemoteReady()) {
    try {
      const remoteCheck = await supabaseAddStockCheck(finalInput);
      const db = await getDB();
      await db.put('stock_checks', remoteCheck);
      return remoteCheck;
    } catch (err) {
      console.warn('Remote stock check submission failed, saving locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();
  const product = (await db.get('products', finalInput.product_id)) as Product | undefined;

  const newCheck: StockCheck = {
    id: 'sc-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    product_id: finalInput.product_id,
    product_name: product?.name,
    user_id: finalInput.user_id,
    user_name: finalInput.user_name.trim(),
    check_date: finalInput.check_date,
    previous_stock: finalInput.previous_stock.trim(),
    current_stock: finalInput.current_stock.trim(),
    note: finalInput.note?.trim() || undefined,
    status: 'SUBMITTED',
    created_at: now,
  };

  await db.put('stock_checks', newCheck);

  await addActivityLog({
    action: 'SUBMIT_STOCK_CHECK',
    entity_type: 'STOCK_CHECK',
    entity_id: newCheck.id,
    description: `Staf ${finalInput.user_name} mengirim pemeriksaan fisik untuk ${product?.name || finalInput.product_id}`,
    user_name: finalInput.user_name,
    new_data: {
      product_name: product?.name,
      previous_stock: finalInput.previous_stock,
      current_stock: finalInput.current_stock,
      check_date: finalInput.check_date,
    },
  });

  return newCheck;
}

export const submitStockCheck = addStockCheck;

export async function requestStockCheckEdit(
  stockCheckIdOrInput:
    | string
    | {
        stock_check_id: string;
        requested_by_id?: string;
        requested_by_name: string;
        reason: string;
      },
  requestedByName?: string,
  reason?: string
): Promise<StockCheckEditRequest> {
  const normalized =
    typeof stockCheckIdOrInput === 'string'
      ? {
          stock_check_id: stockCheckIdOrInput,
          requested_by_name: requestedByName || 'Staff',
          reason: reason || '',
        }
      : stockCheckIdOrInput;

  if (isRemoteReady()) {
    try {
      const remoteReq = await supabaseRequestStockCheckEdit(normalized);
      return remoteReq;
    } catch (err) {
      console.warn('Remote edit request failed, saving locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();

  const check = (await db.get('stock_checks', normalized.stock_check_id)) as StockCheck | undefined;
  if (!check) throw new Error('Pemeriksaan tidak ditemukan');

  const updatedCheck: StockCheck = {
    ...check,
    status: 'EDIT_REQUESTED',
    edit_reason: normalized.reason.trim(),
  };
  await db.put('stock_checks', updatedCheck);

  const editRequest: StockCheckEditRequest = {
    id: 'req-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    stock_check_id: normalized.stock_check_id,
    requested_by: normalized.requested_by_name.trim(),
    reason: normalized.reason.trim(),
    status: 'PENDING',
    created_at: now,
  };

  await db.put('stock_check_edit_requests', editRequest);

  await addActivityLog({
    action: 'REQUEST_STOCK_CHECK_EDIT',
    entity_type: 'STOCK_CHECK',
    entity_id: normalized.stock_check_id,
    description: `Staf ${normalized.requested_by_name} mengajukan koreksi pemeriksaan: "${normalized.reason}"`,
    user_name: normalized.requested_by_name,
  });

  return editRequest;
}

export async function getEditRequests(): Promise<(StockCheckEditRequest & { product_name?: string })[]> {
  if (isRemoteReady()) {
    try {
      return await supabaseGetEditRequests();
    } catch (err) {
      console.warn('Remote edit requests query failed, using local cache:', err);
    }
  }

  const db = await getDB();
  const requests = (await db.getAll('stock_check_edit_requests')) as StockCheckEditRequest[];
  const checks = (await db.getAll('stock_checks')) as StockCheck[];
  const products = (await db.getAll('products')) as Product[];

  const checkMap = new Map(checks.map((c) => [c.id, c]));
  const prodMap = new Map(products.map((p) => [p.id, p.name]));

  return requests
    .map((r) => {
      const chk = checkMap.get(r.stock_check_id);
      const prodName = chk ? prodMap.get(chk.product_id) || chk.product_name : undefined;
      return {
        ...r,
        product_name: prodName,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function approveStockCheckEdit(
  stockCheckId: string,
  reviewerName: string = 'Admin Haidar'
): Promise<void> {
  if (isRemoteReady()) {
    try {
      await supabaseReviewEditRequest(stockCheckId, 'APPROVED', reviewerName);
    } catch (err) {
      console.warn('Remote approve failed, updating locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();

  const check = (await db.get('stock_checks', stockCheckId)) as StockCheck | undefined;
  if (check) {
    check.status = 'EDIT_APPROVED';
    check.reviewed_by = reviewerName;
    check.reviewed_at = now;
    await db.put('stock_checks', check);
  }

  const requests = (await db.getAllFromIndex('stock_check_edit_requests', 'stock_check_id', stockCheckId)) as StockCheckEditRequest[];
  for (const req of requests) {
    req.status = 'APPROVED';
    req.reviewed_by = reviewerName;
    req.reviewed_at = now;
    await db.put('stock_check_edit_requests', req);
  }

  await addActivityLog({
    action: 'APPROVE_EDIT_REQUEST',
    entity_type: 'STOCK_CHECK',
    entity_id: stockCheckId,
    description: `Admin ${reviewerName} menyetujui permintaan edit pemeriksaan`,
    user_name: reviewerName,
  });
}

export async function rejectStockCheckEdit(
  stockCheckId: string,
  reviewerName: string = 'Admin Haidar'
): Promise<void> {
  if (isRemoteReady()) {
    try {
      await supabaseReviewEditRequest(stockCheckId, 'REJECTED', reviewerName);
    } catch (err) {
      console.warn('Remote reject failed, updating locally:', err);
    }
  }

  const db = await getDB();
  const now = new Date().toISOString();

  const check = (await db.get('stock_checks', stockCheckId)) as StockCheck | undefined;
  if (check) {
    check.status = 'EDIT_REJECTED';
    check.reviewed_by = reviewerName;
    check.reviewed_at = now;
    await db.put('stock_checks', check);
  }

  const requests = (await db.getAllFromIndex('stock_check_edit_requests', 'stock_check_id', stockCheckId)) as StockCheckEditRequest[];
  for (const req of requests) {
    req.status = 'REJECTED';
    req.reviewed_by = reviewerName;
    req.reviewed_at = now;
    await db.put('stock_check_edit_requests', req);
  }

  await addActivityLog({
    action: 'REJECT_EDIT_REQUEST',
    entity_type: 'STOCK_CHECK',
    entity_id: stockCheckId,
    description: `Admin ${reviewerName} menolak permintaan edit pemeriksaan`,
    user_name: reviewerName,
  });
}

// ==========================================
// PRICE HISTORY & ACTIVITY LOGS
// ==========================================

export async function getPriceHistory(productId?: string): Promise<PriceHistory[]> {
  if (isRemoteReady()) {
    try {
      const histories = await supabaseGetPriceHistory(productId);
      const db = await getDB();
      const tx = db.transaction('price_history', 'readwrite');
      for (const h of histories) {
        await tx.objectStore('price_history').put(h);
      }
      await tx.done;
      return histories;
    } catch (err) {
      console.warn('Remote price history query failed, using local cache:', err);
    }
  }

  const db = await getDB();
  let histories: PriceHistory[];

  if (productId) {
    try {
      histories = (await db.getAllFromIndex('price_history', 'product_id', productId)) as PriceHistory[];
    } catch {
      const all = (await db.getAll('price_history')) as PriceHistory[];
      histories = all.filter((h) => h.product_id === productId);
    }
  } else {
    histories = (await db.getAll('price_history')) as PriceHistory[];
  }

  const products = (await db.getAll('products')) as Product[];
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return histories
    .map((h) => ({
      ...h,
      product_name: productMap.get(h.product_id) || h.product_name,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  if (isRemoteReady()) {
    try {
      const logs = await supabaseGetActivityLogs();
      const db = await getDB();
      const tx = db.transaction('activity_logs', 'readwrite');
      for (const l of logs) {
        await tx.objectStore('activity_logs').put(l);
      }
      await tx.done;
      return logs;
    } catch (err) {
      console.warn('Remote activity logs query failed, using local cache:', err);
    }
  }

  const db = await getDB();
  const logs = (await db.getAll('activity_logs')) as ActivityLog[];
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function addActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
  if (isRemoteReady()) {
    await supabaseLogActivity(log);
  }

  const db = await getDB();
  const fullLog: ActivityLog = {
    ...log,
    id: 'log-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
  };

  await db.put('activity_logs', fullLog);
  return fullLog;
}
