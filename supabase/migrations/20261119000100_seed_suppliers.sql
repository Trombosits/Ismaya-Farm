-- ============================================================================
-- Seed master data: Supplier
--
-- Suppliers are reference data required by the purchase and feed modules.
-- Safe to re-run: rows are inserted only when the name is missing.
-- ============================================================================

insert into public.suppliers (name)
select v.name
from (values
  ('CV Pakan Sejahtera'),
  ('UD Ternak Makmur'),
  ('PT Nutrisi Prima'),
  ('Toko Pakan Barokah'),
  ('Toko Bangunan Jaya'),
  ('Apotek Hewan Sehat')
) as v(name)
where not exists (
  select 1 from public.suppliers s where lower(s.name) = lower(v.name)
);

notify pgrst, 'reload schema';
