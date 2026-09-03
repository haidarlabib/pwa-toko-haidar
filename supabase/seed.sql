-- SEED DATA FOR HAIDAR PLASTIK (v1.0)
-- Conforms strictly to operational business rules

-- 1. Insert Initial Admin & User
INSERT INTO users (id, name, email, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'Admin Haidar', 'admin@haidarplastik.com', 'ADMIN'),
('a0000000-0000-0000-0000-000000000002', 'Staff Toko A', 'staff.a@haidarplastik.com', 'USER'),
('a0000000-0000-0000-0000-000000000003', 'Staff Toko B', 'staff.b@haidarplastik.com', 'USER')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Categories
INSERT INTO categories (id, name, description, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Plastik HD', 'Kantong plastik bahan High Density untuk belanjaan dan beban berat', true),
('c0000000-0000-0000-0000-000000000002', 'Kantong Kresek', 'Kresek bening, hitam, dan aneka warna untuk kemasan umum', true),
('c0000000-0000-0000-0000-000000000003', 'Cup & Gelas Plastik', 'Gelas cup minuman dingin, oval, datar, bahan PP dan PET', true),
('c0000000-0000-0000-0000-000000000004', 'Botol Plastik', 'Botol kale, almond, pir, dan aneka kemasan minuman', true),
('c0000000-0000-0000-0000-000000000005', 'Sedotan Plastik', 'Sedotan steril, boba, ulir, lurus, dan lancip', true),
('c0000000-0000-0000-0000-000000000006', 'Mika & Wadah Makanan', 'Mika bento, mika kue, thinwall, dan mangkok plastik', true)
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Units
INSERT INTO units (id, name, symbol, is_active) VALUES
('u0000000-0000-0000-0000-000000000001', 'Pieces', 'PCS', true),
('u0000000-0000-0000-0000-000000000002', 'Pack', 'PACK', true),
('u0000000-0000-0000-0000-000000000003', 'Dus / Karton', 'DUS', true),
('u0000000-0000-0000-0000-000000000004', 'Kilogram', 'KG', true),
('u0000000-0000-0000-0000-000000000005', 'Roll / Gulung', 'ROLL', true),
('u0000000-0000-0000-0000-000000000006', 'Lusin', 'LSN', true)
ON CONFLICT (name) DO NOTHING;

-- 4. Insert Products
INSERT INTO products (id, sku, name, category_id, subcategory, unit_id, purchase_price, selling_price, current_price_version, stock, minimum_stock, notes, is_active) VALUES
('p0000000-0000-0000-0000-000000000001', 'HP-PLS-0001', 'Plastik HD 15x30 Bening', 'c0000000-0000-0000-0000-000000000001', 'HD Bening', 'u0000000-0000-0000-0000-000000000002', 12000, 14000, 4, 120, 25, 'Kemasan 1 pack isi 100 lembar. Kuat untuk frozen food.', true),
('p0000000-0000-0000-0000-000000000002', 'HP-PLS-0002', 'Plastik HD 20x35 Tebal', 'c0000000-0000-0000-0000-000000000001', 'HD Tebal', 'u0000000-0000-0000-0000-000000000002', 15500, 18000, 2, 85, 20, 'Bahan tebal 0.04 mm, tidak mudah sobek.', true),
('p0000000-0000-0000-0000-000000000003', 'HP-KRS-0001', 'Kresek Bening 24x40 Halus', 'c0000000-0000-0000-0000-000000000002', 'Kresek Bening', 'u0000000-0000-0000-0000-000000000002', 9000, 11000, 1, 15, 30, 'Stok menipis, segera restock dari agen Cikarang.', true),
('p0000000-0000-0000-0000-000000000004', 'HP-CUP-0001', 'Cup Oval 16oz PP Tebal', 'c0000000-0000-0000-0000-000000000003', 'Cup Oval', 'u0000000-0000-0000-0000-000000000003', 185000, 215000, 3, 40, 10, '1 dus isi 1000 pcs (20 roll x 50 pcs). Bisa diseal.', true),
('p0000000-0000-0000-0000-000000000005', 'HP-CUP-0002', 'Cup Datar 22oz PP Jumbo', 'c0000000-0000-0000-0000-000000000003', 'Cup Datar', 'u0000000-0000-0000-0000-000000000003', 210000, 240000, 1, 0, 8, 'Habis, pesanan supplier sedang di perjalanan.', true),
('p0000000-0000-0000-0000-000000000006', 'HP-BTL-0001', 'Botol Kale 250ml Tutup Hitam', 'c0000000-0000-0000-0000-000000000004', 'Botol Kale', 'u0000000-0000-0000-0000-000000000002', 42000, 52000, 2, 60, 15, '1 pack isi 50 botol + tutup segel.', true),
('p0000000-0000-0000-0000-000000000007', 'HP-SDT-0001', 'Sedotan Boba 12mm Steril Hitam', 'c0000000-0000-0000-0000-000000000005', 'Sedotan Boba', 'u0000000-0000-0000-0000-000000000002', 11500, 14500, 1, 95, 20, 'Ujung runcing, dibungkus plastik satu per satu.', true),
('p0000000-0000-0000-0000-000000000008', 'HP-MIK-0001', 'Thinwall Persegi 650ml', 'c0000000-0000-0000-0000-000000000006', 'Thinwall', 'u0000000-0000-0000-0000-000000000002', 32000, 38000, 1, 110, 25, 'Food grade, microwaveable, 1 pack isi 25 set wadah+tutup.', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Price History (Demonstrating v1 -> v4 for Plastik HD 15x30)
INSERT INTO price_history (id, product_id, version, old_purchase_price, new_purchase_price, old_selling_price, new_selling_price, change_type, reason, updated_by, updated_by_name, created_at) VALUES
('h0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 2, 10000, 11000, 12000, 13000, 'INCREASE', 'Kenaikan bahan baku biji plastik dari pabrik', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', now() - INTERVAL '60 days'),
('h0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 3, 11000, 11500, 13000, 13500, 'INCREASE', 'Penyesuaian tarif ongkos kirim distributor', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', now() - INTERVAL '30 days'),
('h0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 4, 11500, 12000, 13500, 14000, 'INCREASE', 'Harga supplier naik per awal bulan', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', now() - INTERVAL '2 days'),
('h0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000004', 2, 175000, 190000, 205000, 220000, 'INCREASE', 'Kenaikan harga karton supplier Surabaya', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', now() - INTERVAL '20 days'),
('h0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000004', 3, 190000, 185000, 220000, 215000, 'DECREASE', 'Diskon promo volume dari pabrik cup', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', now() - INTERVAL '5 days');

-- 6. Insert User Stock Check Submissions (Raw TEXT per BR-10, BR-11, BR-22)
INSERT INTO stock_checks (id, product_id, user_id, user_name, previous_stock, current_stock, note, created_at) VALUES
('s0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Staff Toko A', '120 pak', '180 pcs', 'masih ada banyak di rak belakang bagian atas', now() - INTERVAL '1 day'),
('s0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Staff Toko B', '30 pack', '15 pack', 'tinggal sedikit di etalase depan', now() - INTERVAL '6 hours'),
('s0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Staff Toko A', '50 dus', '3 dus + 20 pcs', 'kondisi kardus luar ada yang basah sedikit', now() - INTERVAL '3 hours');

-- 7. Insert Activity Logs
INSERT INTO activity_logs (id, user_id, user_name, action, entity_type, entity_id, description, old_data, new_data, created_at) VALUES
('l0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', 'CREATE_PRODUCT', 'PRODUCT', 'p0000000-0000-0000-0000-000000000001', 'Admin menambahkan barang baru: Plastik HD 15x30 Bening', NULL, '{"name": "Plastik HD 15x30 Bening", "price_version": 1, "selling_price": 12000}'::jsonb, now() - INTERVAL '65 days'),
('l0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', 'EDIT_PRODUCT', 'PRODUCT', 'p0000000-0000-0000-0000-000000000001', 'Admin mengubah catatan dan satuan barang', '{"unit": "PCS"}'::jsonb, '{"unit": "PACK"}'::jsonb, now() - INTERVAL '40 days'),
('l0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Admin Haidar', 'UPDATE_PRICE', 'PRICE', 'p0000000-0000-0000-0000-000000000001', 'Admin melakukan update harga Plastik HD 15x30 Bening (v3 -> v4: Rp13.500 -> Rp14.000)', '{"selling_price": 13500, "purchase_price": 11500, "version": 3}'::jsonb, '{"selling_price": 14000, "purchase_price": 12000, "version": 4, "reason": "Harga supplier naik per awal bulan"}'::jsonb, now() - INTERVAL '2 days');
