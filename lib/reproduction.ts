/**
 * Frontend-only reference data for reproduction and birth records.
 * Shapes mirror the future `livestock_reproduction_records`, `birth_records`
 * and `birth_offspring` tables. No persistence layer exists.
 */

export type ReproductionStatus = "ongoing" | "pregnant" | "born" | "failed";

export interface LivestockReproductionRecord {
  id: string;
  female_livestock_id: string;
  male_livestock_id: string;
  mating_date: string;
  pregnancy_date: string | null;
  expected_birth_date: string | null;
  actual_birth_date: string | null;
  status: ReproductionStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const REPRODUCTION_STATUS_LABEL: Record<ReproductionStatus, string> = {
  ongoing: "Berlangsung",
  pregnant: "Bunting",
  born: "Lahir",
  failed: "Gagal",
};

export const REPRODUCTION_STATUS_BADGE: Record<
  ReproductionStatus,
  "success" | "info" | "warning" | "danger"
> = {
  ongoing: "info",
  pregnant: "warning",
  born: "success",
  failed: "danger",
};

export const reproductionRecords: LivestockReproductionRecord[] = [
  {
    id: "rp-01",
    female_livestock_id: "lv-05",
    male_livestock_id: "lv-04",
    mating_date: "2025-10-02",
    pregnancy_date: "2025-10-25",
    expected_birth_date: "2026-03-15",
    actual_birth_date: "2026-03-05",
    status: "born",
    notes: "Kelahiran kembar, dua anak sehat.",
    created_at: "2025-10-02",
    updated_at: "2026-03-05",
  },
  {
    id: "rp-02",
    female_livestock_id: "lv-01",
    male_livestock_id: "lv-02",
    mating_date: "2025-12-10",
    pregnancy_date: "2026-01-05",
    expected_birth_date: "2026-06-05",
    actual_birth_date: "2026-05-20",
    status: "born",
    notes: "",
    created_at: "2025-12-10",
    updated_at: "2026-05-20",
  },
  {
    id: "rp-03",
    female_livestock_id: "lv-07",
    male_livestock_id: "lv-06",
    mating_date: "2026-01-20",
    pregnancy_date: "2026-02-12",
    expected_birth_date: "2026-07-01",
    actual_birth_date: "2026-06-10",
    status: "born",
    notes: "",
    created_at: "2026-01-20",
    updated_at: "2026-06-10",
  },
  {
    id: "rp-04",
    female_livestock_id: "lv-10",
    male_livestock_id: "lv-09",
    mating_date: "2025-11-05",
    pregnancy_date: "2025-12-01",
    expected_birth_date: "2026-05-01",
    actual_birth_date: "2026-04-15",
    status: "born",
    notes: "",
    created_at: "2025-11-05",
    updated_at: "2026-04-15",
  },
  {
    id: "rp-05",
    female_livestock_id: "lv-05",
    male_livestock_id: "lv-04",
    mating_date: "2026-07-15",
    pregnancy_date: "2026-08-05",
    expected_birth_date: "2027-01-10",
    actual_birth_date: null,
    status: "pregnant",
    notes: "Dalam pengawasan kandang A.",
    created_at: "2026-07-15",
    updated_at: "2026-08-05",
  },
  {
    id: "rp-06",
    female_livestock_id: "lv-01",
    male_livestock_id: "lv-02",
    mating_date: "2026-09-10",
    pregnancy_date: null,
    expected_birth_date: null,
    actual_birth_date: null,
    status: "ongoing",
    notes: "Pemeriksaan kebuntingan berikutnya 30 hari.",
    created_at: "2026-09-10",
    updated_at: "2026-09-10",
  },
  {
    id: "rp-07",
    female_livestock_id: "lv-10",
    male_livestock_id: "lv-09",
    mating_date: "2026-06-01",
    pregnancy_date: "2026-07-01",
    expected_birth_date: "2026-12-01",
    actual_birth_date: null,
    status: "failed",
    notes: "Kebuntingan tidak berlanjut.",
    created_at: "2026-06-01",
    updated_at: "2026-08-20",
  },
  {
    id: "rp-08",
    female_livestock_id: "lv-13",
    male_livestock_id: "lv-04",
    mating_date: "2026-08-25",
    pregnancy_date: null,
    expected_birth_date: null,
    actual_birth_date: null,
    status: "ongoing",
    notes: "",
    created_at: "2026-08-25",
    updated_at: "2026-08-25",
  },
];

export interface BirthRecord {
  id: string;
  mother_id: string;
  father_id: string | null;
  birth_date: string;
  number_of_offspring: number;
  notes: string;
  created_at: string;
}

export interface BirthOffspring {
  id: string;
  birth_record_id: string;
  livestock_id: string;
}

export const birthRecords: BirthRecord[] = [
  {
    id: "bt-01",
    mother_id: "lv-05",
    father_id: "lv-04",
    birth_date: "2026-03-05",
    number_of_offspring: 2,
    notes: "Kelahiran kembar.",
    created_at: "2026-03-05",
  },
  {
    id: "bt-02",
    mother_id: "lv-01",
    father_id: "lv-02",
    birth_date: "2026-05-20",
    number_of_offspring: 1,
    notes: "",
    created_at: "2026-05-20",
  },
  {
    id: "bt-03",
    mother_id: "lv-07",
    father_id: "lv-06",
    birth_date: "2026-06-10",
    number_of_offspring: 1,
    notes: "",
    created_at: "2026-06-10",
  },
  {
    id: "bt-04",
    mother_id: "lv-10",
    father_id: "lv-09",
    birth_date: "2026-04-15",
    number_of_offspring: 1,
    notes: "",
    created_at: "2026-04-15",
  },
  {
    id: "bt-05",
    mother_id: "lv-13",
    father_id: null,
    birth_date: "2025-12-10",
    number_of_offspring: 1,
    notes: "Induk jantan tidak tercatat.",
    created_at: "2025-12-10",
  },
];

export const birthOffspring: BirthOffspring[] = [
  { id: "bo-01", birth_record_id: "bt-01", livestock_id: "lv-16" },
  { id: "bo-02", birth_record_id: "bt-01", livestock_id: "lv-17" },
  { id: "bo-03", birth_record_id: "bt-02", livestock_id: "lv-18" },
  { id: "bo-04", birth_record_id: "bt-03", livestock_id: "lv-19" },
  { id: "bo-05", birth_record_id: "bt-04", livestock_id: "lv-20" },
];

export function getBirthRecordById(id: string): BirthRecord | undefined {
  return birthRecords.find((record) => record.id === id);
}

export function getOffspringByBirth(birthRecordId: string): BirthOffspring[] {
  return birthOffspring.filter(
    (offspring) => offspring.birth_record_id === birthRecordId,
  );
}
