/**
 * Frontend-only reference data for livestock batches.
 * `livestock_batches` represents a group of animals managed together, separate
 * from individually tagged `livestock`. Shapes mirror the planned table.
 * No persistence layer exists.
 */

import type { AcquisitionType, LivestockStatus } from "./livestock";

export interface LivestockBatch {
  id: string;
  batch_code: string;
  species_id: string;
  breed_id: string | null;
  quantity: number;
  acquisition_date: string;
  acquisition_type: AcquisitionType;
  status: LivestockStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const livestockBatches: LivestockBatch[] = [
  {
    id: "lb-01",
    batch_code: "AY-B-001",
    species_id: "sp-02",
    breed_id: "br-05",
    quantity: 500,
    acquisition_date: "2026-08-15",
    acquisition_type: "purchased",
    status: "active",
    notes: "DOC broiler kandang B.",
    created_at: "2026-08-15",
    updated_at: "2026-08-15",
  },
  {
    id: "lb-02",
    batch_code: "AY-B-002",
    species_id: "sp-02",
    breed_id: "br-06",
    quantity: 300,
    acquisition_date: "2026-08-20",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-08-20",
    updated_at: "2026-08-20",
  },
  {
    id: "lb-03",
    batch_code: "BB-B-001",
    species_id: "sp-03",
    breed_id: "br-09",
    quantity: 150,
    acquisition_date: "2026-09-01",
    acquisition_type: "born",
    status: "active",
    notes: "Hasil penetasan batch HT-2026-004.",
    created_at: "2026-09-01",
    updated_at: "2026-09-01",
  },
  {
    id: "lb-04",
    batch_code: "KM-B-001",
    species_id: "sp-01",
    breed_id: "br-01",
    quantity: 40,
    acquisition_date: "2026-09-05",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-09-05",
    updated_at: "2026-09-05",
  },
  {
    id: "lb-05",
    batch_code: "AY-B-003",
    species_id: "sp-02",
    breed_id: "br-07",
    quantity: 200,
    acquisition_date: "2026-09-10",
    acquisition_type: "purchased",
    status: "active",
    notes: "Ayam kampung.",
    created_at: "2026-09-10",
    updated_at: "2026-09-10",
  },
  {
    id: "lb-06",
    batch_code: "PY-B-001",
    species_id: "sp-08",
    breed_id: "br-16",
    quantity: 400,
    acquisition_date: "2026-09-12",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "lb-07",
    batch_code: "BB-B-002",
    species_id: "sp-03",
    breed_id: "br-10",
    quantity: 120,
    acquisition_date: "2026-09-15",
    acquisition_type: "purchased",
    status: "sold",
    notes: "Sebagian terjual.",
    created_at: "2026-09-15",
    updated_at: "2026-09-22",
  },
  {
    id: "lb-08",
    batch_code: "KM-B-002",
    species_id: "sp-01",
    breed_id: "br-03",
    quantity: 30,
    acquisition_date: "2026-09-18",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-09-18",
    updated_at: "2026-09-18",
  },
  {
    id: "lb-09",
    batch_code: "AY-B-004",
    species_id: "sp-02",
    breed_id: "br-08",
    quantity: 80,
    acquisition_date: "2026-09-20",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-09-20",
    updated_at: "2026-09-20",
  },
  {
    id: "lb-10",
    batch_code: "SP-B-001",
    species_id: "sp-04",
    breed_id: "br-11",
    quantity: 15,
    acquisition_date: "2026-09-21",
    acquisition_type: "purchased",
    status: "active",
    notes: "Penggemukan.",
    created_at: "2026-09-21",
    updated_at: "2026-09-21",
  },
  {
    id: "lb-11",
    batch_code: "DM-B-001",
    species_id: "sp-05",
    breed_id: "br-14",
    quantity: 60,
    acquisition_date: "2026-09-22",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-09-22",
    updated_at: "2026-09-22",
  },
  {
    id: "lb-12",
    batch_code: "KL-B-001",
    species_id: "sp-09",
    breed_id: "br-17",
    quantity: 25,
    acquisition_date: "2026-09-23",
    acquisition_type: "purchased",
    status: "active",
    notes: "",
    created_at: "2026-09-23",
    updated_at: "2026-09-23",
  },
];

export function getBatchById(id: string): LivestockBatch | undefined {
  return livestockBatches.find((batch) => batch.id === id);
}
