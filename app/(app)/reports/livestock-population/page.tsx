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
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import {
  breedList,
  getBreedName,
  getBreedsBySpecies,
  getSpeciesName,
  livestockList,
  SEX_LABEL,
  speciesList,
  STATUS_BADGE,
  STATUS_LABEL,
  type Livestock,
  type LivestockSex,
  type LivestockStatus,
} from "@/lib/livestock";
import { livestockBatches } from "@/lib/livestock-batches";
import {
  aggregateByMonth,
  countBy,
  DEFAULT_PERIOD,
  resolvePeriod,
  type ReportPeriod,
} from "@/lib/reports";

export default function LivestockPopulationReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);
  const breedOptions =
    speciesFilter === "all" ? breedList : getBreedsBySpecies(speciesFilter);

  const individuals = livestockList.filter((animal) => {
    const matchesSpecies =
      speciesFilter === "all" || animal.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || animal.breed_id === breedFilter;
    const matchesSex = sexFilter === "all" || animal.sex === sexFilter;
    const matchesStatus =
      statusFilter === "all" || animal.status === statusFilter;
    return matchesSpecies && matchesBreed && matchesSex && matchesStatus;
  });

  const batches = livestockBatches.filter((batch) => {
    const matchesSpecies =
      speciesFilter === "all" || batch.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || batch.breed_id === breedFilter;
    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;
    return matchesSpecies && matchesBreed && matchesStatus;
  });

  const activeCount = individuals.filter(
    (animal) => animal.status === "active",
  ).length;
  const totalBatchPopulation = batches.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );

  const individualTrend = aggregateByMonth(
    individuals,
    (animal) => animal.acquisition_date,
    range,
  );
  const batchTrend = aggregateByMonth(
    batches,
    (batch) => batch.acquisition_date,
    range,
    (batch) => batch.quantity,
  );

  const composition = countBy(individuals, (animal) =>
    getSpeciesName(animal.species_id),
  ).map((point) => ({ label: point.key, value: point.count }));

  const groups = new Map<
    string,
    { species: string; breed: string; male: number; female: number; items: Livestock[] }
  >();
  for (const animal of individuals) {
    const key = `${animal.species_id}|${animal.breed_id ?? ""}`;
    const entry = groups.get(key) ?? {
      species: getSpeciesName(animal.species_id),
      breed: getBreedName(animal.breed_id),
      male: 0,
      female: 0,
      items: [],
    };
    if (animal.sex === "male") entry.male += 1;
    else entry.female += 1;
    entry.items.push(animal);
    groups.set(key, entry);
  }

  const tableRows = [...groups.values()]
    .map((group) => ({
      ...group,
      total: group.male + group.female,
      primaryStatus: (countBy(group.items, (animal) => animal.status)[0]
        ?.key ?? "active") as LivestockStatus,
    }))
    .sort((a, b) => a.species.localeCompare(b.species));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Populasi Ternak"
        description="Tren populasi individual dan batch serta komposisi populasi per jenis ternak."
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
          <div className="sm:w-36">
            <Select
              aria-label="Filter jenis kelamin"
              value={sexFilter}
              onChange={(event) => setSexFilter(event.target.value)}
            >
              <option value="all">Semua Kelamin</option>
              {(Object.keys(SEX_LABEL) as LivestockSex[]).map((sex) => (
                <option key={sex} value={sex}>
                  {SEX_LABEL[sex]}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-36">
            <Select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Semua Status</option>
              {(Object.keys(STATUS_LABEL) as LivestockStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards columns={4}>
        <SummaryCard label="Ternak Individu" value={individuals.length} />
        <SummaryCard
          label="Individu Aktif"
          value={activeCount}
          accent="success"
        />
        <SummaryCard label="Total Batch" value={batches.length} />
        <SummaryCard
          label="Populasi Batch"
          value={formatNumber(totalBatchPopulation)}
          hint="Total ekor pada batch"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={individuals.length === 0 && batches.length === 0}
        emptyTitle="Belum ada data populasi"
        emptyDescription="Belum ada data ternak pada filter yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection
            title="Tren Populasi Individu"
            description="Jumlah individu masuk per bulan berdasarkan tanggal perolehan."
          >
            <LineChart data={individualTrend} tone="brand" />
          </ReportSection>
          <ReportSection
            title="Tren Populasi Batch"
            description="Total populasi batch berdasarkan tanggal perolehan."
          >
            <LineChart data={batchTrend} tone="success" />
          </ReportSection>
        </div>

        <ReportSection title="Komposisi Populasi">
          <BarChart data={composition} tone="brand" />
        </ReportSection>

        <ReportSection title="Ringkasan per Jenis & Ras">
          <Table className="min-w-[680px]">
            <THead>
              <tr>
                <TH>Jenis Ternak</TH>
                <TH>Ras</TH>
                <TH className="text-right">Jantan</TH>
                <TH className="text-right">Betina</TH>
                <TH className="text-right">Total</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {tableRows.map((row) => (
                <TR key={`${row.species}-${row.breed}`}>
                  <TD className="font-medium">{row.species}</TD>
                  <TD className="text-muted">{row.breed}</TD>
                  <TD className="text-right">{row.male}</TD>
                  <TD className="text-right">{row.female}</TD>
                  <TD className="text-right font-medium">{row.total}</TD>
                  <TD>
                    <Badge variant={STATUS_BADGE[row.primaryStatus]}>
                      {STATUS_LABEL[row.primaryStatus]}
                    </Badge>
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
