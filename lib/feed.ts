/**
 * Frontend-only reference data for feed management.
 * Shapes mirror the future `feed_types`, `feed_purchases`, `feed_purchase_items`
 * and `feed_inventory_transactions` tables. Stock is a derived UI value.
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

export interface Supplier {
  id: string;
  name: string;
}

export interface FeedPurchase {
  id: string;
  purchase_date: string;
  supplier_id: string;
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

export type InventoryTransactionType = "in" | "out";

export interface FeedInventoryTransaction {
  id: string;
  feed_type_id: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  unit_price: number;
  transaction_date: string;
  reference_type: "feed_purchase" | "feed_usage";
  reference_id: string | null;
  notes: string;
  created_at: string;
}

export const feedTypes: FeedType[] = [
  {
    id: "ft-01",
    name: "Konsentrat Sapi",
    unit: "kg",
    minimum_stock: 200,
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    id: "ft-02",
    name: "Hijauan Segar",
    unit: "karung",
    minimum_stock: 50,
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-10",
  },
  {
    id: "ft-03",
    name: "Dedak Padi",
    unit: "kg",
    minimum_stock: 150,
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-08-02",
  },
  {
    id: "ft-04",
    name: "Jagung Giling",
    unit: "kg",
    minimum_stock: 300,
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-09-10",
  },
  {
    id: "ft-05",
    name: "Pakan Broiler BR-1",
    unit: "sak",
    minimum_stock: 40,
    is_active: true,
    created_at: "2026-08-05",
    updated_at: "2026-08-05",
  },
  {
    id: "ft-06",
    name: "Pakan Layer L-1",
    unit: "sak",
    minimum_stock: 20,
    is_active: true,
    created_at: "2026-08-05",
    updated_at: "2026-08-05",
  },
  {
    id: "ft-07",
    name: "Mineral Tambahan",
    unit: "kg",
    minimum_stock: 20,
    is_active: false,
    created_at: "2026-08-08",
    updated_at: "2026-09-12",
  },
  {
    id: "ft-08",
    name: "Ampas Tahu",
    unit: "kg",
    minimum_stock: 100,
    is_active: true,
    created_at: "2026-08-08",
    updated_at: "2026-08-08",
  },
];

export const suppliers: Supplier[] = [
  { id: "sup-01", name: "CV Pakan Sejahtera" },
  { id: "sup-02", name: "UD Ternak Makmur" },
  { id: "sup-03", name: "PT Nutrisi Prima" },
  { id: "sup-04", name: "Toko Pakan Barokah" },
];

export const feedPurchases: FeedPurchase[] = [
  {
    id: "fp-01",
    purchase_date: "2026-09-10",
    supplier_id: "sup-01",
    invoice_number: "INV-2026-0910",
    notes: "Pengiriman rutin awal bulan.",
    created_at: "2026-09-10",
  },
  {
    id: "fp-02",
    purchase_date: "2026-09-05",
    supplier_id: "sup-02",
    invoice_number: "INV-2026-0905",
    notes: "",
    created_at: "2026-09-05",
  },
  {
    id: "fp-03",
    purchase_date: "2026-08-28",
    supplier_id: "sup-03",
    invoice_number: "INV-2026-0828",
    notes: "",
    created_at: "2026-08-28",
  },
  {
    id: "fp-04",
    purchase_date: "2026-08-20",
    supplier_id: "sup-04",
    invoice_number: "INV-2026-0820",
    notes: "Pembelian hijauan dan ampas.",
    created_at: "2026-08-20",
  },
  {
    id: "fp-05",
    purchase_date: "2026-09-18",
    supplier_id: "sup-01",
    invoice_number: "INV-2026-0918",
    notes: "",
    created_at: "2026-09-18",
  },
];

export const feedPurchaseItems: FeedPurchaseItem[] = [
  {
    id: "fpi-01",
    purchase_id: "fp-01",
    feed_type_id: "ft-04",
    quantity: 500,
    unit_price: 7000,
    subtotal: 3500000,
  },
  {
    id: "fpi-02",
    purchase_id: "fp-01",
    feed_type_id: "ft-03",
    quantity: 300,
    unit_price: 5000,
    subtotal: 1500000,
  },
  {
    id: "fpi-03",
    purchase_id: "fp-02",
    feed_type_id: "ft-05",
    quantity: 60,
    unit_price: 180000,
    subtotal: 10800000,
  },
  {
    id: "fpi-04",
    purchase_id: "fp-02",
    feed_type_id: "ft-06",
    quantity: 40,
    unit_price: 175000,
    subtotal: 7000000,
  },
  {
    id: "fpi-05",
    purchase_id: "fp-03",
    feed_type_id: "ft-01",
    quantity: 400,
    unit_price: 9000,
    subtotal: 3600000,
  },
  {
    id: "fpi-06",
    purchase_id: "fp-04",
    feed_type_id: "ft-02",
    quantity: 80,
    unit_price: 25000,
    subtotal: 2000000,
  },
  {
    id: "fpi-07",
    purchase_id: "fp-04",
    feed_type_id: "ft-08",
    quantity: 150,
    unit_price: 3000,
    subtotal: 450000,
  },
  {
    id: "fpi-08",
    purchase_id: "fp-05",
    feed_type_id: "ft-04",
    quantity: 250,
    unit_price: 7200,
    subtotal: 1800000,
  },
  {
    id: "fpi-09",
    purchase_id: "fp-05",
    feed_type_id: "ft-07",
    quantity: 30,
    unit_price: 15000,
    subtotal: 450000,
  },
];

export const inventoryTransactions: FeedInventoryTransaction[] = [
  {
    id: "it-01",
    feed_type_id: "ft-01",
    transaction_type: "in",
    quantity: 400,
    unit_price: 9000,
    transaction_date: "2026-08-28",
    reference_type: "feed_purchase",
    reference_id: "fp-03",
    notes: "Pembelian dari PT Nutrisi Prima.",
    created_at: "2026-08-28",
  },
  {
    id: "it-02",
    feed_type_id: "ft-01",
    transaction_type: "out",
    quantity: 150,
    unit_price: 0,
    transaction_date: "2026-09-02",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "Pemakaian kandang sapi.",
    created_at: "2026-09-02",
  },
  {
    id: "it-03",
    feed_type_id: "ft-01",
    transaction_type: "out",
    quantity: 120,
    unit_price: 0,
    transaction_date: "2026-09-12",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-12",
  },
  {
    id: "it-04",
    feed_type_id: "ft-01",
    transaction_type: "in",
    quantity: 100,
    unit_price: 9200,
    transaction_date: "2026-09-18",
    reference_type: "feed_purchase",
    reference_id: null,
    notes: "Penyesuaian stok awal.",
    created_at: "2026-09-18",
  },
  {
    id: "it-05",
    feed_type_id: "ft-02",
    transaction_type: "in",
    quantity: 80,
    unit_price: 25000,
    transaction_date: "2026-08-20",
    reference_type: "feed_purchase",
    reference_id: "fp-04",
    notes: "",
    created_at: "2026-08-20",
  },
  {
    id: "it-06",
    feed_type_id: "ft-02",
    transaction_type: "out",
    quantity: 40,
    unit_price: 0,
    transaction_date: "2026-08-30",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-08-30",
  },
  {
    id: "it-07",
    feed_type_id: "ft-02",
    transaction_type: "out",
    quantity: 35,
    unit_price: 0,
    transaction_date: "2026-09-10",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "Stok menipis.",
    created_at: "2026-09-10",
  },
  {
    id: "it-08",
    feed_type_id: "ft-03",
    transaction_type: "in",
    quantity: 300,
    unit_price: 5000,
    transaction_date: "2026-09-10",
    reference_type: "feed_purchase",
    reference_id: "fp-01",
    notes: "",
    created_at: "2026-09-10",
  },
  {
    id: "it-09",
    feed_type_id: "ft-03",
    transaction_type: "out",
    quantity: 60,
    unit_price: 0,
    transaction_date: "2026-09-12",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-12",
  },
  {
    id: "it-10",
    feed_type_id: "ft-03",
    transaction_type: "out",
    quantity: 40,
    unit_price: 0,
    transaction_date: "2026-09-15",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-15",
  },
  {
    id: "it-11",
    feed_type_id: "ft-04",
    transaction_type: "in",
    quantity: 500,
    unit_price: 7000,
    transaction_date: "2026-09-10",
    reference_type: "feed_purchase",
    reference_id: "fp-01",
    notes: "",
    created_at: "2026-09-10",
  },
  {
    id: "it-12",
    feed_type_id: "ft-04",
    transaction_type: "in",
    quantity: 250,
    unit_price: 7200,
    transaction_date: "2026-09-18",
    reference_type: "feed_purchase",
    reference_id: "fp-05",
    notes: "",
    created_at: "2026-09-18",
  },
  {
    id: "it-13",
    feed_type_id: "ft-04",
    transaction_type: "out",
    quantity: 180,
    unit_price: 0,
    transaction_date: "2026-09-12",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-12",
  },
  {
    id: "it-14",
    feed_type_id: "ft-04",
    transaction_type: "out",
    quantity: 220,
    unit_price: 0,
    transaction_date: "2026-09-16",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-16",
  },
  {
    id: "it-15",
    feed_type_id: "ft-05",
    transaction_type: "in",
    quantity: 60,
    unit_price: 180000,
    transaction_date: "2026-09-05",
    reference_type: "feed_purchase",
    reference_id: "fp-02",
    notes: "",
    created_at: "2026-09-05",
  },
  {
    id: "it-16",
    feed_type_id: "ft-05",
    transaction_type: "out",
    quantity: 25,
    unit_price: 0,
    transaction_date: "2026-09-08",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-08",
  },
  {
    id: "it-17",
    feed_type_id: "ft-05",
    transaction_type: "out",
    quantity: 20,
    unit_price: 0,
    transaction_date: "2026-09-14",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-14",
  },
  {
    id: "it-18",
    feed_type_id: "ft-06",
    transaction_type: "in",
    quantity: 40,
    unit_price: 175000,
    transaction_date: "2026-09-05",
    reference_type: "feed_purchase",
    reference_id: "fp-02",
    notes: "",
    created_at: "2026-09-05",
  },
  {
    id: "it-19",
    feed_type_id: "ft-06",
    transaction_type: "out",
    quantity: 5,
    unit_price: 0,
    transaction_date: "2026-09-12",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-12",
  },
  {
    id: "it-20",
    feed_type_id: "ft-07",
    transaction_type: "in",
    quantity: 30,
    unit_price: 15000,
    transaction_date: "2026-09-18",
    reference_type: "feed_purchase",
    reference_id: "fp-05",
    notes: "",
    created_at: "2026-09-18",
  },
  {
    id: "it-21",
    feed_type_id: "ft-07",
    transaction_type: "out",
    quantity: 5,
    unit_price: 0,
    transaction_date: "2026-09-19",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-19",
  },
  {
    id: "it-22",
    feed_type_id: "ft-08",
    transaction_type: "in",
    quantity: 150,
    unit_price: 3000,
    transaction_date: "2026-08-20",
    reference_type: "feed_purchase",
    reference_id: "fp-04",
    notes: "",
    created_at: "2026-08-20",
  },
  {
    id: "it-23",
    feed_type_id: "ft-08",
    transaction_type: "out",
    quantity: 40,
    unit_price: 0,
    transaction_date: "2026-08-31",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-08-31",
  },
  {
    id: "it-24",
    feed_type_id: "ft-08",
    transaction_type: "out",
    quantity: 45,
    unit_price: 0,
    transaction_date: "2026-09-11",
    reference_type: "feed_usage",
    reference_id: null,
    notes: "",
    created_at: "2026-09-11",
  },
];

export function getFeedType(id: string): FeedType | undefined {
  return feedTypes.find((feed) => feed.id === id);
}

export function getFeedTypeName(id: string): string {
  return getFeedType(id)?.name ?? "—";
}

export function getFeedTypeUnit(id: string): string {
  return getFeedType(id)?.unit ?? "";
}

export function getSupplierName(id: string): string {
  return suppliers.find((supplier) => supplier.id === id)?.name ?? "—";
}

export function getPurchaseItems(purchaseId: string): FeedPurchaseItem[] {
  return feedPurchaseItems.filter((item) => item.purchase_id === purchaseId);
}

export function getPurchaseTotal(purchaseId: string): number {
  return getPurchaseItems(purchaseId).reduce(
    (total, item) => total + item.subtotal,
    0,
  );
}

/** Derived UI value; never a stored field. */
export function getStockByFeedType(feedTypeId: string): number {
  return inventoryTransactions
    .filter((transaction) => transaction.feed_type_id === feedTypeId)
    .reduce(
      (stock, transaction) =>
        stock +
        (transaction.transaction_type === "in"
          ? transaction.quantity
          : -transaction.quantity),
      0,
    );
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

export function getTransactionReference(
  transaction: FeedInventoryTransaction,
): string {
  if (
    transaction.reference_type === "feed_purchase" &&
    transaction.reference_id
  ) {
    const purchase = feedPurchases.find(
      (item) => item.id === transaction.reference_id,
    );
    return purchase ? `Pembelian ${purchase.invoice_number}` : "Pembelian";
  }
  return "Pemakaian";
}

export function getTransactionsByFeedType(
  feedTypeId: string,
): FeedInventoryTransaction[] {
  return inventoryTransactions
    .filter((transaction) => transaction.feed_type_id === feedTypeId)
    .sort((a, b) =>
      a.transaction_date < b.transaction_date ? 1 : -1,
    );
}
