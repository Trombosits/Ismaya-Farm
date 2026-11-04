-- ============================================================================
-- Seed reference data (Jenis Ternak + Ras Ternak)
-- Mirrors the frontend mock lists so the wired pages are pre-populated.
-- Safe to re-run (inserts only when the row is missing).
-- ============================================================================

insert into public.livestock_species (name, code)
select v.name, v.code
from (values
  ('Kambing', 'KMB'),
  ('Ayam', 'AYM'),
  ('Bebek', 'BBK'),
  ('Sapi', 'SPI'),
  ('Domba', 'DMB'),
  ('Itik', 'ITK'),
  ('Angsa', 'AGS'),
  ('Puyuh', 'PYH'),
  ('Kelinci', 'KLC'),
  ('Kalkun', 'KLK'),
  ('Kuda', 'KDA'),
  ('Babi', 'BBI')
) as v(name, code)
where not exists (
  select 1 from public.livestock_species s where s.code = v.code
);

insert into public.livestock_breeds (species_id, name, code)
select s.id, v.name, v.code
from (values
  ('KMB', 'Etawa', 'ETW'),
  ('KMB', 'Jawa Randu', 'JWR'),
  ('KMB', 'Boer', 'BOR'),
  ('KMB', 'Saanen', 'SAN'),
  ('AYM', 'Broiler', 'BRL'),
  ('AYM', 'Layer', 'LYR'),
  ('AYM', 'Kampung', 'KMP'),
  ('AYM', 'Brahma', 'BRH'),
  ('BBK', 'Peking', 'PEK'),
  ('BBK', 'Mojosari', 'MJR'),
  ('SPI', 'Limousin', 'LMS'),
  ('SPI', 'Brahman', 'BRM'),
  ('SPI', 'Friesian Holstein', 'FHL'),
  ('DMB', 'Merino', 'MRN'),
  ('DMB', 'Garut', 'GRT'),
  ('PYH', 'Coturnix', 'CTQ'),
  ('KLC', 'Rex', 'REX'),
  ('KLC', 'Angora', 'ANG')
) as v(species_code, name, code)
join public.livestock_species s on s.code = v.species_code
where not exists (
  select 1 from public.livestock_breeds b
  where b.species_id = s.id and b.code = v.code
);
