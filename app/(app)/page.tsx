import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getSaleList } from "@/lib/products.server";

export default async function DashboardPage() {
  const sales = await getSaleList();

  return <DashboardClient sales={sales} />;
}
