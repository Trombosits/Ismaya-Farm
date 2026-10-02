/**
 * Frontend-only reference data for general purchases.
 * Shapes mirror the future `purchase_categories`, `purchases` and
 * `purchase_items` tables. Supplier references are resolved from the shared
 * supplier list.
 */

export { getSupplierName, suppliers } from "./suppliers";
export type { Supplier } from "./suppliers";

export interface PurchaseCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  purchase_date: string;
  supplier_id: string;
  category_id: string;
  total_amount: number;
  notes: string;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

export const purchaseCategories: PurchaseCategory[] = [
  {
    id: "puc-01",
    name: "Peralatan Kandang",
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    id: "puc-02",
    name: "Obat & Vaksin",
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-08",
  },
  {
    id: "puc-03",
    name: "Bibit Tanaman",
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-08-02",
  },
  {
    id: "puc-04",
    name: "Operasional",
    is_active: true,
    created_at: "2026-08-03",
    updated_at: "2026-08-03",
  },
  {
    id: "puc-05",
    name: "Konstruksi",
    is_active: true,
    created_at: "2026-08-04",
    updated_at: "2026-08-04",
  },
  {
    id: "puc-06",
    name: "Lain-lain",
    is_active: false,
    created_at: "2026-08-05",
    updated_at: "2026-09-01",
  },
];

export const purchases: Purchase[] = [
  {
    id: "pu-01",
    purchase_date: "2026-09-08",
    supplier_id: "sup-05",
    category_id: "puc-01",
    total_amount: 1050000,
    notes: "Perbaikan kandang A.",
    created_at: "2026-09-08",
  },
  {
    id: "pu-02",
    purchase_date: "2026-09-11",
    supplier_id: "sup-06",
    category_id: "puc-02",
    total_amount: 2590000,
    notes: "",
    created_at: "2026-09-11",
  },
  {
    id: "pu-03",
    purchase_date: "2026-09-14",
    supplier_id: "sup-05",
    category_id: "puc-04",
    total_amount: 880000,
    notes: "Penggantian lampu kandang.",
    created_at: "2026-09-14",
  },
  {
    id: "pu-04",
    purchase_date: "2026-09-19",
    supplier_id: "sup-05",
    category_id: "puc-05",
    total_amount: 3200000,
    notes: "Renovasi gudang pakan.",
    created_at: "2026-09-19",
  },
  {
    id: "pu-05",
    purchase_date: "2026-09-22",
    supplier_id: "sup-06",
    category_id: "puc-04",
    total_amount: 1050000,
    notes: "",
    created_at: "2026-09-22",
  },
  {
    id: "pu-06",
    purchase_date: "2026-09-25",
    supplier_id: "sup-02",
    category_id: "puc-03",
    total_amount: 700000,
    notes: "Bibit hijauan pakan.",
    created_at: "2026-09-25",
  },
];

export const purchaseItems: PurchaseItem[] = [
  {
    id: "put-01",
    purchase_id: "pu-01",
    item_name: "Paku 5 cm",
    quantity: 10,
    unit: "kg",
    unit_price: 15000,
    subtotal: 150000,
  },
  {
    id: "put-02",
    purchase_id: "pu-01",
    item_name: "Kayu Balok",
    quantity: 20,
    unit: "batang",
    unit_price: 45000,
    subtotal: 900000,
  },
  {
    id: "put-03",
    purchase_id: "pu-02",
    item_name: "Vaksin ND",
    quantity: 50,
    unit: "vial",
    unit_price: 35000,
    subtotal: 1750000,
  },
  {
    id: "put-04",
    purchase_id: "pu-02",
    item_name: "Vitamin B-Complex",
    quantity: 30,
    unit: "botol",
    unit_price: 28000,
    subtotal: 840000,
  },
  {
    id: "put-05",
    purchase_id: "pu-03",
    item_name: "Lampu LED",
    quantity: 40,
    unit: "buah",
    unit_price: 22000,
    subtotal: 880000,
  },
  {
    id: "put-06",
    purchase_id: "pu-04",
    item_name: "Semen",
    quantity: 30,
    unit: "sak",
    unit_price: 65000,
    subtotal: 1950000,
  },
  {
    id: "put-07",
    purchase_id: "pu-04",
    item_name: "Pasir",
    quantity: 5,
    unit: "m3",
    unit_price: 250000,
    subtotal: 1250000,
  },
  {
    id: "put-08",
    purchase_id: "pu-05",
    item_name: "Desinfektan",
    quantity: 25,
    unit: "liter",
    unit_price: 42000,
    subtotal: 1050000,
  },
  {
    id: "put-09",
    purchase_id: "pu-06",
    item_name: "Bibit Rumput Gajah",
    quantity: 200,
    unit: "batang",
    unit_price: 3500,
    subtotal: 700000,
  },
];

export function getPurchaseById(id: string): Purchase | undefined {
  return purchases.find((purchase) => purchase.id === id);
}

export function getPurchaseCategoryName(categoryId: string): string {
  return (
    purchaseCategories.find((category) => category.id === categoryId)?.name ??
    "—"
  );
}

export function getPurchaseItemsByPurchase(purchaseId: string): PurchaseItem[] {
  return purchaseItems.filter((item) => item.purchase_id === purchaseId);
}

export function getPurchaseTotal(purchaseId: string): number {
  return getPurchaseItemsByPurchase(purchaseId).reduce(
    (total, item) => total + item.subtotal,
    0,
  );
}
