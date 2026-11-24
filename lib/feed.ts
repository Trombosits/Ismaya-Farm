/**
 * Client-safe feed reference: tipe, label, dan helper murni.
 *
 * Semua data berasal dari Supabase. Akses database ada di
 * `lib/feed.server.ts` — JANGAN import modul tersebut dari Client Component.
 * Stok pakan adalah nilai turunan dari `FeedInventoryTransaction`, bukan kolom
 * tersimpan.
 */

export interface FeedType {
  id: string;
  name: string;
  unit: string;
  minimum_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedPurchase {
  id: string;
  purchase_date: string;
  /** Nama supplier yang diketik bebas, bukan referensi master. */
  supplier: string;
  invoice_number: string;
  notes: string;
  created_at: string;
}

export interface FeedPurchaseItem {
  id: string;
  purchase_id: string;
  feed_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface FeedPurchaseDetail {
  purchase: FeedPurchase;
  items: FeedPurchaseItem[];
}

export type InventoryTransactionType = "in" | "out";
export type FeedReferenceType = "feed_purchase" | "feed_usage";

export interface FeedInventoryTransaction {
  id: string;
  feed_type_id: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  unit_price: number;
  transaction_date: string;
  reference_type: FeedReferenceType;
  reference_id: string | null;
  notes: string;
  created_at: string;
}

export function getFeedType(feedTypes: FeedType[], id: string) {
  return feedTypes.find((feed) => feed.id === id);
}

export function getFeedTypeName(feedTypes: FeedType[], id: string): string {
  return getFeedType(feedTypes, id)?.name ?? "—";
}

export function getFeedTypeUnit(feedTypes: FeedType[], id: string): string {
  return getFeedType(feedTypes, id)?.unit ?? "";
}

export type StockStatus = "safe" | "near" | "below";

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  safe: "Aman",
  near: "Mendekati Minimum",
  below: "Di Bawah Minimum",
};

export const STOCK_STATUS_BADGE: Record<
  StockStatus,
  "success" | "warning" | "danger"
> = {
  safe: "success",
  near: "warning",
  below: "danger",
};

export function getStockStatus(stock: number, minimum: number): StockStatus {
  if (stock < minimum) return "below";
  if (stock <= minimum * 1.25) return "near";
  return "safe";
}

export const TRANSACTION_TYPE_LABEL: Record<
  InventoryTransactionType,
  string
> = {
  in: "Masuk",
  out: "Keluar",
};

export const REFERENCE_TYPE_LABEL: Record<FeedReferenceType, string> = {
  feed_purchase: "Pembelian Pakan",
  feed_usage: "Pemakaian",
};

/** Stok per jenis pakan: total transaksi masuk dikurangi transaksi keluar. */
export function computeStockMap(
  transactions: FeedInventoryTransaction[],
): Map<string, number> {
  const stock = new Map<string, number>();

  for (const transaction of transactions) {
    const current = stock.get(transaction.feed_type_id) ?? 0;
    const delta =
      transaction.transaction_type === "in"
        ? transaction.quantity
        : -transaction.quantity;
    stock.set(transaction.feed_type_id, current + delta);
  }

  return stock;
}

export function getStock(
  transactions: FeedInventoryTransaction[],
  feedTypeId: string,
): number {
  return computeStockMap(transactions).get(feedTypeId) ?? 0;
}

export function getTransactionsByFeedType(
  transactions: FeedInventoryTransaction[],
  feedTypeId: string,
): FeedInventoryTransaction[] {
  return transactions
    .filter((transaction) => transaction.feed_type_id === feedTypeId)
    .sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1));
}

export function getTransactionReference(
  transaction: FeedInventoryTransaction,
  purchases: FeedPurchase[],
): string {
  if (
    transaction.reference_type === "feed_purchase" &&
    transaction.reference_id
  ) {
    const purchase = purchases.find(
      (item) => item.id === transaction.reference_id,
    );
    return purchase?.invoice_number
      ? `Pembelian ${purchase.invoice_number}`
      : "Pembelian";
  }
  return "Pemakaian";
}
