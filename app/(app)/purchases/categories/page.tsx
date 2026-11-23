import type { Metadata } from "next";

import { PurchaseCategoriesPageClient } from "@/components/purchases/purchase-categories-page-client";
import { getPurchaseCategoryList } from "@/lib/purchases.server";

export const metadata: Metadata = {
  title: "Kategori Pembelian",
};

export default async function PurchaseCategoriesPage() {
  const categories = await getPurchaseCategoryList();

  return <PurchaseCategoriesPageClient categories={categories} />;
}
