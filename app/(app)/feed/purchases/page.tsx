import type { Metadata } from "next";

import { FeedPurchasesPageClient } from "@/components/feed/feed-purchases-page-client";
import { getFeedPurchaseListWithItems, getFeedTypeList } from "@/lib/feed.server";

export const metadata: Metadata = {
  title: "Pembelian Pakan",
};

export default async function FeedPurchasesPage() {
  const [purchaseDetails, feedTypes] = await Promise.all([
    getFeedPurchaseListWithItems(),
    getFeedTypeList(),
  ]);

  return (
    <FeedPurchasesPageClient
      purchaseDetails={purchaseDetails}
      feedTypes={feedTypes}
    />
  );
}
