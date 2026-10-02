"use client";

import { useState } from "react";

import { BarChart, LineChart } from "@/components/reports/charts";
import {
  ReportFilters,
  ReportHeader,
  ReportPeriodFilter,
  ReportSection,
  ReportStatePanel,
} from "@/components/reports/report-ui";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { eggCollectionRecords } from "@/lib/hatchery";
import { formatDate, getSpeciesName, speciesList } from "@/lib/livestock";
import {
  aggregateByMonth,
  countBy,
  DEFAULT_PERIOD,
  latestIso,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function EggCollectionReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const domainFiltered = eggCollectionRecords.filter(
    (record) =>
      speciesFilter === "all" || record.species_id === speciesFilter,
  );
  const records = domainFiltered.filter((record) =>
    withinRange(record.collection_date, range),
  );

  const totalEggs = records.reduce((sum, record) => sum + record.quantity, 0);
  const average = records.length > 0 ? Math.round(totalEggs / records.length) : 0;
  const latestCollection = latestIso(
    domainFiltered,
    (record) => record.collection_date,
  );

  const trend = aggregateByMonth(
    records,
    (record) => record.collection_date,
    range,
    (record) => record.quantity,
  );
  const bySpecies = countBy(records, (record) =>
    getSpeciesName(record.species_id),
  ).map((entry) => ({
    label: entry.key,
    value: records
      .filter((record) => getSpeciesName(record.species_id) === entry.key)
      .reduce((sum, record) => sum + record.quantity, 0),
  }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Pengumpulan Telur"
        description="Tren pengumpulan telur per periode dan jenis ternak."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="w-full sm:w-40">
          <Select
            aria-label="Filter jenis ternak"
            value={speciesFilter}
            onChange={(event) => setSpeciesFilter(event.target.value)}
          >
            <option value="all">Semua Jenis</option>
            {speciesList.map((species) => (
              <option key={species.id} value={species.id}>
                {species.name}
              </option>
            ))}
          </Select>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard
          label="Total Telur Dikumpulkan"
          value={formatNumber(totalEggs)}
        />
        <SummaryCard
          label="Pengumpulan Terakhir"
          value={latestCollection ? formatDate(latestCollection) : "—"}
        />
        <SummaryCard
          label="Rata-rata per Pengumpulan"
          value={formatNumber(average)}
          accent="info"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={records.length === 0}
        emptyTitle="Belum ada data pengumpulan"
        emptyDescription="Belum ada pengumpulan telur pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Pengumpulan Telur">
            <LineChart data={trend} tone="brand" />
          </ReportSection>
          <ReportSection title="Pengumpulan per Jenis Ternak">
            <BarChart data={bySpecies} tone="success" />
          </ReportSection>
        </div>

        <ReportSection title="Daftar Pengumpulan">
          <Table className="min-w-[560px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Jenis Ternak</TH>
                <TH className="text-right">Quantity</TH>
                <TH>Catatan</TH>
              </tr>
            </THead>
            <TBody>
              {records.map((record) => (
                <TR key={record.id}>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(record.collection_date)}
                  </TD>
                  <TD className="font-medium">
                    {getSpeciesName(record.species_id)}
                  </TD>
                  <TD className="text-right">{formatNumber(record.quantity)}</TD>
                  <TD className="max-w-56 truncate text-xs text-muted">
                    {record.notes || "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
