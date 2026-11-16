import type { Metadata } from "next";

import { BatchDetailClient } from "@/components/livestock/batch-detail-client";
import { getBatchById } from "@/lib/livestock-batches.server";
import { getBreedList, getSpeciesList } from "@/lib/livestock.server";

export const metadata: Metadata = {
  title: "Detail Batch",
};

export default async function LivestockBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [batch, species, breeds] = await Promise.all([
    getBatchById(id),
    getSpeciesList(),
    getBreedList(),
  ]);

  return (
    <BatchDetailClient
      batch={batch}
      speciesList={species}
      breedList={breeds}
    />
  );
}
