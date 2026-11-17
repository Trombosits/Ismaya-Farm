-- ============================================================================
-- Products & sales integrity
--
-- The live schema exposes the sale line table as `sale_item` (singular).
-- Older local setups created by the initial migration use `sale_items`, so the
-- block below normalises that name first.
--
-- 1. `sale_item.subtotal` is always derived from quantity * unit_price.
-- 2. `sales.total_amount` is always the sum of its sale_item subtotals.
-- 3. Supporting indexes and non-negative checks.
--
-- The UI never becomes the source of truth for money values: the database
-- recalculates them on every write.
-- ============================================================================

do $$
begin
  if to_regclass('public.sale_item') is null
     and to_regclass('public.sale_items') is not null then
    alter table public.sale_items rename to sale_item;
  end if;
end $$;

create or replace function public.recalculate_sale_total(p_sale_id bigint)
returns void
language plpgsql
as $$
begin
  update public.sales s
  set total_amount = coalesce(
    (
      select sum(si.subtotal)
      from public.sale_item si
      where si.sale_id = p_sale_id
    ),
    0
  )
  where s.id = p_sale_id;
end;
$$;

create or replace function public.sale_item_set_subtotal()
returns trigger
language plpgsql
as $$
begin
  new.subtotal = round(new.quantity * new.unit_price, 2);
  return new;
end;
$$;

drop trigger if exists sale_item_set_subtotal on public.sale_item;
create trigger sale_item_set_subtotal
before insert or update on public.sale_item
for each row execute function public.sale_item_set_subtotal();

create or replace function public.sale_item_sync_sale_total()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.sale_id is distinct from new.sale_id then
    perform public.recalculate_sale_total(old.sale_id);
    perform public.recalculate_sale_total(new.sale_id);
    return null;
  end if;

  perform public.recalculate_sale_total(coalesce(new.sale_id, old.sale_id));
  return null;
end;
$$;

drop trigger if exists sale_item_sync_sale_total on public.sale_item;
create trigger sale_item_sync_sale_total
after insert or update or delete on public.sale_item
for each row execute function public.sale_item_sync_sale_total();

-- Backfill existing rows so stored totals match the derived values.
update public.sale_item
set subtotal = round(quantity * unit_price, 2)
where subtotal is distinct from round(quantity * unit_price, 2);

update public.sales s
set total_amount = coalesce(
  (
    select sum(si.subtotal)
    from public.sale_item si
    where si.sale_id = s.id
  ),
  0
);

-- Enforce sensible values for new writes without rejecting legacy rows.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sale_item_quantity_positive'
  ) then
    alter table public.sale_item
      add constraint sale_item_quantity_positive
      check (quantity > 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sale_item_unit_price_non_negative'
  ) then
    alter table public.sale_item
      add constraint sale_item_unit_price_non_negative
      check (unit_price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_selling_price_non_negative'
  ) then
    alter table public.products
      add constraint products_selling_price_non_negative
      check (selling_price >= 0) not valid;
  end if;
end $$;

create index if not exists products_category_id_idx
  on public.products (category_id);

create unique index if not exists product_categories_name_lower_key
  on public.product_categories (lower(name));

create index if not exists sale_item_sale_id_idx
  on public.sale_item (sale_id);

create index if not exists sale_item_product_id_idx
  on public.sale_item (product_id);

create index if not exists sale_item_livestock_sale_item_id_idx
  on public.sale_item_livestock (sale_item_id);

notify pgrst, 'reload schema';
