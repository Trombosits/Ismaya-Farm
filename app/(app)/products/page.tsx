import type { Metadata } from "next";

import { ProductsPageClient } from "@/components/products/products-page-client";
import {
  getProductCategoryList,
  getProductList,
} from "@/lib/products.server";

export const metadata: Metadata = {
  title: "Produk",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProductList(),
    getProductCategoryList(),
  ]);

  return <ProductsPageClient products={products} categories={categories} />;
}
