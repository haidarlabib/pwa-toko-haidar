-- ==============================================================================
-- HAIDAR PLASTIK — COMPLETE SKU REMOVAL & DATA SCHEMA SIMPLIFICATION
-- Migration: 20260904000002_remove_sku_and_simplify_units.sql
-- ==============================================================================

-- 1. Drop SKU Triggers and Generator Function
DROP TRIGGER IF EXISTS trigger_generate_product_sku ON public.products;
DROP FUNCTION IF EXISTS public.generate_product_sku();
DROP SEQUENCE IF EXISTS public.product_sku_seq;

-- 2. Drop SKU column and indexes
DROP INDEX IF EXISTS idx_products_sku;
ALTER TABLE public.products DROP COLUMN IF EXISTS sku CASCADE;

-- 3. Recreate user_safe_products view without sku
DROP VIEW IF EXISTS public.user_safe_products CASCADE;
CREATE OR REPLACE VIEW public.user_safe_products AS
SELECT
  p.id,
  p.name,
  p.category_id,
  p.subcategory,
  p.unit_id,
  p.selling_price,
  p.current_price_version,
  p.stock,
  p.minimum_stock,
  p.image_url,
  p.notes,
  p.inspection_days,
  p.is_active,
  p.created_at,
  p.updated_at
FROM public.products p
WHERE p.is_active = true;

-- Grant permissions for authenticated and anon users on user_safe_products
GRANT SELECT ON public.user_safe_products TO authenticated, anon;

-- 4. Simplify Units table: make symbol optional
ALTER TABLE public.units ALTER COLUMN symbol DROP NOT NULL;

-- 5. Simplify Price History table: make reason optional
ALTER TABLE public.price_history ALTER COLUMN reason DROP NOT NULL;
