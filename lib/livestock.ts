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

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
