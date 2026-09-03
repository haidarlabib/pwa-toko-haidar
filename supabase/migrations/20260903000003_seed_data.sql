-- ==============================================================================
-- HAIDAR PLASTIK MANAGEMENT PWA — STARTER SEED DATA
-- Migration: 20260903000003_seed_data.sql
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, description, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Plastik HD', 'Kantong plastik High Density berbagai ukuran', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Plastik PP', 'Plastik bening Polypropylene tahan panas & dingin', TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Plastik PE', 'Plastik Polyethylene lentur & elastis', TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Kantong Kresek', 'Kantong kresek hitam, putih, dan warna', TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Cup & Botol Plastik', 'Gelas cup plastik dan botol kemasan minuman', TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Sedotan & Perlengkapan', 'Sedotan steril, bubble, dan perlengkapan toko', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 2. SEED UNITS
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

-- 3. SEED PRODUCTS
INSERT INTO public.products (
  id,
  sku,
  name,
  category_id,
  subcategory,
  unit_id,
  purchase_price,
  selling_price,
  price_version,
  stock,
  minimum_stock,
  notes,
  is_active
)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'HD-1530-TM',
    'Plastik HD 15x30 Tahan Minyak',
    'c1000000-0000-0000-0000-000000000001',
    '15x30',
    'u1000000-0000-0000-0000-000000000002',
    11500,
    14000,
    2,
    150,
    30,
    'Barang fast moving untuk gorengan & catering',
    TRUE
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'PP-1220-B',
    'Plastik PP Bening 12x20 Tebal 03',
    'c1000000-0000-0000-0000-000000000002',
    '12x20',
    'u1000000-0000-0000-0000-000000000002',
    9000,
    11500,
    1,
    80,
    20,
    'Kemasan kerupuk dan bumbu',
    TRUE
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'KR-24-HTM',
    'Kantong Kresek Hitam 24 (Sedang)',
    'c1000000-0000-0000-0000-000000000004',
    'Kresek 24',
    'u1000000-0000-0000-0000-000000000002',
    7500,
    9500,
    1,
    200,
    50,
    'Kresek umum ukuran sedang',
    TRUE
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'CUP-16-OVAL',
    'Cup Plastik 16 oz Oval Tebal',
    'c1000000-0000-0000-0000-000000000005',
    'Cup 16oz',
    'u1000000-0000-0000-0000-000000000003',
    210000,
    245000,
    1,
    15,
    5,
    'Isi 1000 pcs per dus (20 slop)',
    TRUE
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'SED-ST-STR',
    'Sedotan Steril Higienis Bungkus Kertas',
    'c1000000-0000-0000-0000-000000000006',
    'Sedotan Steril',
    'u1000000-0000-0000-0000-000000000002',
    13000,
    16000,
    1,
    45,
    15,
    'Panjang 20cm runcing steril',
    TRUE
  ),
  (
    'p1000000-0000-0000-0000-000000000006',
    'PE-1530-ES',
    'Plastik PE Bening Es Batu 15x30',
    'c1000000-0000-0000-0000-000000000003',
    '15x30',
    'u1000000-0000-0000-0000-000000000002',
    12000,
    15000,
    1,
    60,
    20,
    'Lentur tahan freezer tidak mudah pecah',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED INSPECTION SCHEDULES (Senin, Rabu, Kamis, Sabtu)
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

-- 5. SEED INITIAL PRICE HISTORY RECORD
INSERT INTO public.price_history (
  id,
  product_id,
  version,
  old_purchase_price,
  new_purchase_price,
  old_selling_price,
  new_selling_price,
  change_type,
  reason,
  updated_by_name
)
VALUES
  (
    'h1000000-0000-0000-0000-000000000001',
    'p1000000-0000-0000-0000-000000000001',
    2,
    10000,
    11500,
    13000,
    14000,
    'INCREASE',
    'Penyesuaian kenaikan harga bahan baku plastik HD dari pabrik supplier',
    'Admin Haidar'
  )
ON CONFLICT (id) DO NOTHING;
