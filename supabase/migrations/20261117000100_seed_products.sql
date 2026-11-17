-- ============================================================================
-- Seed master data: Kategori Produk + Produk
--
-- Idempotent: rows are inserted only when missing (category by name, product
-- by SKU). Sales transactions are intentionally NOT seeded — they must come
-- from real activity.
-- ============================================================================

insert into public.product_categories (name, is_active)
select v.name, v.is_active
from (values
  ('Telur', true),
  ('Daging', true),
  ('Susu & Olahan', true),
  ('Pupuk & Kompos', true),
  ('Ternak Hidup', true),
  ('Hasil Olahan', false)
) as v(name, is_active)
where not exists (
  select 1
  from public.product_categories pc
  where lower(pc.name) = lower(v.name)
);

insert into public.products (category_id, name, sku, unit, selling_price, is_active)
select pc.id, v.name, v.sku, v.unit, v.selling_price, v.is_active
from (values
  ('Telur', 'Telur Ayam', 'EGG-001', 'kg', 30000, true),
  ('Telur', 'Telur Bebek', 'EGG-002', 'kg', 42000, true),
  ('Telur', 'Telur Puyuh', 'EGG-003', 'kg', 55000, true),
  ('Daging', 'Kambing Potong', 'MEA-001', 'ekor', 3500000, true),
  ('Daging', 'Sapi Potong', 'MEA-002', 'ekor', 18000000, true),
  ('Daging', 'Ayam Broiler', 'MEA-003', 'ekor', 45000, true),
  ('Susu & Olahan', 'Susu Kambing Segar', 'MLK-001', 'liter', 35000, true),
  ('Pupuk & Kompos', 'Pupuk Kompos', 'FRT-001', 'karung', 25000, true),
  ('Ternak Hidup', 'Anak Ayam DOC', 'LIV-001', 'ekor', 8000, true),
  ('Ternak Hidup', 'Kambing Bibit', 'LIV-002', 'ekor', 3000000, false),
  ('Hasil Olahan', 'Keju Olahan', 'OLV-001', 'kg', 120000, false)
) as v(category_name, name, sku, unit, selling_price, is_active)
join public.product_categories pc
  on lower(pc.name) = lower(v.category_name)
where not exists (
  select 1 from public.products p where p.sku = v.sku
);

notify pgrst, 'reload schema';
