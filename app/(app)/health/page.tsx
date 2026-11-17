import { createClient } from "@/lib/supabase/server";
import {
  getLivestockList,
  getSpeciesList,
  getBreedList,
} from "@/lib/livestock.server";
import HealthClient from "./health-client";

export const metadata = {
  title: "Riwayat Kesehatan",
  description: "Manajemen catatan kesehatan ternak.",
};

export default async function HealthPage() {
  const supabase = await createClient();

  // Mengambil semua data secara paralel
  const [livestock, species, breeds, { data: healthRecords }] =
    await Promise.all([
      getLivestockList(),
      getSpeciesList(),
      getBreedList(),
      supabase
        .from("livestock_health_records")
        .select("*")
        .order("record_date", { ascending: false }),
    ]);

  // Ekstrak daftar kondisi secara dinamis dari hasil database
  const uniqueConditions = Array.from(
    new Set(
      (healthRecords ?? [])
        .map((record) => record.condition)
        .filter((condition): condition is string => Boolean(condition)),
    ),
  );

  return (
    <HealthClient
      initialRecords={healthRecords ?? []}
      livestockList={livestock}
      conditions={uniqueConditions}
      speciesList={species}
      breedList={breeds}
    />
  );
}
