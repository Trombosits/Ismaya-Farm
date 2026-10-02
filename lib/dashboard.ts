/**
 * Frontend-only dashboard aggregation.
 *
 * Every value here is derived at runtime from the existing mock data. No
 * database field is added; all numbers are UI summaries.
 */

import {
  feedPurchases,
  feedTypes,
  getStockByFeedType,
  getStockStatus,
} from "./feed";
import {
  getBreedName,
  getLivestockById,
  healthRecordList,
  livestockList,
} from "./livestock";
import { livestockBatches } from "./livestock-batches";
import { getSaleTotal, sales } from "./products";
import { birthRecords, reproductionRecords } from "./reproduction";
import { eggCollectionRecords, hatcheryBatches } from "./hatchery";
import {
  aggregateByMonth,
  DEFAULT_PERIOD,
  resolvePeriod,
  REFERENCE_DATE,
} from "./reports";

export type AttentionSeverity = "critical" | "warning" | "info";

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

export interface ActivityItem {
  id: string;
  relative: string;
  title: string;
  reference: string;
}

export interface OperationalStat {
  label: string;
  value: string;
}

export interface DashboardData {
  livestockTotal: number;
  livestockActive: number;
  batchPopulation: number;
  batchActive: number;
  feedTypeCount: number;
  feedBelowMinimum: number;
  salesCount: number;
  salesRevenue: number;
  attention: AttentionItem[];
  activities: ActivityItem[];
  reproduction: OperationalStat[];
  hatchery: OperationalStat[];
  salesTrend: { label: string; value: number }[];
}

function toDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function relativeFromReference(iso: string): string {
  const diff = Math.round(
    (REFERENCE_DATE.getTime() - toDate(iso).getTime()) / 86_400_000,
  );
  if (diff <= 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return `${diff} hari lalu`;
}

function minIso(candidates: string[]): string | null {
  return candidates.reduce<string | null>(
    (min, value) => (min === null || value < min ? value : min),
    null,
  );
}

export function getDashboardData(): DashboardData {
  const referenceIso = `${REFERENCE_DATE.getFullYear()}-${String(
    REFERENCE_DATE.getMonth() + 1,
  ).padStart(2, "0")}-${String(REFERENCE_DATE.getDate()).padStart(2, "0")}`;
  const currentMonth = referenceIso.slice(0, 7);

  const livestockTotal = livestockList.length;
  const livestockActive = livestockList.filter(
    (animal) => animal.status === "active",
  ).length;

  const batchPopulation = livestockBatches.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  const batchActive = livestockBatches.filter(
    (batch) => batch.status === "active",
  ).length;

  const feedTypeCount = feedTypes.length;
  const feedBelowMinimum = feedTypes.filter((feed) => {
    const status = getStockStatus(
      getStockByFeedType(feed.id),
      feed.minimum_stock,
    );
    return status === "below";
  }).length;

  const salesInMonth = sales.filter((sale) =>
    sale.sale_date.startsWith(currentMonth),
  );
  const salesCount = salesInMonth.length;
  const salesRevenue = salesInMonth.reduce(
    (sum, sale) => sum + getSaleTotal(sale.id),
    0,
  );

  const activeMating = reproductionRecords.filter(
    (record) => record.status === "ongoing",
  ).length;
  const pregnant = reproductionRecords.filter(
    (record) => record.status === "pregnant",
  ).length;
  const upcomingBirths = reproductionRecords
    .map((record) => record.expected_birth_date)
    .filter(
      (value): value is string =>
        value !== null && value >= referenceIso,
    );
  const nearestExpected = minIso(upcomingBirths);

  const runningBatches = hatcheryBatches.filter(
    (batch) => batch.status === "incubating",
  );
  const eggsCollected = eggCollectionRecords.reduce(
    (sum, record) => sum + record.quantity,
    0,
  );
  const nearestHatchBatch = runningBatches
    .filter((batch) => batch.expected_hatch_date >= referenceIso)
    .sort((a, b) => (a.expected_hatch_date < b.expected_hatch_date ? -1 : 1))[0];

  const healthCutoff = new Date(
    REFERENCE_DATE.getTime() - 30 * 86_400_000,
  );
  const recentHealthCount = healthRecordList.filter(
    (record) => toDate(record.record_date) >= healthCutoff,
  ).length;

  const severityWeight: Record<AttentionSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  const attention: AttentionItem[] = [];
  if (feedBelowMinimum > 0) {
    attention.push({
      id: "feed-stock",
      severity: "critical",
      title: "Stok Pakan",
      description: `${feedBelowMinimum} jenis pakan berada di bawah minimum stok.`,
      actionLabel: "Lihat Stok Pakan",
      href: "/feed/inventory",
    });
  }
  if (nearestHatchBatch) {
    attention.push({
      id: "hatchery",
      severity: "warning",
      title: "Penetasan",
      description: `Batch ${nearestHatchBatch.batch_code} mendekati tanggal perkiraan menetas.`,
      actionLabel: "Lihat Batch",
      href: `/hatchery/batches/${nearestHatchBatch.id}`,
    });
  }
  if (activeMating > 0 || pregnant > 0) {
    attention.push({
      id: "reproduction",
      severity: "info",
      title: "Reproduksi",
      description: `${activeMating} perkawinan aktif dan ${pregnant} sedang bunting.`,
      actionLabel: "Lihat Reproduksi",
      href: "/livestock/reproduction",
    });
  }
  if (recentHealthCount > 0) {
    attention.push({
      id: "health",
      severity: "info",
      title: "Kesehatan",
      description: `${recentHealthCount} catatan kesehatan terbaru perlu ditinjau.`,
      actionLabel: "Lihat Kesehatan",
      href: "/health",
    });
  }
  attention.sort(
    (a, b) => severityWeight[a.severity] - severityWeight[b.severity],
  );

  const rawActivities: { id: string; date: string; title: string; reference: string }[] =
    [];

  for (const animal of livestockList) {
    rawActivities.push({
      id: `livestock-${animal.id}`,
      date: animal.created_at,
      title: "Ternak ditambahkan",
      reference: `${animal.tag_code} — ${getBreedName(animal.breed_id)}`,
    });
  }
  for (const record of healthRecordList) {
    const animal = getLivestockById(record.livestock_id);
    rawActivities.push({
      id: `health-${record.id}`,
      date: record.record_date,
      title: "Pemeriksaan kesehatan dicatat",
      reference: `${animal?.tag_code ?? "—"} — ${record.condition}`,
    });
  }
  for (const purchase of feedPurchases) {
    rawActivities.push({
      id: `feed-${purchase.id}`,
      date: purchase.purchase_date,
      title: "Pembelian pakan dicatat",
      reference: purchase.invoice_number || "Tanpa invoice",
    });
  }
  for (const sale of sales) {
    rawActivities.push({
      id: `sale-${sale.id}`,
      date: sale.sale_date,
      title: "Penjualan dibuat",
      reference: sale.invoice_number,
    });
  }
  for (const birth of birthRecords) {
    const mother = getLivestockById(birth.mother_id);
    rawActivities.push({
      id: `birth-${birth.id}`,
      date: birth.birth_date,
      title: "Kelahiran dicatat",
      reference: `${mother?.tag_code ?? "—"} — ${birth.number_of_offspring} anak`,
    });
  }
  for (const batch of hatcheryBatches) {
    rawActivities.push({
      id: `hatch-${batch.id}`,
      date: batch.start_date,
      title: "Batch penetasan dimulai",
      reference: batch.batch_code,
    });
  }

  const activities = rawActivities
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 7)
    .map((activity) => ({
      id: activity.id,
      relative: relativeFromReference(activity.date),
      title: activity.title,
      reference: activity.reference,
    }));

  const trendRange = resolvePeriod(DEFAULT_PERIOD);
  const salesTrend = aggregateByMonth(
    sales,
    (sale) => sale.sale_date,
    trendRange,
    (sale) => getSaleTotal(sale.id),
  ).map((point) => ({ label: point.label, value: point.value }));

  return {
    livestockTotal,
    livestockActive,
    batchPopulation,
    batchActive,
    feedTypeCount,
    feedBelowMinimum,
    salesCount,
    salesRevenue,
    attention,
    activities,
    reproduction: [
      { label: "Perkawinan aktif", value: String(activeMating) },
      { label: "Sedang bunting", value: String(pregnant) },
      {
        label: "Perkiraan kelahiran terdekat",
        value: nearestExpected ? formatShort(nearestExpected) : "—",
      },
    ],
    hatchery: [
      { label: "Batch berjalan", value: String(runningBatches.length) },
      { label: "Telur dikumpulkan", value: String(eggsCollected) },
      {
        label: "Perkiraan menetas terdekat",
        value: nearestHatchBatch
          ? formatShort(nearestHatchBatch.expected_hatch_date)
          : "—",
      },
    ],
    salesTrend,
  };
}

function formatShort(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const monthShort = new Intl.DateTimeFormat("id-ID", {
    month: "short",
  }).format(new Date(year, month - 1, day));
  return `${day} ${monthShort}`;
}
