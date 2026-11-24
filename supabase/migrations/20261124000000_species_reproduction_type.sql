-- ============================================================================
-- Jenis ternak: cara reproduksi
--
-- Setiap jenis ternak diklasifikasikan berdasarkan cara berkembang biak:
-- bertelur (LAY_EGG) atau melahirkan (GIVE_BIRTH).
--
-- Safe to re-run: the enum is created only when missing and the backfill only
-- touches rows that still have no value.
-- ============================================================================

do $$
begin
  create type public.reproduction_type_enum as enum ('LAY_EGG', 'GIVE_BIRTH');
exception
  when duplicate_object then null;
end $$;

alter table public.livestock_species
  add column if not exists reproduction_types public.reproduction_type_enum;

update public.livestock_species as species
set reproduction_types = v.reproduction_types
from (values
  ('AYM', 'LAY_EGG'::public.reproduction_type_enum),
  ('BBK', 'LAY_EGG'::public.reproduction_type_enum),
  ('ITK', 'LAY_EGG'::public.reproduction_type_enum),
  ('AGS', 'LAY_EGG'::public.reproduction_type_enum),
  ('PYH', 'LAY_EGG'::public.reproduction_type_enum),
  ('KLK', 'LAY_EGG'::public.reproduction_type_enum),
  ('KMB', 'GIVE_BIRTH'::public.reproduction_type_enum),
  ('SPI', 'GIVE_BIRTH'::public.reproduction_type_enum),
  ('DMB', 'GIVE_BIRTH'::public.reproduction_type_enum),
  ('KLC', 'GIVE_BIRTH'::public.reproduction_type_enum),
  ('KDA', 'GIVE_BIRTH'::public.reproduction_type_enum),
  ('BBI', 'GIVE_BIRTH'::public.reproduction_type_enum)
) as v(code, reproduction_types)
where species.code = v.code
  and species.reproduction_types is null;

notify pgrst, 'reload schema';
