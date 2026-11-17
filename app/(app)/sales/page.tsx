import type { Metadata } from "next";

import { SalesPageClient } from "@/components/sales/sales-page-client";
import { getBreedList, getLivestockList } from "@/lib/livestock.server";
import {
  getProductList,
  getSaleListWithItems,
} from "@/lib/products.server";

export const metadata: Metadata = {
  title: "Penjualan",
};

export default async function SalesPage() {
  const [saleDetails, products, livestock, breeds] = await Promise.all([
    getSaleListWithItems(),
    getProductList(),
    getLivestockList(),
    getBreedList(),
  ]);

  return (
    <SalesPageClient
      sales={saleDetails.map((detail) => detail.sale)}
      saleDetails={saleDetails}
      products={products}
      livestock={livestock}
      breeds={breeds}
    />
  );
}
