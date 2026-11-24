import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getFeedOverview } from "@/lib/feed.server";
import { getSaleList } from "@/lib/products.server";

export default async function DashboardPage() {
  const [sales, feed] = await Promise.all([getSaleList(), getFeedOverview()]);

  return (
    <DashboardClient
      sales={sales}
      feedTypes={feed.feedTypes}
      feedPurchases={feed.purchases}
      feedTransactions={feed.transactions}
    />
  );
}
