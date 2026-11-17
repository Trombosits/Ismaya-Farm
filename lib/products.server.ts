/**
 * Server-only product & sales data access.
 *
 * Never import this module from a Client Component ("use client") — it pulls in
 * `next/headers` through the Supabase server client. Only Server Components and
 * Server Actions may use it, passing the results down as props.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  ProductCategoryRow,
  ProductRow,
  SaleItemLivestockRow,
  SaleItemRow,
  SaleRow,
} from "@/lib/supabase/types";

import type {
  Product,
  ProductCategory,
  Sale,
  SaleDetail,
  SaleItem,
  SaleItemDetail,
  SaleItemLivestock,
} from "./products";

function mapCategory(row: ProductCategoryRow): ProductCategory {
  return {
    id: String(row.id),
    name: row.name,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: String(row.id),
    category_id: String(row.category_id),
    name: row.name,
    sku: row.sku,
    unit: row.unit,
    selling_price: Number(row.selling_price),
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapSale(row: SaleRow): Sale {
  return {
    id: String(row.id),
    invoice_number: row.invoice_number,
    sale_date: row.sale_date,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone ?? "",
    total_amount: Number(row.total_amount),
    notes: row.notes ?? "",
    created_at: row.created_at,
  };
}

function mapSaleItem(row: SaleItemRow): SaleItem {
  return {
    id: String(row.id),
    sale_id: String(row.sale_id),
    product_id: String(row.product_id),
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  };
}

function mapSaleItemLivestock(row: SaleItemLivestockRow): SaleItemLivestock {
  return {
    id: String(row.id),
    sale_item_id: String(row.sale_item_id),
    livestock_id: String(row.livestock_id),
  };
}

function parseId(id: number | string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function getProductCategoryList(): Promise<ProductCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat kategori produk: ${error.message}`);
  }

  return (data ?? []).map(mapCategory);
}

export async function getProductList(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat produk: ${error.message}`);
  }

  return (data ?? []).map(mapProduct);
}

export async function getSaleList(): Promise<Sale[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat penjualan: ${error.message}`);
  }

  return (data ?? []).map(mapSale);
}

export async function getSaleListWithItems(): Promise<SaleDetail[]> {
  const supabase = await createClient();

  const [salesResult, itemsResult, refsResult] = await Promise.all([
    supabase
      .from("sales")
      .select("*")
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("sale_item").select("*").order("id", { ascending: true }),
    supabase.from("sale_item_livestock").select("*"),
  ]);

  if (salesResult.error) {
    throw new Error(`Gagal memuat penjualan: ${salesResult.error.message}`);
  }
  if (itemsResult.error) {
    throw new Error(
      `Gagal memuat item penjualan: ${itemsResult.error.message}`,
    );
  }
  if (refsResult.error) {
    throw new Error(
      `Gagal memuat referensi ternak: ${refsResult.error.message}`,
    );
  }

  const refsByItem = new Map<string, string[]>();
  for (const row of refsResult.data ?? []) {
    const key = String(row.sale_item_id);
    const current = refsByItem.get(key) ?? [];
    current.push(String(row.livestock_id));
    refsByItem.set(key, current);
  }

  const itemsBySale = new Map<string, SaleItemDetail[]>();
  for (const row of itemsResult.data ?? []) {
    const item: SaleItemDetail = {
      ...mapSaleItem(row),
      livestock_ids: refsByItem.get(String(row.id)) ?? [],
    };
    const key = String(row.sale_id);
    const current = itemsBySale.get(key) ?? [];
    current.push(item);
    itemsBySale.set(key, current);
  }

  return (salesResult.data ?? []).map((row) => {
    const sale = mapSale(row);
    return { sale, items: itemsBySale.get(sale.id) ?? [] };
  });
}

export async function getSaleById(
  id: number | string,
): Promise<Sale | null> {
  const parsedId = parseId(id);
  if (parsedId === null) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", parsedId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat penjualan: ${error.message}`);
  }

  return data ? mapSale(data) : null;
}

export async function getSaleItems(
  saleId: number | string,
): Promise<SaleItem[]> {
  const parsedId = parseId(saleId);
  if (parsedId === null) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sale_item")
    .select("*")
    .eq("sale_id", parsedId)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat item penjualan: ${error.message}`);
  }

  return (data ?? []).map(mapSaleItem);
}

export async function getSaleItemLivestock(
  saleItemId: number | string,
): Promise<SaleItemLivestock[]> {
  const parsedId = parseId(saleItemId);
  if (parsedId === null) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sale_item_livestock")
    .select("*")
    .eq("sale_item_id", parsedId);

  if (error) {
    throw new Error(`Gagal memuat referensi ternak: ${error.message}`);
  }

  return (data ?? []).map(mapSaleItemLivestock);
}

export async function getSaleTotal(saleId: number | string): Promise<number> {
  const items = await getSaleItems(saleId);
  return items.reduce((total, item) => total + item.subtotal, 0);
}

export async function getSaleDetail(
  saleId: number | string,
): Promise<SaleDetail | null> {
  const sale = await getSaleById(saleId);
  if (!sale) return null;

  const items = await getSaleItems(sale.id);
  if (items.length === 0) {
    return { sale, items: [] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sale_item_livestock")
    .select("*")
    .in(
      "sale_item_id",
      items.map((item) => Number(item.id)),
    );

  if (error) {
    throw new Error(`Gagal memuat referensi ternak: ${error.message}`);
  }

  const byItem = new Map<string, string[]>();
  for (const row of data ?? []) {
    const key = String(row.sale_item_id);
    const current = byItem.get(key) ?? [];
    current.push(String(row.livestock_id));
    byItem.set(key, current);
  }

  return {
    sale,
    items: items.map((item) => ({
      ...item,
      livestock_ids: byItem.get(item.id) ?? [],
    })),
  };
}
