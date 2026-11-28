"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import {
  ReproductionFormDialog,
  type ReproductionLivestockOption,
} from "@/components/reproduction/reproduction-form-dialog";
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
import { formatDate } from "@/lib/livestock";
import {
  REPRODUCTION_STATUS_BADGE,
  REPRODUCTION_STATUS_LABEL,
  type LivestockReproductionRecord,
  type ReproductionStatus,
} from "@/lib/reproduction";
import { deleteReproductionRecord } from "@/app/(app)/livestock/reproduction/actions";

const PAGE_SIZE = 10;

export interface ReproductionPageRecord {
  record: LivestockReproductionRecord;
  female: ReproductionLivestockOption | null;
  male: ReproductionLivestockOption | null;
}

interface ReproductionClientProps {
  records: ReproductionPageRecord[];
  livestockOptions: ReproductionLivestockOption[];
}

export default function ReproductionClient({
  records,
  livestockOptions,
}: ReproductionClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [livestockFilter, setLivestockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<LivestockReproductionRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState<LivestockReproductionRecord | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return records.filter(({ record, female, male }) => {
      const matchesQuery =
        normalized.length === 0 ||
        (female?.tag_code ?? "").toLowerCase().includes(normalized) ||
        (male?.tag_code ?? "").toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      const matchesLivestock =
        livestockFilter === "all" ||
        record.female_livestock_id === livestockFilter ||
        record.male_livestock_id === livestockFilter;

      return matchesQuery && matchesStatus && matchesLivestock;
    });
  }, [records, normalized, statusFilter, livestockFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const isFiltered =
    normalized.length > 0 ||
    statusFilter !== "all" ||
    livestockFilter !== "all";

  const searchEmpty = isFiltered && filtered.length === 0;

  const pregnantCount = filtered.filter(
    ({ record }) => record.status === "pregnant",
  ).length;

  const bornCount = filtered.filter(
    ({ record }) => record.status === "born",
  ).length;

  function resetPage(updateFn: () => void) {
    updateFn();
    setPage(1);
  }

  function renderAnimal(animal: ReproductionLivestockOption | null) {
    if (!animal) {
      return <span className="text-sm text-muted">—</span>;
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs font-semibold text-ink">
          {animal.tag_code}
        </span>
        <span className="text-xs text-muted">{animal.breed_name}</span>
      </div>
    );
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeleteError("");

    const result = await deleteReproductionRecord(Number(deleting.id));

    if (!result.success) {
      setDeleteError(result.message);
      return;
    }

    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Perkawinan"
        description="Catatan perkawinan ternak beserta status kebuntingan dan kelahirannya."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Perkawinan
          </Button>
        }
      />

      <SummaryCards>
        <SummaryCard label="Total Perkawinan" value={filtered.length} />
        <SummaryCard
          label="Sedang Bunting"
          value={pregnantCount}
          accent="info"
        />
        <SummaryCard
          label="Sudah Melahirkan"
          value={bornCount}
          accent="success"
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Perkawinan" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => resetPage(() => setQuery(value))}
            placeholder="Cari tag ternak…"
            aria-label="Cari perkawinan berdasarkan tag ternak"
            className="w-full sm:max-w-xs"
          />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-44">
              <Select
                aria-label="Filter status"
                value={statusFilter}
                onChange={(event) =>
                  resetPage(() => setStatusFilter(event.target.value))
                }
              >
                <option value="all">Semua Status</option>
                {(
                  Object.keys(REPRODUCTION_STATUS_LABEL) as ReproductionStatus[]
                ).map((status) => (
                  <option key={status} value={status}>
                    {REPRODUCTION_STATUS_LABEL[status]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:w-44">
              <Select
                aria-label="Filter ternak"
                value={livestockFilter}
                onChange={(event) =>
                  resetPage(() => setLivestockFilter(event.target.value))
                }
              >
                <option value="all">Semua Ternak</option>
                {livestockOptions.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.tag_code}
                  </option>
                ))}
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
        emptyTitle="Belum ada data perkawinan"
        emptyDescription="Belum ada catatan perkawinan yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Perkawinan
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
              <TH>Tanggal Kawin</TH>
              <TH>Betina</TH>
              <TH>Jantan</TH>
              <TH>Status</TH>
              <TH className="hidden md:table-cell">Perkiraan Lahir</TH>
              <TH className="hidden lg:table-cell">Lahir Aktual</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>

          <TBody>
            {rows.map(({ record, female, male }) => (
              <TR key={record.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(record.mating_date)}
                </TD>

                <TD>{renderAnimal(female)}</TD>
                <TD>{renderAnimal(male)}</TD>

                <TD>
                  <Badge variant={REPRODUCTION_STATUS_BADGE[record.status]}>
                    {REPRODUCTION_STATUS_LABEL[record.status]}
                  </Badge>
                </TD>

                <TD className="hidden whitespace-nowrap text-xs text-muted md:table-cell">
                  {record.expected_birth_date
                    ? formatDate(record.expected_birth_date)
                    : "—"}
                </TD>

                <TD className="hidden whitespace-nowrap text-xs text-muted lg:table-cell">
                  {record.actual_birth_date
                    ? formatDate(record.actual_birth_date)
                    : "—"}
                </TD>

                <TD>
                  <RowActions
                    label="Aksi perkawinan"
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
        <ReproductionFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
          livestockOptions={livestockOptions}
        />
      ) : null}

      {editing ? (
        <ReproductionFormDialog
          open
          mode="edit"
          record={editing}
          onClose={() => setEditing(null)}
          livestockOptions={livestockOptions}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Perkawinan?"
          description={
            deleteError ||
            "Apakah Anda yakin ingin menghapus data perkawinan ini?"
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
