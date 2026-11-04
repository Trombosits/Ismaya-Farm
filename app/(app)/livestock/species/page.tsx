import type { Metadata } from "next";

import { SpeciesList } from "@/components/livestock/species-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Jenis Ternak",
};

export default async function SpeciesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock_species")
    .select("id, name, code, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat jenis ternak: ${error.message}`);
  }

  return <SpeciesList species={data ?? []} />;
}
