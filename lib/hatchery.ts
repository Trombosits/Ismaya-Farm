/**
 * Frontend-only reference data for the hatchery module.
 * Shapes mirror the future `egg_collection_records`, `hatchery_batches`,
 * `hatchery_candling_records` and `hatchery_results` tables.
 */

/**
 * Shared types and helpers for the hatchery module.
 * Data is retrieved from Supabase through Server Actions.
 */

// =====================================================
// EGG COLLECTION
// =====================================================

export interface EggCollectionRecord {
  id: number;
  species_id: number;
  collection_date: string;
  quantity: number;
  notes: string | null;
  created_at: string;
}

// =====================================================
// HATCHERY BATCH
// =====================================================

export type HatcheryBatchStatus = "incubating" | "hatched" | "failed";

export interface HatcheryBatch {
  id: number;
  batch_code: string;
  species_id: number;
  species_name: string;
  species_code: string;
  start_date: string;
  egg_quantity: number;
  status: HatcheryBatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
// =====================================================
// HATCHERY STATUS
// =====================================================

export const HATCHERY_STATUS_LABEL: Record<HatcheryBatchStatus, string> = {
  incubating: "Proses",
  hatched: "Menetas",
  failed: "Gagal",
};

export const HATCHERY_STATUS_BADGE: Record<
  HatcheryBatchStatus,
  "success" | "info" | "danger"
> = {
  incubating: "info",
  hatched: "success",
  failed: "danger",
};

// =====================================================
// CANDLING
// =====================================================

export interface HatcheryCandlingRecord {
  id: number;
  batch_id: number;
  candling_date: string;
  age_days: number | null;
  fertile_count: number;
  infertile_count: number;
  dead_embryo_count: number;
  notes: string | null;
}

// =====================================================
// HATCHERY RESULTS
// =====================================================

export interface HatcheryResult {
  id: number;
  batch_id: number;
  hatch_date: string;
  hatched_count: number;
  failed_count: number;
  notes: string | null;
}

// =====================================================
// SPECIES OPTION
// =====================================================

export interface HatcherySpeciesOption {
  id: number;
  name: string;
}
