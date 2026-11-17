import type { Metadata } from "next";

import { ProductCategoriesPageClient } from "@/components/products/product-categories-page-client";
import { getProductCategoryList } from "@/lib/products.server";

export const metadata: Metadata = {
  title: "Kategori Produk",
};

export default async function ProductCategoriesPage() {
  const categories = await getProductCategoryList();

  return <ProductCategoriesPageClient categories={categories} />;
}
