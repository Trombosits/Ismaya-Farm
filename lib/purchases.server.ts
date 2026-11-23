/**
 * Server-only purchase data access.
 *
 * Never import this module from a Client Component ("use client") — it pulls in
 * `next/headers` through the Supabase server client. Only Server Components and
 * Server Actions may use it, passing the results down as props.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  PurchaseCategoryRow,
  PurchaseItemRow,
  PurchaseRow,
} from "@/lib/supabase/types";

import type {
  Purchase,
  PurchaseCategory,
  PurchaseDetail,
  PurchaseItem,
} from "./purchases";

function mapCategory(row: PurchaseCategoryRow): PurchaseCategory {
  return {
    id: String(row.id),
    name: row.name,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapPurchase(row: PurchaseRow): Purchase {
  return {
    id: String(row.id),
    purchase_date: row.purchase_date,
    supplier: row.supplier,
    category_id: String(row.category_id),
    total_amount: Number(row.total_amount),
    notes: row.notes ?? "",
    created_at: row.created_at,
  };
}

function mapItem(row: PurchaseItemRow): PurchaseItem {
  return {
    id: String(row.id),
    purchase_id: String(row.purchase_id),
    item_name: row.item_name,
    quantity: Number(row.quantity),
    unit: row.unit,
    unit_price: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  };
}

function parseId(id: number | string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function getPurchaseCategoryList(): Promise<PurchaseCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat kategori pembelian: ${error.message}`);
  }

  return (data ?? []).map(mapCategory);
}

export async function getPurchaseList(): Promise<Purchase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat pembelian: ${error.message}`);
  }

  return (data ?? []).map(mapPurchase);
}

export async function getPurchaseItems(
  purchaseId: number | string,
): Promise<PurchaseItem[]> {
  const parsedId = parseId(purchaseId);
  if (parsedId === null) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_item")
    .select("*")
    .eq("purchase_id", parsedId)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat item pembelian: ${error.message}`);
  }

  return (data ?? []).map(mapItem);
}

export async function getPurchaseById(
  id: number | string,
): Promise<Purchase | null> {
  const parsedId = parseId(id);
  if (parsedId === null) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", parsedId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat pembelian: ${error.message}`);
  }

  return data ? mapPurchase(data) : null;
}

export async function getPurchaseTotal(
  purchaseId: number | string,
): Promise<number> {
  const parsedId = parseId(purchaseId);
  if (parsedId === null) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("total_amount")
    .eq("id", parsedId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat total pembelian: ${error.message}`);
  }

  return Number(data?.total_amount ?? 0);
}

export async function getPurchaseDetail(
  id: number | string,
): Promise<PurchaseDetail | null> {
  const purchase = await getPurchaseById(id);
  if (!purchase) return null;

  const items = await getPurchaseItems(purchase.id);
  return { purchase, items };
}

export async function getPurchaseListWithItems(): Promise<PurchaseDetail[]> {
  const supabase = await createClient();

  const [purchasesResult, itemsResult] = await Promise.all([
    supabase
      .from("purchases")
      .select("*")
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("purchase_item")
      .select("*")
      .order("id", { ascending: true }),
  ]);

  if (purchasesResult.error) {
    throw new Error(
      `Gagal memuat pembelian: ${purchasesResult.error.message}`,
    );
  }
  if (itemsResult.error) {
    throw new Error(
      `Gagal memuat item pembelian: ${itemsResult.error.message}`,
    );
  }

  const itemsByPurchase = new Map<string, PurchaseItem[]>();
  for (const row of itemsResult.data ?? []) {
    const item = mapItem(row);
    const current = itemsByPurchase.get(item.purchase_id) ?? [];
    current.push(item);
    itemsByPurchase.set(item.purchase_id, current);
  }

  return (purchasesResult.data ?? []).map((row) => {
    const purchase = mapPurchase(row);
    return { purchase, items: itemsByPurchase.get(purchase.id) ?? [] };
  });
}
