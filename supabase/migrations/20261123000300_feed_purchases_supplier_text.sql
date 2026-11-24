-- ============================================================================
-- Feed purchases: supplier sebagai teks bebas
--
-- Menyamakan perilaku dengan modul Pembelian: nama supplier diketik langsung
-- oleh pengguna, bukan dipilih dari master `suppliers`.
--
-- Baris lama di-backfill dari supplier yang sebelumnya dirujuk sebelum foreign
-- key dilepas. Tabel `suppliers` tetap ada karena masih dipakai modul lain.
--
-- Safe to re-run: setiap langkah memeriksa skema terlebih dahulu.
-- ============================================================================

alter table public.feed_purchases
  add column if not exists supplier varchar(150);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'feed_purchases'
      and column_name = 'supplier_id'
  ) then
    execute $sql$
      update public.feed_purchases fp
      set supplier = s.name
      from public.suppliers s
      where fp.supplier_id = s.id
        and (fp.supplier is null or btrim(fp.supplier) = '')
    $sql$;
  end if;
end $$;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'feed_purchases'
      and con.contype = 'f'
      and pg_get_constraintdef(con.oid) ilike '%suppliers%'
  loop
    execute format(
      'alter table public.feed_purchases drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.feed_purchases
  drop column if exists supplier_id;

-- Rows that still have no supplier name get a readable placeholder so the
-- column can be made NOT NULL.
update public.feed_purchases
set supplier = 'Tanpa supplier'
where supplier is null or btrim(supplier) = '';

alter table public.feed_purchases
  alter column supplier set not null;

create index if not exists feed_purchases_supplier_idx
  on public.feed_purchases (lower(supplier));

notify pgrst, 'reload schema';
