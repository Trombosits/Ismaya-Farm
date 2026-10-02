"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { EggCollectionFormDialog } from "@/components/hatchery/egg-collection-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import {
  eggCollectionRecords,
  type EggCollectionRecord,
} from "@/lib/hatchery";
import { formatNumber } from "@/lib/format";
import { formatDate, getSpeciesName, speciesList } from "@/lib/livestock";

const PAGE_SIZE = 10;

export default function EggCollectionPage() {
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<EggCollectionRecord | null>(null);
  const [deleting, setDeleting] = useState<EggCollectionRecord | null>(null);

  const normalized = query.trim().toLowerCase();
  const isFiltered = normalized.length > 0 || speciesFilter !== "all";
  const filtered = eggCollectionRecords.filter((record) => {
    const matchesQuery =
      normalized.length === 0 ||
      getSpeciesName(record.species_id).toLowerCase().includes(normalized);
    const matchesSpecies =
      speciesFilter === "all" || record.species_id === speciesFilter;
    return matchesQuery && matchesSpecies;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  const totalEggs = filtered.reduce((sum, record) => sum + record.quantity, 0);
  const latestCollectionDate = filtered.reduce<string | null>(
    (max, record) =>
      max === null || record.collection_date > max
        ? record.collection_date
        : max,
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pengumpulan Telur"
        description="Catatan hasil pengumpulan telur per jenis ternak."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Pengumpulan
          </Button>
        }
      />

      <SummaryCards columns={2}>
        <SummaryCard
          label="Total Telur Dikumpulkan"
          value={formatNumber(totalEggs)}
        />
        <SummaryCard
          label="Pengumpulan Terakhir"
          value={latestCollectionDate ? formatDate(latestCollectionDate) : "—"}
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Pengumpulan Telur" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari jenis ternak…"
            aria-label="Cari pengumpulan telur berdasarkan jenis ternak"
            className="w-full sm:max-w-xs"
          />
          <div className="w-full sm:w-48">
            <Select
              aria-label="Filter jenis ternak"
              value={speciesFilter}
              onChange={(event) => {
                setSpeciesFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Semua Jenis Ternak</option>
              {speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </Select>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={5}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada data pengumpulan telur"
        emptyDescription="Belum ada catatan pengumpulan telur yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Pengumpulan
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
        <Table className="min-w-[600px]">
          <THead>
            <tr>
              <TH>Tanggal</TH>
              <TH>Jenis Ternak</TH>
              <TH className="text-right">Jumlah Telur</TH>
              <TH>Catatan</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((record) => (
              <TR key={record.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(record.collection_date)}
                </TD>
                <TD className="font-medium">
                  {getSpeciesName(record.species_id)}
                </TD>
                <TD className="text-right font-medium">
                  {formatNumber(record.quantity)}
                </TD>
                <TD className="max-w-56 truncate text-xs text-muted">
                  {record.notes || "—"}
                </TD>
                <TD>
                  <RowActions
                    label="Aksi pengumpulan telur"
                    onEdit={() => setEditing(record)}
                    onDelete={() => setDeleting(record)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <EggCollectionFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <EggCollectionFormDialog
          open
          mode="edit"
          record={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Pengumpulan Telur?"
          description="Apakah Anda yakin ingin menghapus data pengumpulan telur ini?"
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
