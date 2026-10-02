/**
 * Frontend-only reference data for products and sales.
 * Shapes mirror the future `product_categories`, `products`, `sales`,
 * `sale_items` and `sale_item_livestock` tables. No persistence layer exists.
 */

export interface ProductCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  unit: string;
  selling_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  sale_date: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  notes: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleItemLivestock {
  id: string;
  sale_item_id: string;
  livestock_id: string;
}

export const productCategories: ProductCategory[] = [
  {
    id: "pc-01",
    name: "Telur",
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    id: "pc-02",
    name: "Daging",
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-05",
  },
  {
    id: "pc-03",
    name: "Susu & Olahan",
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-08-02",
  },
  {
    id: "pc-04",
    name: "Pupuk & Kompos",
    is_active: true,
    created_at: "2026-08-03",
    updated_at: "2026-08-03",
  },
  {
    id: "pc-05",
    name: "Ternak Hidup",
    is_active: true,
    created_at: "2026-08-04",
    updated_at: "2026-08-04",
  },
  {
    id: "pc-06",
    name: "Hasil Olahan",
    is_active: false,
    created_at: "2026-08-06",
    updated_at: "2026-09-01",
  },
];

export const products: Product[] = [
  {
    id: "pr-01",
    category_id: "pc-01",
    name: "Telur Ayam",
    sku: "EGG-001",
    unit: "kg",
    selling_price: 30000,
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    id: "pr-02",
    category_id: "pc-01",
    name: "Telur Bebek",
    sku: "EGG-002",
    unit: "kg",
    selling_price: 42000,
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-10",
  },
  {
    id: "pr-03",
    category_id: "pc-01",
    name: "Telur Puyuh",
    sku: "EGG-003",
    unit: "kg",
    selling_price: 55000,
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-08-02",
  },
  {
    id: "pr-04",
    category_id: "pc-02",
    name: "Kambing Potong",
    sku: "MEA-001",
    unit: "ekor",
    selling_price: 3500000,
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-08-20",
  },
  {
    id: "pr-05",
    category_id: "pc-02",
    name: "Sapi Potong",
    sku: "MEA-002",
    unit: "ekor",
    selling_price: 18000000,
    is_active: true,
    created_at: "2026-08-03",
    updated_at: "2026-08-03",
  },
  {
    id: "pr-06",
    category_id: "pc-02",
    name: "Ayam Broiler",
    sku: "MEA-003",
    unit: "ekor",
    selling_price: 45000,
    is_active: true,
    created_at: "2026-08-03",
    updated_at: "2026-08-03",
  },
  {
    id: "pr-07",
    category_id: "pc-03",
    name: "Susu Kambing Segar",
    sku: "MLK-001",
    unit: "liter",
    selling_price: 35000,
    is_active: true,
    created_at: "2026-08-04",
    updated_at: "2026-08-04",
  },
  {
    id: "pr-08",
    category_id: "pc-04",
    name: "Pupuk Kompos",
    sku: "FRT-001",
    unit: "karung",
    selling_price: 25000,
    is_active: true,
    created_at: "2026-08-04",
    updated_at: "2026-08-04",
  },
  {
    id: "pr-09",
    category_id: "pc-05",
    name: "Anak Ayam DOC",
    sku: "LIV-001",
    unit: "ekor",
    selling_price: 8000,
    is_active: true,
    created_at: "2026-08-05",
    updated_at: "2026-08-05",
  },
  {
    id: "pr-10",
    category_id: "pc-05",
    name: "Kambing Bibit",
    sku: "LIV-002",
    unit: "ekor",
    selling_price: 3000000,
    is_active: false,
    created_at: "2026-08-05",
    updated_at: "2026-09-02",
  },
  {
    id: "pr-11",
    category_id: "pc-06",
    name: "Keju Olahan",
    sku: "OLV-001",
    unit: "kg",
    selling_price: 120000,
    is_active: false,
    created_at: "2026-08-06",
    updated_at: "2026-09-01",
  },
];

export const sales: Sale[] = [
  {
    id: "sl-01",
    invoice_number: "INV-S-2026-0901",
    sale_date: "2026-09-12",
    customer_name: "Toko Sembako Bu Sari",
    customer_phone: "0812-3456-7890",
    total_amount: 2000000,
    notes: "Pengiriman pagi.",
    created_at: "2026-09-12",
  },
  {
    id: "sl-02",
    invoice_number: "INV-S-2026-0905",
    sale_date: "2026-09-15",
    customer_name: "Restoran Padang Jaya",
    customer_phone: "0813-2222-1111",
    total_amount: 6200000,
    notes: "",
    created_at: "2026-09-15",
  },
  {
    id: "sl-03",
    invoice_number: "INV-S-2026-0908",
    sale_date: "2026-09-18",
    customer_name: "Pasar Tradisional Cibaduyut",
    customer_phone: "0857-9999-8888",
    total_amount: 3660000,
    notes: "",
    created_at: "2026-09-18",
  },
  {
    id: "sl-04",
    invoice_number: "INV-S-2026-0910",
    sale_date: "2026-09-20",
    customer_name: "Koperasi Tani Makmur",
    customer_phone: "0821-7777-6666",
    total_amount: 2225000,
    notes: "Pembayaran tempo 7 hari.",
    created_at: "2026-09-20",
  },
  {
    id: "sl-05",
    invoice_number: "INV-S-2026-0912",
    sale_date: "2026-09-22",
    customer_name: "Warung Bu Yati",
    customer_phone: "0878-5555-4444",
    total_amount: 1600000,
    notes: "",
    created_at: "2026-09-22",
  },
  {
    id: "sl-06",
    invoice_number: "INV-S-2026-0915",
    sale_date: "2026-09-24",
    customer_name: "PT Boga Nusantara",
    customer_phone: "021-555-1234",
    total_amount: 18000000,
    notes: "Penjualan sapi potong.",
    created_at: "2026-09-24",
  },
];

export const saleItems: SaleItem[] = [
  {
    id: "si-01",
    sale_id: "sl-01",
    product_id: "pr-01",
    quantity: 50,
    unit_price: 30000,
    subtotal: 1500000,
  },
  {
    id: "si-02",
    sale_id: "sl-01",
    product_id: "pr-08",
    quantity: 20,
    unit_price: 25000,
    subtotal: 500000,
  },
  {
    id: "si-03",
    sale_id: "sl-02",
    product_id: "pr-06",
    quantity: 60,
    unit_price: 45000,
    subtotal: 2700000,
  },
  {
    id: "si-04",
    sale_id: "sl-02",
    product_id: "pr-04",
    quantity: 1,
    unit_price: 3500000,
    subtotal: 3500000,
  },
  {
    id: "si-05",
    sale_id: "sl-03",
    product_id: "pr-01",
    quantity: 80,
    unit_price: 30000,
    subtotal: 2400000,
  },
  {
    id: "si-06",
    sale_id: "sl-03",
    product_id: "pr-02",
    quantity: 30,
    unit_price: 42000,
    subtotal: 1260000,
  },
  {
    id: "si-07",
    sale_id: "sl-04",
    product_id: "pr-07",
    quantity: 40,
    unit_price: 35000,
    subtotal: 1400000,
  },
  {
    id: "si-08",
    sale_id: "sl-04",
    product_id: "pr-03",
    quantity: 15,
    unit_price: 55000,
    subtotal: 825000,
  },
  {
    id: "si-09",
    sale_id: "sl-05",
    product_id: "pr-09",
    quantity: 200,
    unit_price: 8000,
    subtotal: 1600000,
  },
  {
    id: "si-10",
    sale_id: "sl-06",
    product_id: "pr-05",
    quantity: 1,
    unit_price: 18000000,
    subtotal: 18000000,
  },
];

export const saleItemLivestock: SaleItemLivestock[] = [
  { id: "sil-01", sale_item_id: "si-04", livestock_id: "lv-03" },
  { id: "sil-02", sale_item_id: "si-10", livestock_id: "lv-12" },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductName(id: string): string {
  return getProduct(id)?.name ?? "—";
}

export function getProductUnit(id: string): string {
  return getProduct(id)?.unit ?? "";
}

export function getProductCategoryName(categoryId: string): string {
  return (
    productCategories.find((category) => category.id === categoryId)?.name ??
    "—"
  );
}

export function getSaleById(id: string): Sale | undefined {
  return sales.find((sale) => sale.id === id);
}

export function getSaleItems(saleId: string): SaleItem[] {
  return saleItems.filter((item) => item.sale_id === saleId);
}

export function getSaleTotal(saleId: string): number {
  return getSaleItems(saleId).reduce(
    (total, item) => total + item.subtotal,
    0,
  );
}

export function getSaleItemLivestock(itemId: string): SaleItemLivestock[] {
  return saleItemLivestock.filter((row) => row.sale_item_id === itemId);
}
