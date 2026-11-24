-- ============================================================================
-- Livestock: tanggal lahir & data perolehan menjadi opsional
--
-- Form Data Ternak membolehkan "Tanggal Lahir", "Tanggal Perolehan", dan
-- "Cara Perolehan" dikosongkan. Kolomnya karena itu harus nullable.
--
-- `acquisition_type` tetap memakai check constraint yang sama: nilai NULL
-- lolos check, sedangkan nilai lain tetap dibatasi ke born/purchased/gift.
--
-- Safe to re-run: `drop not null` bersifat idempoten.
-- ============================================================================

alter table public.livestock
  alter column birth_date drop not null,
  alter column acquisition_date drop not null,
  alter column acquisition_type drop not null;

notify pgrst, 'reload schema';
