"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import {
  breedList,
  formatDate,
  getBreedName,
  getBreedsBySpecies,
  getSpeciesName,
  speciesList,
  STATUS_BADGE,
  STATUS_LABEL,
  type LivestockStatus,
} from "@/lib/livestock";
import {
  livestockBatches,
  type LivestockBatch,
} from "@/lib/livestock-batches";
import { formatNumber } from "@/lib/format";

const PAGE_SIZE = 10;

interface BatchListProps {
  onCreate: () => void;
  onEdit: (batch: LivestockBatch) => void;
  onDelete: (batch: LivestockBatch) => void;
}

export function BatchList({ onCreate, onEdit, onDelete }: BatchListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");

  const normalized = query.trim().toLowerCase();
  const breedOptions =
    speciesFilter === "all" ? breedList : getBreedsBySpecies(speciesFilter);

  const isFiltered =
    normalized.length > 0 ||
    speciesFilter !== "all" ||
    breedFilter !== "all" ||
    statusFilter !== "all";

  const filtered = livestockBatches.filter((batch) => {
    const matchesQuery =
      normalized.length === 0 ||
      batch.batch_code.toLowerCase().includes(normalized) ||
      getSpeciesName(batch.species_id).toLowerCase().includes(normalized) ||
      getBreedName(batch.breed_id).toLowerCase().includes(normalized);
    const matchesSpecies =
      speciesFilter === "all" || batch.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || batch.breed_id === breedFilter;
    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;
    return matchesQuery && matchesSpecies && matchesBreed && matchesStatus;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  const totalPopulation = filtered.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  const activeCount = filtered.filter(
    (batch) => batch.status === "active",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <SummaryCards>
        <SummaryCard label="Total Batch" value={filtered.length} />
        <SummaryCard
          label="Total Populasi"
          value={formatNumber(totalPopulation)}
          hint="Total ekor pada batch"
        />
        <SummaryCard
          label="Batch Aktif"
          value={activeCount}
          accent="success"
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Batch" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari batch, jenis, atau ras…"
            aria-label="Cari batch berdasarkan kode, jenis, atau ras"
            className="w-full sm:max-w-xs"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-40">
              <Select
                aria-label="Filter jenis ternak"
                value={speciesFilter}
                onChange={(event) => {
                  setSpeciesFilter(event.target.value);
                  setBreedFilter("all");
                  setPage(1);
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
                disabled={breedOptions.length === 0}
                onChange={(event) => {
                  setBreedFilter(event.target.value);
                  setPage(1);
                }}
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
                aria-label="Filter status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                {(Object.keys(STATUS_LABEL) as LivestockStatus[]).map(
                  (status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={7}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada batch ternak"
        emptyDescription="Belum ada batch ternak yang terdaftar."
        emptyAction={
          <Button onClick={onCreate}>
            <Plus aria-hidden className="size-4" />
            Tambah Batch
          </Button>
        }
        pagination={
          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        <Table className="min-w-[760px]">
          <THead>
            <tr>
              <TH>Batch Code</TH>
              <TH>Jenis Ternak</TH>
              <TH>Ras</TH>
              <TH className="text-right">Jumlah</TH>
              <TH className="hidden md:table-cell">Tanggal Perolehan</TH>
              <TH>Status</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((batch) => (
              <TR key={batch.id}>
                <TD>
                  <button
                    type="button"
                    onClick={() => router.push(`/livestock/batches/${batch.id}`)}
                    className="font-mono text-[13px] font-semibold text-ink transition-colors hover:text-brand-700"
                  >
                    {batch.batch_code}
                  </button>
                </TD>
                <TD>{getSpeciesName(batch.species_id)}</TD>
                <TD className="text-muted">{getBreedName(batch.breed_id)}</TD>
                <TD className="text-right font-medium">
                  {formatNumber(batch.quantity)}
                </TD>
                <TD className="hidden whitespace-nowrap text-xs text-muted md:table-cell">
                  {formatDate(batch.acquisition_date)}
                </TD>
                <TD>
                  <Badge variant={STATUS_BADGE[batch.status]}>
                    {STATUS_LABEL[batch.status]}
                  </Badge>
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${batch.batch_code}`}
                    onView={() =>
                      router.push(`/livestock/batches/${batch.id}`)
                    }
                    onEdit={() => onEdit(batch)}
                    onDelete={() => onDelete(batch)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>
    </div>
  );
}
