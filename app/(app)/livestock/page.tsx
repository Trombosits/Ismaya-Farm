import type { Metadata } from "next";

import { LivestockPageClient } from "@/components/livestock/livestock-page-client";
import { getLivestockBatches } from "@/lib/livestock-batches.server";
import {
  getBreedList,
  getLivestockList,
  getSpeciesList,
} from "@/lib/livestock.server";

export const metadata: Metadata = {
  title: "Data Ternak",
};

export default async function LivestockPage() {
  const [livestock, species, breeds, batches] = await Promise.all([
    getLivestockList(),
    getSpeciesList(),
    getBreedList(),
    getLivestockBatches(),
  ]);

  return (
    <LivestockPageClient
      livestockList={livestock}
      speciesList={species}
      breedList={breeds}
      batchList={batches}
    />
  );
}
