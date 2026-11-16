/**
 * Server-only data access for `livestock_batches`.
 *
 * Never import this module from a Client Component ("use client") — it pulls in
 * `next/headers` through the Supabase server client. Server Components and
 * Server Actions should fetch data here and pass it down as props instead.
 *
 * The client-safe types/value (`LivestockBatch`, `livestockBatches`) live in
 * `./livestock-batches`, which must stay free of server-only imports.
 */

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type LivestockBatchRow = Tables<"livestock_batches">;

/**
 * Mengambil semua data batch ternak dari database.
 * Query error dilempar agar ditangani oleh error boundary halaman.
 */
export async function getLivestockBatches(): Promise<LivestockBatchRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock_batches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data batch ternak: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Mengambil satu batch ternak berdasarkan ID.
 * Mengembalikan `null` bila ID tidak valid atau data tidak ditemukan.
 */
export async function getBatchById(
  id: string | number,
): Promise<LivestockBatchRow | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestock_batches")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat batch ternak: ${error.message}`);
  }

  return data;
}
