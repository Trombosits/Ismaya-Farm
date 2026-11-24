import type { Metadata } from "next";

import { FeedPurchasesReportClient } from "@/components/reports/feed-purchases-report-client";
import {
  getFeedPurchaseListWithItems,
  getFeedTypeList,
} from "@/lib/feed.server";

export const metadata: Metadata = {
  title: "Pembelian Pakan",
};

export default async function FeedPurchasesReportPage() {
  const [purchaseDetails, feedTypes] = await Promise.all([
    getFeedPurchaseListWithItems(),
    getFeedTypeList(),
  ]);

  return (
    <FeedPurchasesReportClient
      purchaseDetails={purchaseDetails}
      feedTypes={feedTypes}
    />
  );
}
