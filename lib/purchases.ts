/**
 * Purchase module types.
 *
 * Data access for the Pembelian module lives in `lib/purchases.server.ts`.
 * The legacy in-memory lists below are intentionally empty — the UI is still
 * being migrated and must no longer rely on dummy transactions.
 */

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
  supplier: string;
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

export interface PurchaseDetail {
  purchase: Purchase;
  items: PurchaseItem[];
}

export const purchaseCategories: PurchaseCategory[] = [];
export const purchases: Purchase[] = [];
export const purchaseItems: PurchaseItem[] = [];

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
