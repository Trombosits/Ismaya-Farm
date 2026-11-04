import type { Metadata } from "next";

import { BreedsList } from "@/components/livestock/breeds-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ras Ternak",
};

export default async function BreedsPage() {
  const supabase = await createClient();

  const [speciesResult, breedsResult] = await Promise.all([
    supabase
      .from("livestock_species")
      .select("id, name, code, created_at, updated_at")
      .order("name", { ascending: true }),
    supabase
      .from("livestock_breeds")
      .select("id, species_id, name, code, created_at, updated_at")
      .order("name", { ascending: true }),
  ]);

  if (speciesResult.error) {
    throw new Error(`Gagal memuat jenis ternak: ${speciesResult.error.message}`);
  }
  if (breedsResult.error) {
    throw new Error(`Gagal memuat ras ternak: ${breedsResult.error.message}`);
  }

  return (
    <BreedsList
      breeds={breedsResult.data ?? []}
      species={speciesResult.data ?? []}
    />
  );
}
