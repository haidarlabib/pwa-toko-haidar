-- HAIDAR PLASTIK ADMIN MANAGEMENT PWA SCHEMA (v1.0)
-- Conforms strictly to PRD v1.0 Business Rules BR-01 through BR-16

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UNITS TABLE
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    symbol TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory TEXT,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    purchase_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
    current_price_version INTEGER NOT NULL DEFAULT 1,
    stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRICE HISTORY TABLE (Immutable audit trail per BR-05, BR-12)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    old_purchase_price NUMERIC(14, 2) NOT NULL,
    new_purchase_price NUMERIC(14, 2) NOT NULL,
    old_selling_price NUMERIC(14, 2) NOT NULL,
    new_selling_price NUMERIC(14, 2) NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('INCREASE', 'DECREASE', 'NO_CHANGE')),
    reason TEXT NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_by_name TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STOCK CHECKS TABLE (Preserves raw text inputs per BR-10, BR-11, BR-22)
CREATE TABLE IF NOT EXISTS stock_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_name TEXT NOT NULL DEFAULT 'User',
    previous_stock TEXT NOT NULL,
    current_stock TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ACTIVITY LOGS TABLE (Comprehensive audit trail per BR-14, BR-25)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    user_name TEXT NOT NULL DEFAULT 'Admin',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    description TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FUTURE USER ALERT / SEEN STATE (Supports BR-14, BR-15)
CREATE TABLE IF NOT EXISTS user_price_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    last_seen_version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- INDEXES FOR OPERATIONAL PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created ON price_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_checks_product ON stock_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_checks_created ON stock_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_price_views ENABLE ROW LEVEL SECURITY;

-- POLICIES (Admin has full access)
CREATE POLICY admin_all_users ON users FOR ALL USING (true);
CREATE POLICY admin_all_categories ON categories FOR ALL USING (true);
CREATE POLICY admin_all_units ON units FOR ALL USING (true);
CREATE POLICY admin_all_products ON products FOR ALL USING (true);
CREATE POLICY admin_all_price_history ON price_history FOR ALL USING (true);
CREATE POLICY admin_all_stock_checks ON stock_checks FOR ALL USING (true);
CREATE POLICY admin_all_activity_logs ON activity_logs FOR ALL USING (true);
CREATE POLICY admin_all_user_price_views ON user_price_views FOR ALL USING (true);
