import type { Metadata } from "next";

import { SaleDetailClient } from "@/components/sales/sale-detail-client";
import { getBreedList, getLivestockList } from "@/lib/livestock.server";
import { getProductList, getSaleDetail } from "@/lib/products.server";

export const metadata: Metadata = {
  title: "Detail Penjualan",
};

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [detail, products, livestock, breeds] = await Promise.all([
    getSaleDetail(id),
    getProductList(),
    getLivestockList(),
    getBreedList(),
  ]);

  return (
    <SaleDetailClient
      detail={detail}
      products={products}
      livestock={livestock}
      breeds={breeds}
    />
  );
}
