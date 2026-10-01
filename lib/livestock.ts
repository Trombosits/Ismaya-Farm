/**
 * Frontend-only reference data.
 *
 * Shapes mirror the future database tables `livestock_species` and
 * `livestock_breeds` so the UI stays consistent with the planned backend.
 * There is intentionally no persistence, API, or ORM layer here.
 */

export interface LivestockSpecies {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface LivestockBreed {
  id: string;
  species_id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export const speciesList: LivestockSpecies[] = [
  {
    id: "sp-01",
    name: "Kambing",
    code: "KMB",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "sp-02",
    name: "Ayam",
    code: "AYM",
    created_at: "2026-09-12",
    updated_at: "2026-09-13",
  },
  {
    id: "sp-03",
    name: "Bebek",
    code: "BBK",
    created_at: "2026-09-13",
    updated_at: "2026-09-13",
  },
  {
    id: "sp-04",
    name: "Sapi",
    code: "SPI",
    created_at: "2026-09-14",
    updated_at: "2026-09-18",
  },
  {
    id: "sp-05",
    name: "Domba",
    code: "DMB",
    created_at: "2026-09-15",
    updated_at: "2026-09-15",
  },
  {
    id: "sp-06",
    name: "Itik",
    code: "ITK",
    created_at: "2026-09-16",
    updated_at: "2026-09-16",
  },
  {
    id: "sp-07",
    name: "Angsa",
    code: "AGS",
    created_at: "2026-09-17",
    updated_at: "2026-09-20",
  },
  {
    id: "sp-08",
    name: "Puyuh",
    code: "PYH",
    created_at: "2026-09-18",
    updated_at: "2026-09-18",
  },
  {
    id: "sp-09",
    name: "Kelinci",
    code: "KLC",
    created_at: "2026-09-19",
    updated_at: "2026-09-19",
  },
  {
    id: "sp-10",
    name: "Kalkun",
    code: "KLK",
    created_at: "2026-09-20",
    updated_at: "2026-09-22",
  },
  {
    id: "sp-11",
    name: "Kuda",
    code: "KDA",
    created_at: "2026-09-21",
    updated_at: "2026-09-21",
  },
  {
    id: "sp-12",
    name: "Babi",
    code: "BBI",
    created_at: "2026-09-22",
    updated_at: "2026-09-23",
  },
];

export const breedList: LivestockBreed[] = [
  {
    id: "br-01",
    species_id: "sp-01",
    name: "Etawa",
    code: "ETW",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "br-02",
    species_id: "sp-01",
    name: "Jawa Randu",
    code: "JWR",
    created_at: "2026-09-12",
    updated_at: "2026-09-14",
  },
  {
    id: "br-03",
    species_id: "sp-01",
    name: "Boer",
    code: "BOR",
    created_at: "2026-09-13",
    updated_at: "2026-09-13",
  },
  {
    id: "br-04",
    species_id: "sp-01",
    name: "Saanen",
    code: "SAN",
    created_at: "2026-09-14",
    updated_at: "2026-09-14",
  },
  {
    id: "br-05",
    species_id: "sp-02",
    name: "Broiler",
    code: "BRL",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "br-06",
    species_id: "sp-02",
    name: "Layer",
    code: "LYR",
    created_at: "2026-09-13",
    updated_at: "2026-09-16",
  },
  {
    id: "br-07",
    species_id: "sp-02",
    name: "Kampung",
    code: "KMP",
    created_at: "2026-09-15",
    updated_at: "2026-09-15",
  },
  {
    id: "br-08",
    species_id: "sp-02",
    name: "Brahma",
    code: "BRH",
    created_at: "2026-09-16",
    updated_at: "2026-09-16",
  },
  {
    id: "br-09",
    species_id: "sp-03",
    name: "Peking",
    code: "PEK",
    created_at: "2026-09-13",
    updated_at: "2026-09-13",
  },
  {
    id: "br-10",
    species_id: "sp-03",
    name: "Mojosari",
    code: "MJR",
    created_at: "2026-09-17",
    updated_at: "2026-09-19",
  },
  {
    id: "br-11",
    species_id: "sp-04",
    name: "Limousin",
    code: "LMS",
    created_at: "2026-09-14",
    updated_at: "2026-09-14",
  },
  {
    id: "br-12",
    species_id: "sp-04",
    name: "Brahman",
    code: "BRM",
    created_at: "2026-09-15",
    updated_at: "2026-09-18",
  },
  {
    id: "br-13",
    species_id: "sp-04",
    name: "Friesian Holstein",
    code: "FHL",
    created_at: "2026-09-16",
    updated_at: "2026-09-16",
  },
  {
    id: "br-14",
    species_id: "sp-05",
    name: "Merino",
    code: "MRN",
    created_at: "2026-09-15",
    updated_at: "2026-09-15",
  },
  {
    id: "br-15",
    species_id: "sp-05",
    name: "Garut",
    code: "GRT",
    created_at: "2026-09-18",
    updated_at: "2026-09-18",
  },
  {
    id: "br-16",
    species_id: "sp-08",
    name: "Coturnix",
    code: "CTQ",
    created_at: "2026-09-18",
    updated_at: "2026-09-18",
  },
  {
    id: "br-17",
    species_id: "sp-09",
    name: "Rex",
    code: "REX",
    created_at: "2026-09-19",
    updated_at: "2026-09-21",
  },
  {
    id: "br-18",
    species_id: "sp-09",
    name: "Angora",
    code: "ANG",
    created_at: "2026-09-20",
    updated_at: "2026-09-20",
  },
];

export function getSpeciesName(speciesId: string): string {
  return speciesList.find((species) => species.id === speciesId)?.name ?? "—";
}

export function getBreedName(breedId: string | null): string {
  if (!breedId) return "—";
  return breedList.find((breed) => breed.id === breedId)?.name ?? "—";
}

export function getBreedsBySpecies(speciesId: string): LivestockBreed[] {
  return breedList.filter((breed) => breed.species_id === speciesId);
}

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseIso(iso));
}

/* ------------------------------------------------------------------ */
/* Individual livestock (`livestock`)                                   */
/* ------------------------------------------------------------------ */

export type LivestockSex = "male" | "female";

export type LivestockStatus = "active" | "sold" | "dead" | "transferred";

export type AcquisitionType = "born" | "purchased" | "gift";

export interface Livestock {
  id: string;
  tag_code: string;
  species_id: string;
  breed_id: string | null;
  sex: LivestockSex;
  birth_date: string;
  acquisition_date: string;
  acquisition_type: AcquisitionType;
  status: LivestockStatus;
  mother_id: string | null;
  father_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const SEX_LABEL: Record<LivestockSex, string> = {
  male: "Jantan",
  female: "Betina",
};

export const STATUS_LABEL: Record<LivestockStatus, string> = {
  active: "Aktif",
  sold: "Dijual",
  dead: "Mati",
  transferred: "Dipindahkan",
};

export const STATUS_BADGE: Record<
  LivestockStatus,
  "success" | "info" | "danger" | "neutral"
> = {
  active: "success",
  sold: "info",
  dead: "danger",
  transferred: "neutral",
};

export const ACQUISITION_LABEL: Record<AcquisitionType, string> = {
  born: "Lahir di Peternakan",
  purchased: "Pembelian",
  gift: "Hibah",
};

export const livestockList: Livestock[] = [
  {
    id: "lv-01",
    tag_code: "KMB-001",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "female",
    birth_date: "2025-03-12",
    acquisition_date: "2025-03-12",
    acquisition_type: "born",
    status: "active",
    mother_id: "lv-05",
    father_id: "lv-04",
    notes: "Ternak sehat, pertumbuhan normal.",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "lv-02",
    tag_code: "KMB-002",
    species_id: "sp-01",
    breed_id: "br-03",
    sex: "male",
    birth_date: "2024-01-05",
    acquisition_date: "2024-01-05",
    acquisition_type: "born",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "Digunakan sebagai pejantan.",
    created_at: "2026-09-12",
    updated_at: "2026-09-14",
  },
  {
    id: "lv-03",
    tag_code: "KMB-003",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "female",
    birth_date: "2025-04-20",
    acquisition_date: "2025-04-20",
    acquisition_type: "born",
    status: "sold",
    mother_id: null,
    father_id: null,
    notes: "",
    created_at: "2026-09-13",
    updated_at: "2026-09-13",
  },
  {
    id: "lv-04",
    tag_code: "KMB-004",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "male",
    birth_date: "2023-06-15",
    acquisition_date: "2023-06-15",
    acquisition_type: "born",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "Pejantan utama kandang A.",
    created_at: "2026-09-12",
    updated_at: "2026-09-18",
  },
  {
    id: "lv-05",
    tag_code: "KMB-012",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "female",
    birth_date: "2022-02-10",
    acquisition_date: "2022-02-10",
    acquisition_type: "born",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "Induk produktif.",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "lv-06",
    tag_code: "AYM-001",
    species_id: "sp-02",
    breed_id: "br-05",
    sex: "male",
    birth_date: "2026-06-01",
    acquisition_date: "2026-06-01",
    acquisition_type: "purchased",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "Kelompok broiler kandang B.",
    created_at: "2026-09-13",
    updated_at: "2026-09-13",
  },
  {
    id: "lv-07",
    tag_code: "AYM-002",
    species_id: "sp-02",
    breed_id: "br-06",
    sex: "female",
    birth_date: "2025-11-12",
    acquisition_date: "2025-11-12",
    acquisition_type: "purchased",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "",
    created_at: "2026-09-13",
    updated_at: "2026-09-16",
  },
  {
    id: "lv-08",
    tag_code: "AYM-003",
    species_id: "sp-02",
    breed_id: "br-07",
    sex: "male",
    birth_date: "2025-09-30",
    acquisition_date: "2025-10-02",
    acquisition_type: "purchased",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "Ayam kampung.",
    created_at: "2026-09-14",
    updated_at: "2026-09-14",
  },
  {
    id: "lv-09",
    tag_code: "BBK-001",
    species_id: "sp-03",
    breed_id: "br-09",
    sex: "male",
    birth_date: "2025-12-05",
    acquisition_date: "2025-12-05",
    acquisition_type: "born",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "",
    created_at: "2026-09-15",
    updated_at: "2026-09-15",
  },
  {
    id: "lv-10",
    tag_code: "BBK-002",
    species_id: "sp-03",
    breed_id: "br-10",
    sex: "female",
    birth_date: "2026-01-18",
    acquisition_date: "2026-01-20",
    acquisition_type: "purchased",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "",
    created_at: "2026-09-15",
    updated_at: "2026-09-15",
  },
  {
    id: "lv-11",
    tag_code: "SPI-001",
    species_id: "sp-04",
    breed_id: "br-11",
    sex: "male",
    birth_date: "2022-08-20",
    acquisition_date: "2022-09-01",
    acquisition_type: "purchased",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "Sapi pedaging.",
    created_at: "2026-09-16",
    updated_at: "2026-09-18",
  },
  {
    id: "lv-12",
    tag_code: "SPI-002",
    species_id: "sp-04",
    breed_id: "br-13",
    sex: "female",
    birth_date: "2021-05-02",
    acquisition_date: "2021-05-02",
    acquisition_type: "born",
    status: "transferred",
    mother_id: null,
    father_id: null,
    notes: "Dipindahkan ke kandang mitra.",
    created_at: "2026-09-16",
    updated_at: "2026-09-20",
  },
  {
    id: "lv-13",
    tag_code: "DMB-001",
    species_id: "sp-05",
    breed_id: "br-14",
    sex: "female",
    birth_date: "2024-10-10",
    acquisition_date: "2024-10-10",
    acquisition_type: "born",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "",
    created_at: "2026-09-17",
    updated_at: "2026-09-17",
  },
  {
    id: "lv-14",
    tag_code: "KLC-001",
    species_id: "sp-09",
    breed_id: "br-17",
    sex: "male",
    birth_date: "2026-02-14",
    acquisition_date: "2026-02-14",
    acquisition_type: "born",
    status: "dead",
    mother_id: null,
    father_id: null,
    notes: "Mati akibat sakit yang tidak terdiagnosis.",
    created_at: "2026-09-18",
    updated_at: "2026-09-22",
  },
  {
    id: "lv-15",
    tag_code: "KMB-005",
    species_id: "sp-01",
    breed_id: "br-02",
    sex: "female",
    birth_date: "2026-07-01",
    acquisition_date: "2026-07-01",
    acquisition_type: "born",
    status: "active",
    mother_id: null,
    father_id: null,
    notes: "",
    created_at: "2026-09-19",
    updated_at: "2026-09-19",
  },
  {
    id: "lv-16",
    tag_code: "KMB-021",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "female",
    birth_date: "2026-03-05",
    acquisition_date: "2026-03-05",
    acquisition_type: "born",
    status: "active",
    mother_id: "lv-05",
    father_id: "lv-04",
    notes: "Anak dari kelahiran 05 Mar 2026.",
    created_at: "2026-09-20",
    updated_at: "2026-09-20",
  },
  {
    id: "lv-17",
    tag_code: "KMB-022",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "male",
    birth_date: "2026-03-05",
    acquisition_date: "2026-03-05",
    acquisition_type: "born",
    status: "active",
    mother_id: "lv-05",
    father_id: "lv-04",
    notes: "Anak dari kelahiran 05 Mar 2026.",
    created_at: "2026-09-20",
    updated_at: "2026-09-20",
  },
  {
    id: "lv-18",
    tag_code: "KMB-023",
    species_id: "sp-01",
    breed_id: "br-03",
    sex: "female",
    birth_date: "2026-05-20",
    acquisition_date: "2026-05-20",
    acquisition_type: "born",
    status: "active",
    mother_id: "lv-01",
    father_id: "lv-02",
    notes: "",
    created_at: "2026-09-20",
    updated_at: "2026-09-20",
  },
  {
    id: "lv-19",
    tag_code: "AYM-004",
    species_id: "sp-02",
    breed_id: "br-05",
    sex: "male",
    birth_date: "2026-06-10",
    acquisition_date: "2026-06-10",
    acquisition_type: "born",
    status: "active",
    mother_id: "lv-07",
    father_id: "lv-06",
    notes: "",
    created_at: "2026-09-21",
    updated_at: "2026-09-21",
  },
  {
    id: "lv-20",
    tag_code: "BBK-003",
    species_id: "sp-03",
    breed_id: "br-09",
    sex: "female",
    birth_date: "2026-04-15",
    acquisition_date: "2026-04-15",
    acquisition_type: "born",
    status: "active",
    mother_id: "lv-10",
    father_id: "lv-09",
    notes: "",
    created_at: "2026-09-21",
    updated_at: "2026-09-21",
  },
];

export function getLivestockById(id: string): Livestock | undefined {
  return livestockList.find((animal) => animal.id === id);
}

export function getLivestockLabel(id: string | null): string {
  if (!id) return "—";
  return getLivestockById(id)?.tag_code ?? "—";
}

/** Human-readable reference such as `KMB-012 — Etawa`. */
export function getLivestockReference(id: string | null): string {
  if (!id) return "Tidak tercatat";
  const animal = getLivestockById(id);
  if (!animal) return "Tidak tercatat";
  return `${animal.tag_code} — ${getBreedName(animal.breed_id)}`;
}

const AGE_REFERENCE = new Date(2026, 8, 24);

/** Derived display value, never a stored field. */
export function formatAge(birthIso: string): string {
  const birth = parseIso(birthIso);
  let months =
    (AGE_REFERENCE.getFullYear() - birth.getFullYear()) * 12 +
    (AGE_REFERENCE.getMonth() - birth.getMonth());
  if (AGE_REFERENCE.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years === 0) return `${months} bln`;
  if (remainder === 0) return `${years} th`;
  return `${years} th ${remainder} bln`;
}

/* ------------------------------------------------------------------ */
/* Health records (`livestock_health_records`)                          */
/* ------------------------------------------------------------------ */

export interface LivestockHealthRecord {
  id: string;
  livestock_id: string;
  record_date: string;
  condition: string;
  diagnosis: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const healthRecordList: LivestockHealthRecord[] = [
  {
    id: "hr-01",
    livestock_id: "lv-01",
    record_date: "2026-09-12",
    condition: "Kurang aktif",
    diagnosis: "Demam",
    notes: "Nafsu makan menurun, diberi antipiretik.",
    created_at: "2026-09-12",
    updated_at: "2026-09-12",
  },
  {
    id: "hr-02",
    livestock_id: "lv-03",
    record_date: "2026-09-08",
    condition: "Luka kaki",
    diagnosis: "Infeksi",
    notes: "Luka dibersihkan dan diberi antiseptik.",
    created_at: "2026-09-08",
    updated_at: "2026-09-09",
  },
  {
    id: "hr-03",
    livestock_id: "lv-02",
    record_date: "2026-09-05",
    condition: "Nafsu makan menurun",
    diagnosis: "Gangguan pencernaan",
    notes: "",
    created_at: "2026-09-05",
    updated_at: "2026-09-05",
  },
  {
    id: "hr-04",
    livestock_id: "lv-06",
    record_date: "2026-09-02",
    condition: "Napas cepat",
    diagnosis: "Infeksi saluran pernapasan",
    notes: "Dipisahkan dari kelompok.",
    created_at: "2026-09-02",
    updated_at: "2026-09-02",
  },
  {
    id: "hr-05",
    livestock_id: "lv-09",
    record_date: "2026-08-28",
    condition: "Diare",
    diagnosis: "Gangguan pencernaan",
    notes: "",
    created_at: "2026-08-28",
    updated_at: "2026-08-28",
  },
  {
    id: "hr-06",
    livestock_id: "lv-11",
    record_date: "2026-08-25",
    condition: "Sehat",
    diagnosis: "Tidak ada kelainan",
    notes: "Pemeriksaan rutin.",
    created_at: "2026-08-25",
    updated_at: "2026-08-25",
  },
  {
    id: "hr-07",
    livestock_id: "lv-05",
    record_date: "2026-08-20",
    condition: "Lesu",
    diagnosis: "Kekurangan nutrisi",
    notes: "Diberikan suplemen tambahan.",
    created_at: "2026-08-20",
    updated_at: "2026-08-21",
  },
  {
    id: "hr-08",
    livestock_id: "lv-07",
    record_date: "2026-08-15",
    condition: "Kulit berkerak",
    diagnosis: "Infestasi ektoparasit",
    notes: "",
    created_at: "2026-08-15",
    updated_at: "2026-08-15",
  },
  {
    id: "hr-09",
    livestock_id: "lv-13",
    record_date: "2026-08-10",
    condition: "Pincang",
    diagnosis: "Cedera ringan",
    notes: "",
    created_at: "2026-08-10",
    updated_at: "2026-08-10",
  },
  {
    id: "hr-10",
    livestock_id: "lv-14",
    record_date: "2026-08-05",
    condition: "Lemah",
    diagnosis: "Belum terdiagnosis",
    notes: "Dalam pengawasan.",
    created_at: "2026-08-05",
    updated_at: "2026-08-06",
  },
];

export const healthConditions: string[] = Array.from(
  new Set(healthRecordList.map((record) => record.condition)),
);
