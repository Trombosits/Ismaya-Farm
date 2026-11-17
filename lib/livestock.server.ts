/**
 * Server-only livestock data access.
 *
 * Never import this module from a Client Component ("use client") — it pulls in
 * `next/headers` through the Supabase server client. Only Server Components and
 * Server Actions may use it, passing the results down as props.
 */

import { createClient } from "@/lib/supabase/server";

import type {
  Livestock,
  LivestockBreed,
  LivestockSpecies,
} from "./livestock";

export async function getSpeciesList(): Promise<LivestockSpecies[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock_species")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat jenis ternak: ${error.message}`);
  }

  return data ?? [];
}

export async function getBreedList(): Promise<LivestockBreed[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock_breeds")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat ras ternak: ${error.message}`);
  }

  return data ?? [];
}

export async function getBreedsBySpecies(
  speciesId: number,
): Promise<LivestockBreed[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock_breeds")
    .select("*")
    .eq("species_id", speciesId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat ras ternak: ${error.message}`);
  }

  return data ?? [];
}

export async function getLivestockList(): Promise<Livestock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data ternak: ${error.message}`);
  }

  return data ?? [];
}

export async function getLivestockById(id: number): Promise<Livestock | null> {
  if (!Number.isInteger(id) || id <= 0) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat data ternak: ${error.message}`);
  }

  return data;
}
