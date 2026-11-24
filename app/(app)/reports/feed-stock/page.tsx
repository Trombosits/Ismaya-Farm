import type { Metadata } from "next";

import { FeedStockReportClient } from "@/components/reports/feed-stock-report-client";
import { getFeedOverview } from "@/lib/feed.server";

export const metadata: Metadata = {
  title: "Pergerakan Stok Pakan",
};

export default async function FeedStockReportPage() {
  const { feedTypes, purchases, transactions } = await getFeedOverview();

  return (
    <FeedStockReportClient
      feedTypes={feedTypes}
      purchases={purchases}
      transactions={transactions}
    />
  );
}
