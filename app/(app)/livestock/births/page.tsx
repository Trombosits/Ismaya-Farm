"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { LivestockCell } from "@/components/livestock/livestock-cell";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { BirthDetailDialog } from "@/components/reproduction/birth-detail-dialog";
import { BirthFormDialog } from "@/components/reproduction/birth-form-dialog";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { formatDate, getLivestockById } from "@/lib/livestock";
import { birthRecords, type BirthRecord } from "@/lib/reproduction";

const PAGE_SIZE = 10;

export default function BirthsPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<BirthRecord | null>(null);
  const [deleting, setDeleting] = useState<BirthRecord | null>(null);
  const [viewing, setViewing] = useState<BirthRecord | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = birthRecords.filter((record) => {
    if (normalized.length === 0) return true;
    const mother = getLivestockById(record.mother_id);
    const father = record.father_id ? getLivestockById(record.father_id) : null;
    return (
      (mother?.tag_code ?? "").toLowerCase().includes(normalized) ||
      (father?.tag_code ?? "").toLowerCase().includes(normalized)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = normalized.length > 0 && filtered.length === 0;

  const totalOffspring = filtered.reduce(
    (sum, record) => sum + record.number_of_offspring,
    0,
  );
  const latestBirthDate = filtered.reduce<string | null>(
    (max, record) =>
      max === null || record.birth_date > max ? record.birth_date : max,
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Kelahiran"
        description="Catatan kelahiran ternak beserta jumlah anak yang lahir."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Kelahiran
          </Button>
        }
      />

      <SummaryCards>
        <SummaryCard label="Total Kelahiran" value={filtered.length} />
        <SummaryCard label="Total Anak" value={totalOffspring} />
        <SummaryCard
          label="Kelahiran Terbaru"
          value={latestBirthDate ? formatDate(latestBirthDate) : "—"}
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Kelahiran" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari tag induk…"
            aria-label="Cari kelahiran berdasarkan tag induk"
            className="w-full sm:max-w-xs"
          />
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
        emptyTitle="Belum ada data kelahiran"
        emptyDescription="Belum ada catatan kelahiran yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Kelahiran
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
        <Table className="min-w-[620px]">
          <THead>
            <tr>
              <TH>Tanggal Lahir</TH>
              <TH>Induk Betina</TH>
              <TH className="hidden md:table-cell">Induk Jantan</TH>
              <TH className="text-right">Jumlah Anak</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((record) => (
              <TR key={record.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(record.birth_date)}
                </TD>
                <TD>
                  <LivestockCell id={record.mother_id} />
                </TD>
                <TD className="hidden md:table-cell">
                  <LivestockCell id={record.father_id} />
                </TD>
                <TD className="text-right font-medium">
                  {record.number_of_offspring}
                </TD>
                <TD>
                  <RowActions
                    label="Aksi kelahiran"
                    onView={() => setViewing(record)}
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
        <BirthFormDialog open mode="create" onClose={() => setAddOpen(false)} />
      ) : null}

      {editing ? (
        <BirthFormDialog
          open
          mode="edit"
          record={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {viewing ? (
        <BirthDetailDialog record={viewing} onClose={() => setViewing(null)} />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Data Kelahiran?"
          description="Apakah Anda yakin ingin menghapus data kelahiran ini?"
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
