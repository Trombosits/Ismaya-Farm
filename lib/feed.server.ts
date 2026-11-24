/**
 * Server-only feed data access.
 *
 * Never import this module from a Client Component ("use client") — it pulls in
 * `next/headers` through the Supabase server client. Only Server Components and
 * Server Actions may use it, passing the results down as props.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  FeedInventoryTransactionRow,
  FeedPurchaseItemRow,
  FeedPurchaseRow,
  FeedTypeRow,
} from "@/lib/supabase/types";

import type {
  FeedInventoryTransaction,
  FeedPurchase,
  FeedPurchaseDetail,
  FeedPurchaseItem,
  FeedReferenceType,
  FeedType,
  InventoryTransactionType,
} from "./feed";

function mapFeedType(row: FeedTypeRow): FeedType {
  return {
    id: String(row.id),
    name: row.name,
    unit: row.unit,
    minimum_stock: Number(row.minimum_stock),
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapPurchase(row: FeedPurchaseRow): FeedPurchase {
  return {
    id: String(row.id),
    purchase_date: row.purchase_date,
    supplier: row.supplier ?? "",
    invoice_number: row.invoice_number ?? "",
    notes: row.notes ?? "",
    created_at: row.created_at,
  };
}

function mapPurchaseItem(row: FeedPurchaseItemRow): FeedPurchaseItem {
  return {
    id: String(row.id),
    purchase_id: String(row.purchase_id),
    feed_type_id: String(row.feed_type_id),
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  };
}

function mapTransaction(row: FeedInventoryTransactionRow): FeedInventoryTransaction {
  return {
    id: String(row.id),
    feed_type_id: String(row.feed_type_id),
    transaction_type: row.transaction_type as InventoryTransactionType,
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price ?? 0),
    transaction_date: row.transaction_date,
    reference_type: row.reference_type as FeedReferenceType,
    reference_id:
      row.reference_id !== null && row.reference_id !== undefined
        ? String(row.reference_id)
        : null,
    notes: row.notes ?? "",
    created_at: row.created_at,
  };
}

function parseId(id: number | string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function getFeedTypeList(): Promise<FeedType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat jenis pakan: ${error.message}`);
  }

  return (data ?? []).map(mapFeedType);
}

export async function getFeedPurchaseList(): Promise<FeedPurchase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_purchases")
    .select("*")
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat pembelian pakan: ${error.message}`);
  }

  return (data ?? []).map(mapPurchase);
}

export async function getFeedPurchaseItems(
  purchaseId: number | string,
): Promise<FeedPurchaseItem[]> {
  const parsedId = parseId(purchaseId);
  if (parsedId === null) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_purchases_items")
    .select("*")
    .eq("purchase_id", parsedId)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat item pembelian pakan: ${error.message}`);
  }

  return (data ?? []).map(mapPurchaseItem);
}

export async function getFeedPurchaseListWithItems(): Promise<
  FeedPurchaseDetail[]
> {
  const supabase = await createClient();
  const [purchasesResult, itemsResult] = await Promise.all([
    supabase
      .from("feed_purchases")
      .select("*")
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("feed_purchases_items").select("*").order("id", {
      ascending: true,
    }),
  ]);

  if (purchasesResult.error) {
    throw new Error(
      `Gagal memuat pembelian pakan: ${purchasesResult.error.message}`,
    );
  }
  if (itemsResult.error) {
    throw new Error(
      `Gagal memuat item pembelian pakan: ${itemsResult.error.message}`,
    );
  }

  const itemsByPurchase = new Map<string, FeedPurchaseItem[]>();
  for (const row of itemsResult.data ?? []) {
    const item = mapPurchaseItem(row);
    const current = itemsByPurchase.get(item.purchase_id) ?? [];
    current.push(item);
    itemsByPurchase.set(item.purchase_id, current);
  }

  return (purchasesResult.data ?? []).map((row) => {
    const purchase = mapPurchase(row);
    return { purchase, items: itemsByPurchase.get(purchase.id) ?? [] };
  });
}

export async function getFeedInventoryTransactionList(): Promise<
  FeedInventoryTransaction[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_inventory_transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat transaksi stok pakan: ${error.message}`);
  }

  return (data ?? []).map(mapTransaction);
}

export async function getFeedOverview(): Promise<{
  feedTypes: FeedType[];
  purchases: FeedPurchase[];
  transactions: FeedInventoryTransaction[];
}> {
  const [feedTypes, purchases, transactions] = await Promise.all([
    getFeedTypeList(),
    getFeedPurchaseList(),
    getFeedInventoryTransactionList(),
  ]);

  return { feedTypes, purchases, transactions };
}
