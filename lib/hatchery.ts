/**
 * Frontend-only reference data for the hatchery module.
 * Shapes mirror the future `egg_collection_records`, `hatchery_batches`,
 * `hatchery_candling_records` and `hatchery_results` tables.
 */

export interface EggCollectionRecord {
  id: string;
  species_id: string;
  collection_date: string;
  quantity: number;
  notes: string;
  created_at: string;
}

export const eggCollectionRecords: EggCollectionRecord[] = [
  {
    id: "ec-01",
    species_id: "sp-02",
    collection_date: "2026-09-12",
    quantity: 120,
    notes: "",
    created_at: "2026-09-12",
  },
  {
    id: "ec-02",
    species_id: "sp-02",
    collection_date: "2026-09-15",
    quantity: 98,
    notes: "Sebagian telur retak tidak dihitung.",
    created_at: "2026-09-15",
  },
  {
    id: "ec-03",
    species_id: "sp-03",
    collection_date: "2026-09-11",
    quantity: 45,
    notes: "",
    created_at: "2026-09-11",
  },
  {
    id: "ec-04",
    species_id: "sp-03",
    collection_date: "2026-09-16",
    quantity: 52,
    notes: "",
    created_at: "2026-09-16",
  },
  {
    id: "ec-05",
    species_id: "sp-08",
    collection_date: "2026-09-10",
    quantity: 200,
    notes: "",
    created_at: "2026-09-10",
  },
  {
    id: "ec-06",
    species_id: "sp-02",
    collection_date: "2026-09-18",
    quantity: 110,
    notes: "",
    created_at: "2026-09-18",
  },
  {
    id: "ec-07",
    species_id: "sp-08",
    collection_date: "2026-09-17",
    quantity: 180,
    notes: "",
    created_at: "2026-09-17",
  },
  {
    id: "ec-08",
    species_id: "sp-03",
    collection_date: "2026-09-20",
    quantity: 47,
    notes: "",
    created_at: "2026-09-20",
  },
];

export type HatcheryBatchStatus = "incubating" | "hatched" | "failed";

export interface HatcheryBatch {
  id: string;
  batch_code: string;
  species_id: string;
  start_date: string;
  egg_quantity: number;
  expected_hatch_date: string;
  status: HatcheryBatchStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

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

export const hatcheryBatches: HatcheryBatch[] = [
  {
    id: "hb-01",
    batch_code: "HT-2026-001",
    species_id: "sp-02",
    start_date: "2026-09-01",
    egg_quantity: 120,
    expected_hatch_date: "2026-09-22",
    status: "hatched",
    notes: "",
    created_at: "2026-09-01",
    updated_at: "2026-09-22",
  },
  {
    id: "hb-02",
    batch_code: "HT-2026-002",
    species_id: "sp-03",
    start_date: "2026-09-05",
    egg_quantity: 90,
    expected_hatch_date: "2026-10-05",
    status: "incubating",
    notes: "Mesin tetas 2.",
    created_at: "2026-09-05",
    updated_at: "2026-09-19",
  },
  {
    id: "hb-03",
    batch_code: "HT-2026-003",
    species_id: "sp-02",
    start_date: "2026-09-12",
    egg_quantity: 100,
    expected_hatch_date: "2026-10-03",
    status: "incubating",
    notes: "",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "hb-04",
    batch_code: "HT-2026-004",
    species_id: "sp-08",
    start_date: "2026-08-25",
    egg_quantity: 150,
    expected_hatch_date: "2026-09-15",
    status: "hatched",
    notes: "",
    created_at: "2026-08-25",
    updated_at: "2026-09-15",
  },
  {
    id: "hb-05",
    batch_code: "HT-2026-005",
    species_id: "sp-03",
    start_date: "2026-08-10",
    egg_quantity: 80,
    expected_hatch_date: "2026-09-05",
    status: "failed",
    notes: "Suhu mesin tetas tidak stabil.",
    created_at: "2026-08-10",
    updated_at: "2026-09-05",
  },
];

export interface HatcheryCandlingRecord {
  id: string;
  batch_id: string;
  candling_date: string;
  age_days: number;
  fertile_count: number;
  infertile_count: number;
  dead_embryo_count: number;
  notes: string;
}

export const hatcheryCandlingRecords: HatcheryCandlingRecord[] = [
  {
    id: "hc-01",
    batch_id: "hb-01",
    candling_date: "2026-09-08",
    age_days: 7,
    fertile_count: 100,
    infertile_count: 20,
    dead_embryo_count: 0,
    notes: "",
  },
  {
    id: "hc-02",
    batch_id: "hb-01",
    candling_date: "2026-09-15",
    age_days: 14,
    fertile_count: 95,
    infertile_count: 25,
    dead_embryo_count: 5,
    notes: "Lima butir embrio mati.",
  },
  {
    id: "hc-03",
    batch_id: "hb-02",
    candling_date: "2026-09-12",
    age_days: 7,
    fertile_count: 70,
    infertile_count: 20,
    dead_embryo_count: 0,
    notes: "",
  },
  {
    id: "hc-04",
    batch_id: "hb-02",
    candling_date: "2026-09-19",
    age_days: 14,
    fertile_count: 65,
    infertile_count: 25,
    dead_embryo_count: 5,
    notes: "",
  },
  {
    id: "hc-05",
    batch_id: "hb-03",
    candling_date: "2026-09-19",
    age_days: 7,
    fertile_count: 85,
    infertile_count: 15,
    dead_embryo_count: 0,
    notes: "",
  },
  {
    id: "hc-06",
    batch_id: "hb-04",
    candling_date: "2026-09-01",
    age_days: 7,
    fertile_count: 130,
    infertile_count: 20,
    dead_embryo_count: 0,
    notes: "",
  },
];

export interface HatcheryResult {
  id: string;
  batch_id: string;
  hatch_date: string;
  hatched_count: number;
  failed_count: number;
  survival_count: number;
  notes: string;
}

export const hatcheryResults: HatcheryResult[] = [
  {
    id: "hres-01",
    batch_id: "hb-01",
    hatch_date: "2026-09-22",
    hatched_count: 82,
    failed_count: 18,
    survival_count: 80,
    notes: "",
  },
  {
    id: "hres-02",
    batch_id: "hb-04",
    hatch_date: "2026-09-15",
    hatched_count: 110,
    failed_count: 20,
    survival_count: 105,
    notes: "",
  },
];

export function getHatcheryBatch(id: string): HatcheryBatch | undefined {
  return hatcheryBatches.find((batch) => batch.id === id);
}

export function getCandlingByBatch(batchId: string): HatcheryCandlingRecord[] {
  return hatcheryCandlingRecords.filter(
    (record) => record.batch_id === batchId,
  );
}

export function getResultsByBatch(batchId: string): HatcheryResult[] {
  return hatcheryResults.filter((result) => result.batch_id === batchId);
}
