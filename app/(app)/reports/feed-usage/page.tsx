import type { Metadata } from "next";

import { FeedUsageReportClient } from "@/components/reports/feed-usage-report-client";
import { getFeedOverview } from "@/lib/feed.server";

export const metadata: Metadata = {
  title: "Penggunaan Pakan",
};

export default async function FeedUsageReportPage() {
  const { feedTypes, purchases, transactions } = await getFeedOverview();

  return (
    <FeedUsageReportClient
      feedTypes={feedTypes}
      purchases={purchases}
      transactions={transactions}
    />
  );
}
