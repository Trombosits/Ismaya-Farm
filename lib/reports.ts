/**
 * Frontend-only helpers for the reporting module.
 *
 * All aggregations are derived at runtime from the existing mock data. No
 * database field is added; period/month helpers and bucketing are UI-only.
 */

export const REFERENCE_DATE = new Date(2026, 8, 24);

export type ReportCategory =
  | "Ternak"
  | "Kesehatan"
  | "Reproduksi"
  | "Pakan"
  | "Penetasan"
  | "Penjualan"
  | "Pembelian";

export const REPORT_CATEGORIES: ReportCategory[] = [
  "Ternak",
  "Kesehatan",
  "Reproduksi",
  "Pakan",
  "Penetasan",
  "Penjualan",
  "Pembelian",
];

export interface ReportMeta {
  slug: string;
  title: string;
  description: string;
  category: ReportCategory;
}

export const reportCatalog: ReportMeta[] = [
  {
    slug: "livestock-population",
    title: "Populasi Ternak",
    description:
      "Tren populasi individual dan batch, serta komposisi populasi per jenis ternak.",
    category: "Ternak",
  },
  {
    slug: "livestock",
    title: "Data Ternak",
    description:
      "Rincian registri ternak individual beserta status dan tipe perolehannya.",
    category: "Ternak",
  },
  {
    slug: "livestock-mortality",
    title: "Tren Kematian Ternak",
    description:
      "Analisis kematian ternak per periode dan jenis ternak untuk evaluasi operasional.",
    category: "Ternak",
  },
  {
    slug: "health",
    title: "Riwayat Kesehatan",
    description:
      "Tren pemeriksaan kesehatan dan sebaran kondisi serta diagnosis ternak.",
    category: "Kesehatan",
  },
  {
    slug: "reproduction",
    title: "Perkawinan & Kehamilan",
    description:
      "Aktivitas perkawinan, status kebuntingan, dan kelahiran ternak.",
    category: "Reproduksi",
  },
  {
    slug: "births",
    title: "Kelahiran",
    description: "Tren kelahiran dan jumlah anak yang lahir per periode.",
    category: "Reproduksi",
  },
  {
    slug: "feed-usage",
    title: "Penggunaan Pakan",
    description:
      "Tren penggunaan stok pakan dan jenis pakan yang paling banyak digunakan.",
    category: "Pakan",
  },
  {
    slug: "feed-purchases",
    title: "Pembelian Pakan",
    description: "Tren pengeluaran dan pembelian pakan per jenis pakan.",
    category: "Pakan",
  },
  {
    slug: "feed-stock",
    title: "Pergerakan Stok Pakan",
    description:
      "Arus stok pakan masuk dan keluar untuk pemantauan persediaan.",
    category: "Pakan",
  },
  {
    slug: "egg-collection",
    title: "Pengumpulan Telur",
    description: "Tren pengumpulan telur per periode dan jenis ternak.",
    category: "Penetasan",
  },
  {
    slug: "hatchery",
    title: "Hasil Penetasan",
    description:
      "Ringkasan batch penetasan, candling, dan hasil menetas/survival.",
    category: "Penetasan",
  },
  {
    slug: "sales",
    title: "Penjualan",
    description: "Tren nilai penjualan dan kontribusi per produk.",
    category: "Penjualan",
  },
  {
    slug: "purchases",
    title: "Pembelian",
    description:
      "Tren pengeluaran pembelian operasional dan pembelian per kategori.",
    category: "Pembelian",
  },
];

export function getReportMeta(slug: string): ReportMeta | undefined {
  return reportCatalog.find((report) => report.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Period helpers                                                       */
/* ------------------------------------------------------------------ */

export type PeriodPreset = "month" | "3m" | "6m" | "year" | "custom";

export interface ReportPeriod {
  preset: PeriodPreset;
  from: string;
  to: string;
}

export const DEFAULT_PERIOD: ReportPeriod = {
  preset: "6m",
  from: "",
  to: "",
};

export const PERIOD_LABEL: Record<PeriodPreset, string> = {
  month: "Bulan Ini",
  "3m": "3 Bulan Terakhir",
  "6m": "6 Bulan Terakhir",
  year: "Tahun Ini",
  custom: "Kustom",
};

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DateRange {
  from: string;
  to: string;
}

export function resolvePeriod(period: ReportPeriod): DateRange {
  if (period.preset === "custom") {
    return {
      from: period.from || "0000-01-01",
      to: period.to || "9999-12-31",
    };
  }

  const reference = REFERENCE_DATE;
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);

  let start: Date;
  switch (period.preset) {
    case "month":
      start = new Date(reference.getFullYear(), reference.getMonth(), 1);
      break;
    case "3m":
      start = new Date(reference.getFullYear(), reference.getMonth() - 2, 1);
      break;
    case "6m":
      start = new Date(reference.getFullYear(), reference.getMonth() - 5, 1);
      break;
    case "year":
      start = new Date(reference.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  }

  return { from: toIso(start), to: toIso(end) };
}

export function withinRange(iso: string, range: DateRange): boolean {
  return iso >= range.from && iso <= range.to;
}

export function monthKeysBetween(from: string, to: string): string[] {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  const keys: string[] = [];
  let year = fromYear;
  let month = fromMonth;

  while (
    (year < toYear || (year === toYear && month <= toMonth)) &&
    keys.length < 24
  ) {
    keys.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return keys;
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const short = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
    new Date(year, month - 1, 1),
  );
  return `${short} ${String(year).slice(2)}`;
}

export interface MonthPoint {
  key: string;
  label: string;
  value: number;
}

export function aggregateByMonth<T>(
  items: T[],
  dateOf: (item: T) => string,
  range: DateRange,
  valueOf: (item: T) => number = () => 1,
): MonthPoint[] {
  const keys = monthKeysBetween(range.from, range.to);
  const totals = new Map(keys.map((key) => [key, 0]));

  for (const item of items) {
    const key = dateOf(item).slice(0, 7);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + valueOf(item));
    }
  }

  return keys.map((key) => ({
    key,
    label: monthLabel(key),
    value: totals.get(key) ?? 0,
  }));
}

export interface CountPoint {
  key: string;
  count: number;
}

export function countBy<T>(
  items: T[],
  keyOf: (item: T) => string,
): CountPoint[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export interface SumPoint {
  key: string;
  total: number;
}

export function sumBy<T>(
  items: T[],
  keyOf: (item: T) => string,
  valueOf: (item: T) => number,
): SumPoint[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    map.set(key, (map.get(key) ?? 0) + valueOf(item));
  }
  return [...map.entries()]
    .map(([key, total]) => ({ key, total }))
    .sort((a, b) => b.total - a.total);
}

export function latestIso<T>(
  items: T[],
  dateOf: (item: T) => string,
): string | null {
  return items.reduce<string | null>(
    (max, item) => {
      const value = dateOf(item);
      return max === null || value > max ? value : max;
    },
    null,
  );
}

/* ------------------------------------------------------------------ */
/* Mortality simulation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Frontend-only simulation of livestock mortality events. The current schema
 * has no death-date field, so this clearly-labelled mock keeps the UI ready
 * to accept real mortality data later. It does not modify `livestock`.
 */
export interface MortalityEvent {
  id: string;
  tag_code: string;
  species_id: string;
  breed_id: string | null;
  sex: "male" | "female";
  event_date: string;
}

export const mortalityEvents: MortalityEvent[] = [
  {
    id: "me-01",
    tag_code: "KMB-009",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "female",
    event_date: "2026-05-12",
  },
  {
    id: "me-02",
    tag_code: "KMB-014",
    species_id: "sp-01",
    breed_id: "br-03",
    sex: "male",
    event_date: "2026-06-03",
  },
  {
    id: "me-03",
    tag_code: "AYM-011",
    species_id: "sp-02",
    breed_id: "br-05",
    sex: "male",
    event_date: "2026-06-20",
  },
  {
    id: "me-04",
    tag_code: "AYM-015",
    species_id: "sp-02",
    breed_id: "br-06",
    sex: "female",
    event_date: "2026-07-08",
  },
  {
    id: "me-05",
    tag_code: "BBK-006",
    species_id: "sp-03",
    breed_id: "br-09",
    sex: "male",
    event_date: "2026-07-22",
  },
  {
    id: "me-06",
    tag_code: "AYM-019",
    species_id: "sp-02",
    breed_id: "br-07",
    sex: "female",
    event_date: "2026-08-15",
  },
  {
    id: "me-07",
    tag_code: "KMB-018",
    species_id: "sp-01",
    breed_id: "br-01",
    sex: "female",
    event_date: "2026-08-28",
  },
  {
    id: "me-08",
    tag_code: "KLC-004",
    species_id: "sp-09",
    breed_id: "br-17",
    sex: "male",
    event_date: "2026-09-10",
  },
  {
    id: "me-09",
    tag_code: "BBK-009",
    species_id: "sp-03",
    breed_id: "br-10",
    sex: "female",
    event_date: "2026-09-18",
  },
];
