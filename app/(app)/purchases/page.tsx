import type { Metadata } from "next";

import { PurchasesPageClient } from "@/components/purchases/purchases-page-client";
import {
  getPurchaseCategoryList,
  getPurchaseListWithItems,
} from "@/lib/purchases.server";

export const metadata: Metadata = {
  title: "Pembelian",
};

export default async function PurchasesPage() {
  const [purchaseDetails, categories] = await Promise.all([
    getPurchaseListWithItems(),
    getPurchaseCategoryList(),
  ]);

  return (
    <PurchasesPageClient
      purchaseDetails={purchaseDetails}
      categories={categories}
    />
  );
}
