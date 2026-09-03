-- ==============================================================================
-- HAIDAR PLASTIK MANAGEMENT PWA — FULL POSTGRESQL SCHEMA & RLS
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/bwjqsnhpapjazigiiwje/sql)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. UNITS TABLE
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS TABLE (Master Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Harga Modal (Admin only - protected from User)
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,  -- Harga Jual Resmi
  price_version INTEGER NOT NULL DEFAULT 1,          -- Increments ONLY on official price update
  stock NUMERIC(12, 2) NOT NULL DEFAULT 0,          -- Official system stock
  minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INSPECTION SCHEDULES TABLE (Relational Weekday Schedules)
CREATE TABLE IF NOT EXISTS public.inspection_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_day UNIQUE (product_id, day_of_week)
);

-- 7. PRICE HISTORY TABLE (Audit Trail for Official Price Updates)
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  old_purchase_price NUMERIC(12, 2) NOT NULL,
  new_purchase_price NUMERIC(12, 2) NOT NULL,
  old_selling_price NUMERIC(12, 2) NOT NULL,
  new_selling_price NUMERIC(12, 2) NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('INCREASE', 'DECREASE', 'NO_CHANGE')) DEFAULT 'NO_CHANGE',
  reason TEXT NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. STOCK CHECKS TABLE (Staff Physical Observations)
CREATE TABLE IF NOT EXISTS public.stock_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  check_date DATE NOT NULL,
  previous_stock TEXT NOT NULL, -- Stored as raw text (e.g. "120 pak")
  current_stock TEXT NOT NULL,  -- Stored as raw text (e.g. "180 pcs")
  note TEXT,
  status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'EDIT_REQUESTED', 'EDIT_APPROVED', 'EDIT_REJECTED')) DEFAULT 'SUBMITTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EDIT REQUESTS TABLE (Staff Correction Requests)
CREATE TABLE IF NOT EXISTS public.edit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_check_id UUID NOT NULL REFERENCES public.stock_checks(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requested_by_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ACTIVITY LOGS TABLE (Comprehensive System Audit)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  description TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR OPERATIONAL SPEED
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_schedules_product_day ON public.inspection_schedules(product_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON public.price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_checks_date ON public.stock_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_stock_checks_product ON public.stock_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_edit_requests_status ON public.edit_requests(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ==============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_units_updated_at ON public.units;
CREATE TRIGGER set_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_schedules_updated_at ON public.inspection_schedules;
CREATE TRIGGER set_schedules_updated_at BEFORE UPDATE ON public.inspection_schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_stock_checks_updated_at ON public.stock_checks;
CREATE TRIGGER set_stock_checks_updated_at BEFORE UPDATE ON public.stock_checks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_edit_requests_updated_at ON public.edit_requests;
CREATE TRIGGER set_edit_requests_updated_at BEFORE UPDATE ON public.edit_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- AUTH PROFILE AUTO-CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SAFE STAFF VIEW (Excludes purchase_price completely per PRD Security Rule)
-- ==============================================================================
CREATE OR REPLACE VIEW public.user_safe_products AS
SELECT
  p.id,
  p.sku,
  p.name,
  p.category_id,
  p.subcategory,
  p.unit_id,
  p.selling_price,
  p.price_version,
  p.stock,
  p.minimum_stock,
  p.image_url,
  p.notes,
  p.is_active,
  p.created_at,
  p.updated_at,
  c.name AS category_name,
  u.symbol AS unit_symbol,
  u.name AS unit_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.units u ON p.unit_id = u.id
WHERE p.is_active = TRUE;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Categories policies
CREATE POLICY "Categories are readable by authenticated users" ON public.categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Categories are manageable only by Admin" ON public.categories FOR ALL TO authenticated USING (public.is_admin());

-- Units policies
CREATE POLICY "Units are readable by authenticated users" ON public.units FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Units are manageable only by Admin" ON public.units FOR ALL TO authenticated USING (public.is_admin());

-- Products policies
CREATE POLICY "Products full access for Admin" ON public.products FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Products read access for Staff" ON public.products FOR SELECT TO authenticated USING (is_active = TRUE);

-- Inspection schedules policies
CREATE POLICY "Inspection schedules readable by all authenticated" ON public.inspection_schedules FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Inspection schedules manageable only by Admin" ON public.inspection_schedules FOR ALL TO authenticated USING (public.is_admin());

-- Price history policies
CREATE POLICY "Price history readable by all authenticated" ON public.price_history FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Price history insertable only by Admin" ON public.price_history FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Stock checks policies
CREATE POLICY "Stock checks readable by all authenticated" ON public.stock_checks FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Stock checks insertable by Staff" ON public.stock_checks FOR INSERT TO authenticated WITH CHECK (status = 'SUBMITTED' AND (auth.uid() = user_id OR user_id IS NULL));
CREATE POLICY "Stock checks manageable by Admin" ON public.stock_checks FOR ALL TO authenticated USING (public.is_admin());

-- Edit requests policies
CREATE POLICY "Edit requests readable by all authenticated" ON public.edit_requests FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Staff can submit edit requests" ON public.edit_requests FOR INSERT TO authenticated WITH CHECK (status = 'PENDING' AND (auth.uid() = requested_by OR requested_by IS NULL));
CREATE POLICY "Edit requests manageable by Admin" ON public.edit_requests FOR ALL TO authenticated USING (public.is_admin());

-- Activity logs policies
CREATE POLICY "Activity logs readable only by Admin" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Activity logs insertable by authenticated actions" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ==============================================================================
-- STARTER SEED DATA
-- ==============================================================================
INSERT INTO public.categories (id, name, description, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Plastik HD', 'Kantong plastik High Density berbagai ukuran', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Plastik PP', 'Plastik bening Polypropylene tahan panas & dingin', TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Plastik PE', 'Plastik Polyethylene lentur & elastis', TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Kantong Kresek', 'Kantong kresek hitam, putih, dan warna', TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Cup & Botol Plastik', 'Gelas cup plastik dan botol kemasan minuman', TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Sedotan & Perlengkapan', 'Sedotan steril, bubble, dan perlengkapan toko', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.units (id, name, symbol, is_active)
VALUES
  ('u1000000-0000-0000-0000-000000000001', 'Pieces', 'PCS', TRUE),
  ('u1000000-0000-0000-0000-000000000002', 'Pack', 'PACK', TRUE),
  ('u1000000-0000-0000-0000-000000000003', 'Dus / Karton', 'DUS', TRUE),
  ('u1000000-0000-0000-0000-000000000004', 'Kilogram', 'KG', TRUE),
  ('u1000000-0000-0000-0000-000000000005', 'Lusin', 'LUSIN', TRUE),
  ('u1000000-0000-0000-0000-000000000006', 'Roll / Gulung', 'ROLL', TRUE),
  ('u1000000-0000-0000-0000-000000000007', 'Ikat', 'IKAT', TRUE)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO public.products (
  id, sku, name, category_id, subcategory, unit_id,
  purchase_price, selling_price, price_version, stock, minimum_stock, notes, is_active
)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'HD-1530-TM', 'Plastik HD 15x30 Tahan Minyak', 'c1000000-0000-0000-0000-000000000001', '15x30', 'u1000000-0000-0000-0000-000000000002', 11500, 14000, 2, 150, 30, 'Barang fast moving untuk gorengan & catering', TRUE),
  ('p1000000-0000-0000-0000-000000000002', 'PP-1220-B', 'Plastik PP Bening 12x20 Tebal 03', 'c1000000-0000-0000-0000-000000000002', '12x20', 'u1000000-0000-0000-0000-000000000002', 9000, 11500, 1, 80, 20, 'Kemasan kerupuk dan bumbu', TRUE),
  ('p1000000-0000-0000-0000-000000000003', 'KR-24-HTM', 'Kantong Kresek Hitam 24 (Sedang)', 'c1000000-0000-0000-0000-000000000004', 'Kresek 24', 'u1000000-0000-0000-0000-000000000002', 7500, 9500, 1, 200, 50, 'Kresek umum ukuran sedang', TRUE),
  ('p1000000-0000-0000-0000-000000000004', 'CUP-16-OVAL', 'Cup Plastik 16 oz Oval Tebal', 'c1000000-0000-0000-0000-000000000005', 'Cup 16oz', 'u1000000-0000-0000-0000-000000000003', 210000, 245000, 1, 15, 5, 'Isi 1000 pcs per dus (20 slop)', TRUE),
  ('p1000000-0000-0000-0000-000000000005', 'SED-ST-STR', 'Sedotan Steril Higienis Bungkus Kertas', 'c1000000-0000-0000-0000-000000000006', 'Sedotan Steril', 'u1000000-0000-0000-0000-000000000002', 13000, 16000, 1, 45, 15, 'Panjang 20cm runcing steril', TRUE),
  ('p1000000-0000-0000-0000-000000000006', 'PE-1530-ES', 'Plastik PE Bening Es Batu 15x30', 'c1000000-0000-0000-0000-000000000003', '15x30', 'u1000000-0000-0000-0000-000000000002', 12000, 15000, 1, 60, 20, 'Lentur tahan freezer tidak mudah pecah', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inspection_schedules (product_id, day_of_week)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Senin'),
  ('p1000000-0000-0000-0000-000000000001', 'Rabu'),
  ('p1000000-0000-0000-0000-000000000001', 'Kamis'),
  ('p1000000-0000-0000-0000-000000000001', 'Sabtu'),
  ('p1000000-0000-0000-0000-000000000002', 'Senin'),
  ('p1000000-0000-0000-0000-000000000002', 'Kamis'),
  ('p1000000-0000-0000-0000-000000000003', 'Senin'),
  ('p1000000-0000-0000-0000-000000000003', 'Rabu'),
  ('p1000000-0000-0000-0000-000000000003', 'Kamis'),
  ('p1000000-0000-0000-0000-000000000003', 'Jumat'),
  ('p1000000-0000-0000-0000-000000000003', 'Sabtu'),
  ('p1000000-0000-0000-0000-000000000004', 'Kamis'),
  ('p1000000-0000-0000-0000-000000000004', 'Sabtu'),
  ('p1000000-0000-0000-0000-000000000005', 'Selasa'),
  ('p1000000-0000-0000-0000-000000000005', 'Kamis'),
  ('p1000000-0000-0000-0000-000000000006', 'Senin'),
  ('p1000000-0000-0000-0000-000000000006', 'Kamis')
ON CONFLICT (product_id, day_of_week) DO NOTHING;
