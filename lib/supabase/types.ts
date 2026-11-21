import type { Database } from "./database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type SpeciesRow = Tables<"livestock_species">;
export type SpeciesInsert = TablesInsert<"livestock_species">;
export type SpeciesUpdate = TablesUpdate<"livestock_species">;

export type BreedRow = Tables<"livestock_breeds">;
export type BreedInsert = TablesInsert<"livestock_breeds">;
export type BreedUpdate = TablesUpdate<"livestock_breeds">;

export type ProductCategoryRow = Tables<"product_categories">;
export type ProductCategoryInsert = TablesInsert<"product_categories">;
export type ProductCategoryUpdate = TablesUpdate<"product_categories">;

export type ProductRow = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

export type SaleRow = Tables<"sales">;
export type SaleInsert = TablesInsert<"sales">;
export type SaleUpdate = TablesUpdate<"sales">;

export type SaleItemRow = Tables<"sale_item">;
export type SaleItemInsert = TablesInsert<"sale_item">;
export type SaleItemUpdate = TablesUpdate<"sale_item">;

export type SaleItemLivestockRow = Tables<"sale_item_livestock">;
export type SaleItemLivestockInsert = TablesInsert<"sale_item_livestock">;

export type SupplierRow = Tables<"suppliers">;

export type PurchaseCategoryRow = Tables<"purchase_categories">;
export type PurchaseCategoryInsert = TablesInsert<"purchase_categories">;
export type PurchaseCategoryUpdate = TablesUpdate<"purchase_categories">;

export type PurchaseRow = Tables<"purchases">;
export type PurchaseInsert = TablesInsert<"purchases">;
export type PurchaseUpdate = TablesUpdate<"purchases">;

export type PurchaseItemRow = Tables<"purchase_item">;
export type PurchaseItemInsert = TablesInsert<"purchase_item">;
export type PurchaseItemUpdate = TablesUpdate<"purchase_item">;
