"use client";

import { useCallback, useEffect, useState } from "react";
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

import type { EggCollectionRecord } from "@/lib/hatchery";
import { formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";

import {
  deleteEggCollectionRecord,
  getEggCollectionRecords,
  getSpeciesOptions,
} from "@/app/(app)/hatchery/batches/actions";

const PAGE_SIZE = 10;

interface SpeciesOption {
  id: number;
  name: string;
}

export default function EggCollectionPage() {
  // Data dari database
  const [records, setRecords] = useState<EggCollectionRecord[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOption[]>([]);

  // State halaman
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");

  // State dialog
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<EggCollectionRecord | null>(null);
  const [deleting, setDeleting] = useState<EggCollectionRecord | null>(null);

  // State proses
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Mengambil nama jenis ternak berdasarkan species_id
  const getSpeciesLabel = (speciesId: number | string) => {
    return (
      speciesOptions.find((species) => species.id === Number(speciesId))
        ?.name ?? "Jenis ternak tidak ditemukan"
    );
  };

  // Memuat data pengumpulan telur dan jenis ternak
  const loadRecords = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [recordsResult, speciesResult] = await Promise.all([
        getEggCollectionRecords(),
        getSpeciesOptions(),
      ]);

      if (!recordsResult.success) {
        setLoadError(recordsResult.message);
        return;
      }

      if (!speciesResult.success) {
        setLoadError(speciesResult.message);
        return;
      }

      setRecords(recordsResult.data as EggCollectionRecord[]);

      setSpeciesOptions(
        speciesResult.data.map((species) => ({
          id: Number(species.id),
          name: species.name,
        })),
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Gagal memuat data pengumpulan telur.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Memuat data ketika halaman pertama kali dibuka
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Pencarian dan filter
  const normalized = query.trim().toLowerCase();

  const isFiltered = normalized.length > 0 || speciesFilter !== "all";

  const filtered = records.filter((record) => {
    const speciesName = getSpeciesLabel(record.species_id);

    const matchesQuery =
      normalized.length === 0 || speciesName.toLowerCase().includes(normalized);

    const matchesSpecies =
      speciesFilter === "all" || String(record.species_id) === speciesFilter;

    return matchesQuery && matchesSpecies;
  });

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, pageCount);

  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const searchEmpty = isFiltered && filtered.length === 0;

  // Ringkasan data
  const totalEggs = filtered.reduce(
    (sum, record) => sum + Number(record.quantity),
    0,
  );

  const latestCollectionDate = filtered.reduce<string | null>(
    (latest, record) => {
      if (latest === null || record.collection_date > latest) {
        return record.collection_date;
      }

      return latest;
    },
    null,
  );

  // Menghapus data pengumpulan telur
  async function handleDelete() {
    if (!deleting) return;

    setDeletingLoading(true);
    setDeleteError("");

    try {
      const result = await deleteEggCollectionRecord(Number(deleting.id));

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setDeleting(null);
      await loadRecords();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus data pengumpulan telur.",
      );
    } finally {
      setDeletingLoading(false);
    }
  }

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

      {/* Pesan error */}
      {(loadError || deleteError) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {loadError || deleteError}
        </div>
      )}

      {/* Ringkasan */}
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

      {/* Toolbar pencarian dan filter */}
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

              {speciesOptions.map((species) => (
                <option key={species.id} value={String(species.id)}>
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

      {/* Tabel data */}
      <TableStatePanel
        state={loading ? "loading" : loadError ? "error" : viewState}
        onRetry={loadRecords}
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
                  {getSpeciesLabel(record.species_id)}
                </TD>

                <TD className="text-right font-medium">
                  {formatNumber(Number(record.quantity))}
                </TD>

                <TD className="max-w-56 truncate text-xs text-muted">
                  {record.notes || "—"}
                </TD>

                <TD>
                  <RowActions
                    label="Aksi pengumpulan telur"
                    onEdit={() => setEditing(record)}
                    onDelete={() => {
                      setDeleteError("");
                      setDeleting(record);
                    }}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {/* Dialog tambah */}
      {addOpen && (
        <EggCollectionFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
          onSaved={loadRecords}
        />
      )}

      {/* Dialog edit */}
      {editing && (
        <EggCollectionFormDialog
          open
          mode="edit"
          record={editing}
          onClose={() => setEditing(null)}
          onSaved={loadRecords}
        />
      )}

      {/* Dialog hapus */}
      {deleting && (
        <ConfirmDialog
          open
          destructive
          title="Hapus Pengumpulan Telur?"
          description="Apakah Anda yakin ingin menghapus data pengumpulan telur ini?"
          confirmLabel="Hapus"
          onClose={() => {
            if (!deletingLoading) {
              setDeleting(null);
            }
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
