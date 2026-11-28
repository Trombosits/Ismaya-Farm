import { createClient } from "@/lib/supabase/server";

import ReproductionClient, {
  type ReproductionPageRecord,
} from "@/components/reproduction/reproduction-client";

import type { ReproductionLivestockOption } from "@/components/reproduction/reproduction-form-dialog";
import type {
  LivestockReproductionRecord,
  ReproductionStatus,
} from "@/lib/reproduction";

export default async function ReproductionPage() {
  const supabase = await createClient();

  const [
    { data: reproductionData, error: reproductionError },
    { data: livestockData, error: livestockError },
    { data: breedData, error: breedError },
  ] = await Promise.all([
    supabase
      .from("livestock_reproduction_records")
      .select("*")
      .order("mating_date", { ascending: false }),

    supabase.from("livestock").select("id, tag_code, sex, breed_id"),

    supabase.from("livestock_breeds").select("id, name"),
  ]);

  if (reproductionError) {
    throw new Error(
      `Gagal memuat data perkawinan: ${reproductionError.message}`,
    );
  }

  if (livestockError) {
    throw new Error(`Gagal memuat data ternak: ${livestockError.message}`);
  }

  if (breedError) {
    throw new Error(`Gagal memuat data ras: ${breedError.message}`);
  }

  const breedNameById = new Map(
    (breedData ?? []).map((breed) => [breed.id, breed.name]),
  );

  const livestockOptions: ReproductionLivestockOption[] = (
    livestockData ?? []
  ).map((animal) => ({
    id: animal.id,
    tag_code: animal.tag_code,
    sex: animal.sex,
    breed_name: animal.breed_id
      ? (breedNameById.get(animal.breed_id) ?? "Ras tidak diketahui")
      : "Ras tidak diketahui",
  }));

  const livestockById = new Map(
    livestockOptions.map((animal) => [animal.id, animal]),
  );

  const records: ReproductionPageRecord[] = (reproductionData ?? []).map(
    (row) => {
      const record: LivestockReproductionRecord = {
        id: String(row.id),
        female_livestock_id: String(row.female_livestock_id),
        male_livestock_id:
          row.male_livestock_id === null ? "" : String(row.male_livestock_id),
        mating_date: row.mating_date ?? "",
        pregnancy_date: row.pregnancy_date,
        expected_birth_date: row.expected_birth_date,
        actual_birth_date: row.actual_birth_date,
        status: (row.status ?? "ongoing") as ReproductionStatus,
        notes: row.notes ?? "",
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      return {
        record,
        female: livestockById.get(row.female_livestock_id) ?? null,
        male:
          row.male_livestock_id === null
            ? null
            : (livestockById.get(row.male_livestock_id) ?? null),
      };
    },
  );

  return (
    <ReproductionClient records={records} livestockOptions={livestockOptions} />
  );
}
