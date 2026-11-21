-- ============================================================================
-- Purchases: supplier as free-text column
--
-- The Pembelian module no longer references the `suppliers` master table.
-- `purchases.supplier` stores the supplier name typed directly by the user.
--
-- Existing rows are backfilled from the supplier they pointed to before the
-- foreign key is dropped. The `suppliers` table itself is left in place because
-- the feed module still references it.
--
-- Safe to re-run: every step checks the current schema first.
-- ============================================================================

alter table public.purchases
  add column if not exists supplier varchar(150);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'purchases'
      and column_name = 'supplier_id'
  ) then
    execute $sql$
      update public.purchases p
      set supplier = s.name
      from public.suppliers s
      where p.supplier_id = s.id
        and (p.supplier is null or btrim(p.supplier) = '')
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
      and rel.relname = 'purchases'
      and con.contype = 'f'
      and pg_get_constraintdef(con.oid) ilike '%suppliers%'
  loop
    execute format(
      'alter table public.purchases drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

drop index if exists public.purchases_supplier_id_idx;

alter table public.purchases
  drop column if exists supplier_id;

alter table public.purchases
  alter column supplier set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'purchases_supplier_not_blank'
  ) then
    alter table public.purchases
      add constraint purchases_supplier_not_blank
      check (btrim(supplier) <> '') not valid;
  end if;
end $$;

create index if not exists purchases_supplier_idx
  on public.purchases (lower(supplier));

notify pgrst, 'reload schema';
