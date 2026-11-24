import type { Metadata } from "next";

import { FeedInventoryPageClient } from "@/components/feed/feed-inventory-page-client";
import { getFeedOverview } from "@/lib/feed.server";

export const metadata: Metadata = {
  title: "Stok Pakan",
};

export default async function FeedInventoryPage() {
  const { feedTypes, purchases, transactions } = await getFeedOverview();

  return (
    <FeedInventoryPageClient
      feedTypes={feedTypes}
      purchases={purchases}
      transactions={transactions}
    />
  );
}
