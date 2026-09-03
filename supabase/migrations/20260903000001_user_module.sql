-- HAIDAR PLASTIK USER MODULE MIGRATION (v1.0)
-- Adds username, inspection schedules, and stock check edit request workflow

-- 1. Add username to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

UPDATE users SET username = 'admin' WHERE email = 'admin@haidarplastik.com';
UPDATE users SET username = 'ahmad' WHERE email = 'staff.a@haidarplastik.com';
UPDATE users SET username = 'budi' WHERE email = 'staff.b@haidarplastik.com';

-- 2. Add inspection_days to products table (Stores array of days in Indonesian, e.g. ["Senin", "Rabu", "Sabtu"])
ALTER TABLE products ADD COLUMN IF NOT EXISTS inspection_days JSONB DEFAULT '["Senin", "Rabu", "Sabtu"]'::jsonb;

-- 3. Add status, check_date, and edit request fields to stock_checks
ALTER TABLE stock_checks ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'EDIT_REQUESTED', 'EDIT_APPROVED', 'EDIT_REJECTED'));
ALTER TABLE stock_checks ADD COLUMN IF NOT EXISTS check_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE stock_checks ADD COLUMN IF NOT EXISTS edit_reason TEXT;
ALTER TABLE stock_checks ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE stock_checks ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 4. Create dedicated stock_check_edit_requests table for audit trail
CREATE TABLE IF NOT EXISTS stock_check_edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_check_id UUID NOT NULL REFERENCES stock_checks(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    reason TEXT NOT NULL,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_stock_checks_status ON stock_checks(status);
CREATE INDEX IF NOT EXISTS idx_stock_checks_date ON stock_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_stock_checks_user ON stock_checks(user_id);
