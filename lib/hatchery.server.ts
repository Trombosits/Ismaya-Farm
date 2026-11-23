/**
 * Server-only hatchery data access.
 *
 * Never import this module from a Client Component ("use client").
 * Only Server Components and Server Actions may use it.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  EggCollectionRecord,
  HatcheryBatch,
  HatcheryCandlingRecord,
  HatcheryResult,
} from "./hatchery";

type HatcheryBatchStatus = "incubating" | "hatched" | "failed";

function isHatcheryBatchStatus(
  status: string | null,
): status is HatcheryBatchStatus {
  return status === "incubating" || status === "hatched" || status === "failed";
}

export async function getEggCollectionRecords(): Promise<
  EggCollectionRecord[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("egg_collection_records")
    .select("*")
    .order("collection_date", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data pengumpulan telur: ${error.message}`);
  }

  return data ?? [];
}

export async function getHatcheryBatches(): Promise<HatcheryBatch[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_batches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data batch penetasan: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((batch) => {
    if (!isHatcheryBatchStatus(batch.status)) {
      throw new Error(
        `Status batch "${batch.batch_code}" tidak valid: ${
          batch.status ?? "null"
        }`,
      );
    }

    return {
      ...batch,
      status: batch.status,
    };
  });
}

export async function getHatcheryBatch(
  id: number,
): Promise<HatcheryBatch | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_batches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat batch penetasan: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  if (!isHatcheryBatchStatus(data.status)) {
    throw new Error(`Status batch tidak valid: ${data.status ?? "null"}`);
  }

  return {
    ...data,
    status: data.status,
  };
}

export async function getCandlingByBatch(
  batchId: number,
): Promise<HatcheryCandlingRecord[]> {
  if (!Number.isInteger(batchId) || batchId <= 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_candling_records")
    .select("*")
    .eq("batch_id", batchId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data peneropongan telur: ${error.message}`);
  }

  return data ?? [];
}

export async function getResultsByBatch(
  batchId: number,
): Promise<HatcheryResult[]> {
  if (!Number.isInteger(batchId) || batchId <= 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_result")
    .select("*")
    .eq("batch_id", batchId);

  if (error) {
    throw new Error(`Gagal memuat hasil penetasan: ${error.message}`);
  }

  return data ?? [];
}
