import type { Metadata } from "next";

import { FeedTypesPageClient } from "@/components/feed/feed-types-page-client";
import { getFeedTypeList } from "@/lib/feed.server";

export const metadata: Metadata = {
  title: "Jenis Pakan",
};

export default async function FeedTypesPage() {
  const feedTypes = await getFeedTypeList();

  return <FeedTypesPageClient feedTypes={feedTypes} />;
}
