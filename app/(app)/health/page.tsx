"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, SearchX } from "lucide-react";

import { HealthFormDialog } from "@/components/livestock/health-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import {
  formatDate,
  getBreedName,
  getLivestockById,
  getSpeciesName,
  healthConditions,
  healthRecordList,
  livestockList,
  type LivestockHealthRecord,
} from "@/lib/livestock";

const PAGE_SIZE = 10;

export default function HealthPage() {
  const [query, setQuery] = useState("");
  const [livestockFilter, setLivestockFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<LivestockHealthRecord | null>(null);
  const [deleting, setDeleting] = useState<LivestockHealthRecord | null>(null);

  const normalized = query.trim().toLowerCase();
  const isFiltered =
    normalized.length > 0 ||
    livestockFilter !== "all" ||
    conditionFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const filtered = healthRecordList.filter((record) => {
    const animal = getLivestockById(record.livestock_id);
    const tag = animal?.tag_code ?? "";
    const matchesQuery =
      normalized.length === 0 ||
      tag.toLowerCase().includes(normalized) ||
      record.condition.toLowerCase().includes(normalized) ||
      record.diagnosis.toLowerCase().includes(normalized);
    const matchesLivestock =
      livestockFilter === "all" || record.livestock_id === livestockFilter;
    const matchesCondition =
      conditionFilter === "all" || record.condition === conditionFilter;
    const matchesFrom = dateFrom === "" || record.record_date >= dateFrom;
    const matchesTo = dateTo === "" || record.record_date <= dateTo;
    return (
      matchesQuery &&
      matchesLivestock &&
      matchesCondition &&
      matchesFrom &&
      matchesTo
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isSearchEmpty = isFiltered && filtered.length === 0;

  const currentMonth = healthRecordList
    .reduce(
      (max, record) => (record.record_date > max ? record.record_date : max),
      "",
    )
    .slice(0, 7);
  const thisMonthCount = filtered.filter((record) =>
    record.record_date.startsWith(currentMonth),
  ).length;
  const lastRecordDate = filtered.reduce<string | null>(
    (max, record) =>
      max === null || record.record_date > max ? record.record_date : max,
    null,
  );

  function update(updateFn: () => void) {
    updateFn();
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Riwayat Kesehatan"
        description="Catatan kejadian kesehatan per individu ternak, termasuk kondisi dan diagnosisnya."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            Tambah Riwayat
          </Button>
        }
      />

      <SummaryCards>
        <SummaryCard label="Total Catatan" value={filtered.length} />
        <SummaryCard
          label="Pemeriksaan Bulan Ini"
          value={thisMonthCount}
          hint="Berdasarkan bulan data terbaru"
        />
        <SummaryCard
          label="Pemeriksaan Terakhir"
          value={lastRecordDate ? formatDate(lastRecordDate) : "—"}
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Riwayat Kesehatan" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => update(() => setQuery(value))}
            placeholder="Cari tag atau diagnosis…"
            aria-label="Cari riwayat berdasarkan tag, kondisi, atau diagnosis"
            className="w-full sm:max-w-xs"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-44">
              <Select
                aria-label="Filter ternak"
                value={livestockFilter}
                onChange={(event) =>
                  update(() => setLivestockFilter(event.target.value))
                }
              >
                <option value="all">Semua Ternak</option>
                {livestockList.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.tag_code}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:w-44">
              <Select
                aria-label="Filter kondisi"
                value={conditionFilter}
                onChange={(event) =>
                  update(() => setConditionFilter(event.target.value))
                }
              >
                <option value="all">Semua Kondisi</option>
                {healthConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <Input
                type="date"
                aria-label="Tanggal mulai"
                value={dateFrom}
                onChange={(event) =>
                  update(() => setDateFrom(event.target.value))
                }
                className="sm:w-36"
              />
              <span aria-hidden className="text-subtle">
                –
              </span>
              <Input
                type="date"
                aria-label="Tanggal akhir"
                value={dateTo}
                onChange={(event) =>
                  update(() => setDateTo(event.target.value))
                }
                className="sm:w-36"
              />
            </div>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      {viewState === "loading" ? (
        <TableSkeleton rows={8} columns={5} />
      ) : viewState === "error" ? (
        <ErrorState onRetry={() => setViewState("data")} />
      ) : viewState === "empty" ? (
        <EmptyState
          title="Belum ada riwayat kesehatan"
          description="Belum ada catatan kesehatan ternak yang tersedia."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden className="size-4" />
              Tambah Riwayat
            </Button>
          }
        />
      ) : isSearchEmpty ? (
        <EmptyState
          icon={<SearchX className="size-4" />}
          title="Tidak ada data yang sesuai"
          description="Coba ubah kata pencarian atau filter yang digunakan."
        />
      ) : (
        <Table className="min-w-[680px]">
          <THead>
            <tr>
              <TH className="w-32">Tanggal</TH>
              <TH>Ternak</TH>
              <TH>Kondisi</TH>
              <TH>Diagnosis</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((record) => {
              const animal = getLivestockById(record.livestock_id);
              return (
                <TR key={record.id}>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(record.record_date)}
                  </TD>
                  <TD>
                    {animal ? (
                      <Link
                        href={`/livestock/${animal.id}`}
                        className="flex flex-col transition-colors hover:text-brand-700"
                      >
                        <span className="font-mono text-[13px] font-semibold text-ink">
                          {animal.tag_code}
                        </span>
                        <span className="text-[11px] text-subtle">
                          {getSpeciesName(animal.species_id)} ·{" "}
                          {getBreedName(animal.breed_id)}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </TD>
                  <TD>{record.condition}</TD>
                  <TD className="text-muted">
                    {record.diagnosis || "—"}
                  </TD>
                  <TD>
                    <RowActions
                      label={`Aksi untuk riwayat ${
                        animal?.tag_code ?? record.id
                      }`}
                      onEdit={() => setEditing(record)}
                      onDelete={() => setDeleting(record)}
                    />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      {viewState === "data" && !isSearchEmpty ? (
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      {addOpen ? (
        <HealthFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <HealthFormDialog
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
          title="Hapus Riwayat Kesehatan?"
          description="Apakah Anda yakin ingin menghapus riwayat kesehatan ini?"
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
