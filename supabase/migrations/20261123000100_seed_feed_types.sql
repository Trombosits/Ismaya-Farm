-- ============================================================================
-- Seed master data: Jenis pakan
--
-- Reference data for the feed module. Supplier rows come from
-- `20261119000100_seed_suppliers.sql`.
--
-- Safe to re-run: rows are inserted only when the name is missing.
-- ============================================================================

insert into public.feed_types (name, unit, minimum_stock, is_active)
select v.name, v.unit, v.minimum_stock, v.is_active
from (values
  ('Konsentrat Sapi',     'kg',     200::numeric, true),
  ('Hijauan Segar',       'karung',  50::numeric, true),
  ('Dedak Padi',          'kg',     150::numeric, true),
  ('Jagung Giling',       'kg',     300::numeric, true),
  ('Pakan Broiler BR-1',  'sak',     40::numeric, true),
  ('Pakan Layer L-1',     'sak',     20::numeric, true),
  ('Mineral Tambahan',    'kg',      20::numeric, false),
  ('Ampas Tahu',          'kg',     100::numeric, true)
) as v(name, unit, minimum_stock, is_active)
where not exists (
  select 1 from public.feed_types f where lower(f.name) = lower(v.name)
);

notify pgrst, 'reload schema';
