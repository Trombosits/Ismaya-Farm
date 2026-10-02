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
import {
  formatDate,
  getLivestockById,
  speciesList,
} from "@/lib/livestock";
import {
  aggregateByMonth,
  DEFAULT_PERIOD,
  latestIso,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";
import { birthRecords } from "@/lib/reproduction";

export default function BirthsReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const domainFiltered = birthRecords.filter((record) => {
    const mother = getLivestockById(record.mother_id);
    return speciesFilter === "all" || mother?.species_id === speciesFilter;
  });

  const records = domainFiltered.filter((record) =>
    withinRange(record.birth_date, range),
  );

  const totalOffspring = domainFiltered.reduce(
    (sum, record) => sum + record.number_of_offspring,
    0,
  );
  const latestBirth = latestIso(
    domainFiltered,
    (record) => record.birth_date,
  );

  const trend = aggregateByMonth(
    records,
    (record) => record.birth_date,
    range,
  );
  const offspringByMonth = aggregateByMonth(
    records,
    (record) => record.birth_date,
    range,
    (record) => record.number_of_offspring,
  );

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Kelahiran"
        description="Tren kelahiran dan jumlah anak yang lahir per periode."
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
        <SummaryCard label="Total Kelahiran" value={domainFiltered.length} />
        <SummaryCard label="Total Anak" value={totalOffspring} accent="success" />
        <SummaryCard
          label="Kelahiran Terbaru"
          value={latestBirth ? formatDate(latestBirth) : "—"}
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={records.length === 0}
        emptyTitle="Belum ada data kelahiran"
        emptyDescription="Belum ada data kelahiran pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Kelahiran" description="Agregasi bulanan.">
            <LineChart data={trend} tone="brand" />
          </ReportSection>
          <ReportSection title="Jumlah Anak per Periode">
            <BarChart data={offspringByMonth} tone="success" />
          </ReportSection>
        </div>

        <ReportSection title="Daftar Kelahiran">
          <Table className="min-w-[720px]">
            <THead>
              <tr>
                <TH>Tanggal Kelahiran</TH>
                <TH>Induk Betina</TH>
                <TH>Induk Jantan</TH>
                <TH className="text-right">Jumlah Anak</TH>
                <TH>Catatan</TH>
              </tr>
            </THead>
            <TBody>
              {records.map((record) => {
                const mother = getLivestockById(record.mother_id);
                const father = record.father_id
                  ? getLivestockById(record.father_id)
                  : undefined;
                return (
                  <TR key={record.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(record.birth_date)}
                    </TD>
                    <TD className="font-mono text-[13px] font-semibold text-ink">
                      {mother?.tag_code ?? "—"}
                    </TD>
                    <TD className="font-mono text-[13px] text-muted">
                      {father?.tag_code ?? "—"}
                    </TD>
                    <TD className="text-right font-medium">
                      {record.number_of_offspring}
                    </TD>
                    <TD className="max-w-56 truncate text-xs text-muted">
                      {record.notes || "—"}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
