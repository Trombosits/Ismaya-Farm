-- ============================================================================
-- Purchase module integrity
--
-- The live schema exposes the purchase line table as `purchase_item`
-- (singular), matching `sale_item`. Older local setups created by the initial
-- migration use `purchase_items`, so the block below normalises that name
-- first.
--
-- 1. `purchase_item.subtotal` is always derived from quantity * unit_price.
-- 2. `purchases.total_amount` is always the sum of its purchase_item subtotals.
-- 3. Supporting indexes, case-insensitive category names and non-negative
--    value checks.
--
-- Money values are never trusted from the UI: the database recalculates them
-- on every write.
-- ============================================================================

do $$
begin
  if to_regclass('public.purchase_item') is null
     and to_regclass('public.purchase_items') is not null then
    alter table public.purchase_items rename to purchase_item;
  end if;
end $$;

create or replace function public.recalculate_purchase_total(p_purchase_id bigint)
returns void
language plpgsql
as $$
begin
  update public.purchases p
  set total_amount = coalesce(
    (
      select sum(pi.subtotal)
      from public.purchase_item pi
      where pi.purchase_id = p_purchase_id
    ),
    0
  )
  where p.id = p_purchase_id;
end;
$$;

create or replace function public.purchase_item_set_subtotal()
returns trigger
language plpgsql
as $$
begin
  new.subtotal = round(new.quantity * new.unit_price, 2);
  return new;
end;
$$;

drop trigger if exists purchase_item_set_subtotal on public.purchase_item;
create trigger purchase_item_set_subtotal
before insert or update on public.purchase_item
for each row execute function public.purchase_item_set_subtotal();

create or replace function public.purchase_item_sync_purchase_total()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.purchase_id is distinct from new.purchase_id then
    perform public.recalculate_purchase_total(old.purchase_id);
    perform public.recalculate_purchase_total(new.purchase_id);
    return null;
  end if;

  perform public.recalculate_purchase_total(
    coalesce(new.purchase_id, old.purchase_id)
  );
  return null;
end;
$$;

drop trigger if exists purchase_item_sync_purchase_total on public.purchase_item;
create trigger purchase_item_sync_purchase_total
after insert or update or delete on public.purchase_item
for each row execute function public.purchase_item_sync_purchase_total();

-- Backfill existing rows so stored totals match the derived values.
update public.purchase_item
set subtotal = round(quantity * unit_price, 2)
where subtotal is distinct from round(quantity * unit_price, 2);

update public.purchases p
set total_amount = coalesce(
  (
    select sum(pi.subtotal)
    from public.purchase_item pi
    where pi.purchase_id = p.id
  ),
  0
);

-- Enforce sensible values for new writes without rejecting legacy rows.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'purchase_item_quantity_positive'
  ) then
    alter table public.purchase_item
      add constraint purchase_item_quantity_positive
      check (quantity > 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'purchase_item_unit_price_non_negative'
  ) then
    alter table public.purchase_item
      add constraint purchase_item_unit_price_non_negative
      check (unit_price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'purchases_total_amount_non_negative'
  ) then
    alter table public.purchases
      add constraint purchases_total_amount_non_negative
      check (total_amount >= 0) not valid;
  end if;
end $$;

create unique index if not exists purchase_categories_name_lower_key
  on public.purchase_categories (lower(name));

create index if not exists purchases_supplier_id_idx
  on public.purchases (supplier_id);

create index if not exists purchases_category_id_idx
  on public.purchases (category_id);

create index if not exists purchase_item_purchase_id_idx
  on public.purchase_item (purchase_id);

notify pgrst, 'reload schema';
