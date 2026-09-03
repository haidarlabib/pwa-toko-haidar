export type UserRole = 'ADMIN' | 'USER';

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface User {
  id: string;
  name: string;
  username: string; // Dynamic username (e.g. 'ahmad', 'budi') per BR-U06
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category_id: string;
  subcategory?: string;
  unit_id: string;
  purchase_price: number; // Harga Modal (Admin only - BR-12, BR-U04)
  selling_price: number;  // Harga Jual (User can see - BR-U05)
  current_price_version: number; // v1, v2, v3... (BR-04, BR-11, BR-16)
  stock: number;          // Official numeric system stock (BR-10, BR-23, BR-U15)
  minimum_stock: number;
  image_url?: string;
  notes?: string;
  inspection_days?: DayOfWeek[]; // Days of the week scheduled for inspection (BR-U13, BR-U14)
  is_active: boolean;     // Soft delete support (BR-15)
  created_at: string;
  updated_at: string;

  // Joined presentation fields
  category?: Category;
  unit?: Unit;
}

export type PriceChangeType = 'INCREASE' | 'DECREASE' | 'NO_CHANGE';

export interface PriceHistory {
  id: string;
  product_id: string;
  product_name?: string;
  version: number;
  old_purchase_price: number;
  new_purchase_price: number;
  old_selling_price: number;
  new_selling_price: number;
  change_type: PriceChangeType;
  reason: string;
  updated_by?: string;
  updated_by_name: string;
  created_at: string;
}

export type StockCheckStatus =
  | 'SUBMITTED'
  | 'EDIT_REQUESTED'
  | 'EDIT_APPROVED'
  | 'EDIT_REJECTED';

// User stock check submission (Preserves exact raw string - BR-11, BR-22, BR-U14)
export interface StockCheck {
  id: string;
  product_id: string;
  product_name?: string;
  user_id?: string;
  user_name: string;
  check_date: string; // ISO Date YYYY-MM-DD
  previous_stock: string; // Stored as TEXT (e.g. "120 pak")
  current_stock: string;  // Stored as TEXT (e.g. "180 pcs", "tinggal sedikit")
  note?: string;
  status: StockCheckStatus; // SUBMITTED, EDIT_REQUESTED, etc.
  edit_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface StockCheckEditRequest {
  id: string;
  stock_check_id: string;
  requested_by: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  created_at: string;
}
