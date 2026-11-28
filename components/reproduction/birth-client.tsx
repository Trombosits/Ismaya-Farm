"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  BirthDetailDialog,
  type BirthLivestockSummary,
  type BirthOffspringDetail,
} from "@/components/reproduction/birth-detail-dialog";
import {
  BirthFormDialog,
  type BirthLivestockOption,
} from "@/components/reproduction/birth-form-dialog";
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
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { formatDate } from "@/lib/livestock";
import type { BirthRecord } from "@/lib/reproduction";
import { deleteBirthRecord } from "@/app/(app)/livestock/births/actions";

const PAGE_SIZE = 10;

export interface BirthPageRecord {
  record: BirthRecord;
  mother: BirthLivestockSummary | null;
  father: BirthLivestockSummary | null;
  offspring: BirthOffspringDetail[];
}

interface BirthsClientProps {
  records: BirthPageRecord[];
  livestockOptions: BirthLivestockOption[];
}

export default function BirthsClient({
  records,
  livestockOptions,
}: BirthsClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<BirthRecord | null>(null);
  const [deleting, setDeleting] = useState<BirthRecord | null>(null);
  const [viewing, setViewing] = useState<BirthPageRecord | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return records.filter(({ record, mother, father }) => {
      if (!normalized) return true;

      return (
        (mother?.tag_code ?? "").toLowerCase().includes(normalized) ||
        (father?.tag_code ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [records, normalized]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const searchEmpty = normalized.length > 0 && filtered.length === 0;

  const totalOffspring = filtered.reduce(
    (sum, item) => sum + item.record.number_of_offspring,
    0,
  );

  const latestBirthDate = filtered.reduce<string | null>(
    (max, item) =>
      max === null || item.record.birth_date > max
        ? item.record.birth_date
        : max,
    null,
  );

  async function handleDelete() {
    if (!deleting) return;

    setDeleteError("");

    const result = await deleteBirthRecord(Number(deleting.id));

    if (!result.success) {
      setDeleteError(result.message);
      return;
    }

    setDeleting(null);
    router.refresh();
  }

  function renderLivestock(
    animal: BirthLivestockSummary | null,
    emptyLabel: string,
  ) {
    if (!animal) {
      return <span className="text-sm text-muted">{emptyLabel}</span>;
    }

    return (
      <Link
        href={`/livestock/${animal.id}`}
        className="font-mono text-xs font-semibold text-ink hover:underline"
      >
        {animal.tag_code}
      </Link>
    );
  }

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
            {rows.map(({ record, mother, father, offspring }) => (
              <TR key={record.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(record.birth_date)}
                </TD>

                <TD>{renderLivestock(mother, "Data induk tidak tersedia")}</TD>

                <TD className="hidden md:table-cell">
                  {renderLivestock(father, "—")}
                </TD>

                <TD className="text-right font-medium">
                  {record.number_of_offspring}
                </TD>

                <TD>
                  <RowActions
                    label="Aksi kelahiran"
                    onView={() =>
                      setViewing({
                        record,
                        mother,
                        father,
                        offspring,
                      })
                    }
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

      {addOpen ? (
        <BirthFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
          livestockOptions={livestockOptions}
        />
      ) : null}

      {editing ? (
        <BirthFormDialog
          open
          mode="edit"
          record={editing}
          onClose={() => setEditing(null)}
          livestockOptions={livestockOptions}
        />
      ) : null}

      {viewing ? (
        <BirthDetailDialog
          record={viewing.record}
          mother={viewing.mother}
          father={viewing.father}
          offspring={viewing.offspring}
          onClose={() => setViewing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Data Kelahiran?"
          description={
            deleteError ||
            "Apakah Anda yakin ingin menghapus data kelahiran ini? Data anak ternak yang sudah dibuat tidak akan ikut dihapus."
          }
          confirmLabel="Hapus"
          onClose={() => {
            setDeleting(null);
            setDeleteError("");
          }}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
