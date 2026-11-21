//

import { HatcheryBatchDetailClient } from "@/components/hatchery/hatchery-batch-detail-client";
import {
  getCandlingByBatch,
  getHatcheryBatch,
  getResultsByBatch,
} from "@/lib/hatchery.server";
import { getSpeciesList } from "@/lib/livestock.server";

export default async function HatcheryBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batchId = Number(id);

  if (!Number.isInteger(batchId) || batchId <= 0) {
    return (
      <HatcheryBatchDetailClient
        batch={null}
        candlingRecords={[]}
        results={[]}
        speciesOptions={[]}
      />
    );
  }

  const batch = await getHatcheryBatch(batchId);

  if (!batch) {
    return (
      <HatcheryBatchDetailClient
        batch={null}
        candlingRecords={[]}
        results={[]}
        speciesOptions={[]}
      />
    );
  }

  const [candlingRecords, results, speciesList] = await Promise.all([
    getCandlingByBatch(batch.id),
    getResultsByBatch(batch.id),
    getSpeciesList(),
  ]);

  const speciesOptions = speciesList.map((species) => ({
    id: Number(species.id),
    name: species.name,
  }));

  return (
    <HatcheryBatchDetailClient
      batch={batch}
      candlingRecords={candlingRecords}
      results={results}
      speciesOptions={speciesOptions}
    />
  );
}
