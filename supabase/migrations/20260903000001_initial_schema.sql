-- ==============================================================================
-- HAIDAR PLASTIK MANAGEMENT PWA — INITIAL DATABASE SCHEMA
-- Migration: 20260903000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
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

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. UNITS TABLE
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE (Master Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Harga Modal (Admin only)
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

-- 5. INSPECTION SCHEDULES TABLE (Relational Weekday Schedules)
CREATE TABLE IF NOT EXISTS public.inspection_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_day UNIQUE (product_id, day_of_week)
);

-- 6. PRICE HISTORY TABLE (Audit Trail for Official Price Updates)
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

-- 7. STOCK CHECKS TABLE (Staff Physical Observations)
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

-- 8. EDIT REQUESTS TABLE (Staff Correction Requests)
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

-- 9. ACTIVITY LOGS TABLE (Comprehensive System Audit)
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
-- INDEXES FOR OPERATIONAL PERFORMANCE
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

-- Apply updated_at trigger to relevant tables
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
