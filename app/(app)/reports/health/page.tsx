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
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  breedList,
  formatDate,
  getBreedName,
  getBreedsBySpecies,
  getLivestockById,
  getSpeciesName,
  healthConditions,
  healthRecordList,
  speciesList,
} from "@/lib/livestock";
import {
  aggregateByMonth,
  countBy,
  DEFAULT_PERIOD,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function HealthReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);
  const breedOptions =
    speciesFilter === "all" ? breedList : getBreedsBySpecies(speciesFilter);
  const diagnoses = Array.from(
    new Set(healthRecordList.map((record) => record.diagnosis).filter(Boolean)),
  );

  const domainFiltered = healthRecordList.filter((record) => {
    const animal = getLivestockById(record.livestock_id);
    const matchesSpecies =
      speciesFilter === "all" || animal?.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || animal?.breed_id === breedFilter;
    const matchesCondition =
      conditionFilter === "all" || record.condition === conditionFilter;
    const matchesDiagnosis =
      diagnosisFilter === "all" || record.diagnosis === diagnosisFilter;
    return (
      matchesSpecies && matchesBreed && matchesCondition && matchesDiagnosis
    );
  });

  const records = domainFiltered.filter((record) =>
    withinRange(record.record_date, range),
  );

  const topDiagnosis =
    countBy(records, (record) => record.diagnosis || "—")[0]?.key ?? "—";
  const trend = aggregateByMonth(
    records,
    (record) => record.record_date,
    range,
  );
  const conditionChart = countBy(records, (record) => record.condition).map(
    (entry) => ({ label: entry.key, value: entry.count }),
  );

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Riwayat Kesehatan"
        description="Tren pemeriksaan kesehatan dan sebaran kondisi serta diagnosis ternak."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <div className="sm:w-40">
            <Select
              aria-label="Filter jenis ternak"
              value={speciesFilter}
              onChange={(event) => {
                setSpeciesFilter(event.target.value);
                setBreedFilter("all");
              }}
            >
              <option value="all">Semua Jenis</option>
              {speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-40">
            <Select
              aria-label="Filter ras"
              value={breedFilter}
              onChange={(event) => setBreedFilter(event.target.value)}
            >
              <option value="all">Semua Ras</option>
              {breedOptions.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-40">
            <Select
              aria-label="Filter kondisi"
              value={conditionFilter}
              onChange={(event) => setConditionFilter(event.target.value)}
            >
              <option value="all">Semua Kondisi</option>
              {healthConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-44">
            <Select
              aria-label="Filter diagnosis"
              value={diagnosisFilter}
              onChange={(event) => setDiagnosisFilter(event.target.value)}
            >
              <option value="all">Semua Diagnosis</option>
              {diagnoses.map((diagnosis) => (
                <option key={diagnosis} value={diagnosis}>
                  {diagnosis}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard label="Total Catatan" value={domainFiltered.length} />
        <SummaryCard
          label="Pemeriksaan Periode Ini"
          value={records.length}
          accent="info"
        />
        <SummaryCard
          label="Diagnosis Terbanyak"
          value={topDiagnosis}
          hint="Pada periode yang dipilih"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={records.length === 0}
        emptyTitle="Belum ada catatan kesehatan"
        emptyDescription="Belum ada catatan kesehatan pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Pemeriksaan" description="Agregasi bulanan.">
            <LineChart data={trend} tone="info" />
          </ReportSection>
          <ReportSection title="Kondisi Kesehatan">
            {conditionChart.length === 0 ? (
              <EmptyState
                title="Belum ada data"
                description="Belum ada kondisi pada periode ini."
              />
            ) : (
              <BarChart data={conditionChart} tone="info" />
            )}
          </ReportSection>
        </div>

        <ReportSection title="Daftar Pemeriksaan">
          <Table className="min-w-[860px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Tag Code</TH>
                <TH>Jenis Ternak</TH>
                <TH>Ras</TH>
                <TH>Kondisi</TH>
                <TH>Diagnosis</TH>
                <TH>Catatan</TH>
              </tr>
            </THead>
            <TBody>
              {records.map((record) => {
                const animal = getLivestockById(record.livestock_id);
                return (
                  <TR key={record.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(record.record_date)}
                    </TD>
                    <TD className="font-mono text-[13px] font-semibold text-ink">
                      {animal?.tag_code ?? "—"}
                    </TD>
                    <TD>
                      {animal ? getSpeciesName(animal.species_id) : "—"}
                    </TD>
                    <TD className="text-muted">
                      {animal ? getBreedName(animal.breed_id) : "—"}
                    </TD>
                    <TD>{record.condition}</TD>
                    <TD className="text-muted">{record.diagnosis || "—"}</TD>
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
