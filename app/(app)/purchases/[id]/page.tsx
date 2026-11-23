import type { Metadata } from "next";

import { PurchaseDetailClient } from "@/components/purchases/purchase-detail-client";
import {
  getPurchaseCategoryList,
  getPurchaseDetail,
} from "@/lib/purchases.server";

export const metadata: Metadata = {
  title: "Detail Pembelian",
};

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [detail, categories] = await Promise.all([
    getPurchaseDetail(id),
    getPurchaseCategoryList(),
  ]);

  return <PurchaseDetailClient detail={detail} categories={categories} />;
}
