"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  HATCHERY_STATUS_BADGE,
  HATCHERY_STATUS_LABEL,
  type HatcheryBatch,
  type HatcheryBatchStatus,
} from "@/lib/hatchery";

import {
  getHatcheryBatches,
  getSpeciesOptions,
  deleteHatcheryBatch,
} from "./actions";

import { formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";

import { HatcheryBatchFormDialog } from "@/components/hatchery/hatchery-batch-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
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

const PAGE_SIZE = 10;

export default function HatcheryBatchesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [batches, setBatches] = useState<HatcheryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speciesOptions, setSpeciesOptions] = useState<
    { id: number; name: string }[]
  >([]);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const [batchResult, speciesResult] = await Promise.all([
        getHatcheryBatches(),
        getSpeciesOptions(),
      ]);

      if (batchResult.success) {
        setBatches(batchResult.data);
      } else {
        setError(batchResult.message);
      }

      if (speciesResult.success) {
        setSpeciesOptions(speciesResult.data);
      } else {
        setError(speciesResult.message);
      }

      setLoading(false);
    }

    fetchData();
  }, [refreshKey]);
  async function handleDeleteBatch() {
    if (!deleting) return;

    const result = await deleteHatcheryBatch(deleting.id);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setBatches((current) =>
      current.filter((batch) => batch.id !== deleting.id),
    );

    setDeleting(null);
  }
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<HatcheryBatch | null>(null);
  const [deleting, setDeleting] = useState<HatcheryBatch | null>(null);
  const getSpeciesLabel = (speciesId: number) => {
    return (
      speciesOptions.find((species) => species.id === speciesId)?.name ??
      "Jenis ternak tidak ditemukan"
    );
  };
  const normalized = query.trim().toLowerCase();
  const isFiltered = normalized.length > 0 || statusFilter !== "all";
  const filtered = batches.filter((batch) => {
    const matchesQuery =
      normalized.length === 0 ||
      batch.batch_code.toLowerCase().includes(normalized) ||
      getSpeciesLabel(batch.species_id).toLowerCase().includes(normalized);
    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;
  const incubating = filtered.filter((batch) => batch.status === "incubating");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Batch Penetasan"
        description="Daftar batch penetasan telur beserta statusnya."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Batch
          </Button>
        }
      />

      <SummaryCards>
        <SummaryCard label="Total Batch" value={filtered.length} />
        <SummaryCard
          label="Batch Berjalan"
          value={incubating.length}
          accent="info"
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Batch Penetasan" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari batch atau jenis ternak…"
            aria-label="Cari batch berdasarkan kode atau jenis ternak"
            className="w-full sm:max-w-xs"
          />
          <div className="w-full sm:w-44">
            <Select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Semua Status</option>
              {(
                Object.keys(HATCHERY_STATUS_LABEL) as HatcheryBatchStatus[]
              ).map((status) => (
                <option key={status} value={status}>
                  {HATCHERY_STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      {loading ? (
        <p className="text-sm text-muted">Memuat data batch...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600">Gagal memuat data: {error}</p>
      ) : null}

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={6}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada batch penetasan"
        emptyDescription="Belum ada data batch penetasan yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
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
        <Table className="min-w-[820px]">
          <THead>
            <tr>
              <TH>Batch Code</TH>
              <TH>Jenis Ternak</TH>
              <TH>Tanggal Mulai</TH>
              <TH className="text-right">Jumlah Telur</TH>
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
                    onClick={() => router.push(`/hatchery/batches/${batch.id}`)}
                    className="font-mono text-[13px] font-semibold text-ink transition-colors hover:text-brand-700"
                  >
                    {batch.batch_code}
                  </button>
                </TD>
                <TD>{getSpeciesLabel(batch.species_id)}</TD>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(batch.start_date)}
                </TD>
                <TD className="text-right font-medium">
                  {formatNumber(batch.egg_quantity)}
                </TD>
                <TD>
                  <Badge variant={HATCHERY_STATUS_BADGE[batch.status]}>
                    {HATCHERY_STATUS_LABEL[batch.status]}
                  </Badge>
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${batch.batch_code}`}
                    onView={() => router.push(`/hatchery/batches/${batch.id}`)}
                    onEdit={() => setEditing(batch)}
                    onDelete={() => setDeleting(batch)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <HatcheryBatchFormDialog
          open
          mode="create"
          speciesOptions={speciesOptions}
          onClose={() => setAddOpen(false)}
          onSuccess={() => setRefreshKey((current) => current + 1)}
        />
      ) : null}

      {editing ? (
        <HatcheryBatchFormDialog
          open
          mode="edit"
          batch={editing}
          speciesOptions={speciesOptions}
          onClose={() => setEditing(null)}
          onSuccess={() => setRefreshKey((current) => current + 1)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Batch Penetasan?"
          description={`Apakah Anda yakin ingin menghapus batch "${deleting.batch_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={handleDeleteBatch}
        />
      ) : null}
    </div>
  );
}
