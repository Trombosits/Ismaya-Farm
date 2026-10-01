"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Plus, Trash } from "lucide-react";

import { CandlingFormDialog } from "@/components/hatchery/candling-form-dialog";
import { HatcheryBatchFormDialog } from "@/components/hatchery/hatchery-batch-form-dialog";
import { ResultFormDialog } from "@/components/hatchery/result-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { RowActions } from "@/components/ui/row-actions";
import { Section, SectionHeader } from "@/components/ui/section";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  getCandlingByBatch,
  getHatcheryBatch,
  getResultsByBatch,
  HATCHERY_STATUS_BADGE,
  HATCHERY_STATUS_LABEL,
  type HatcheryCandlingRecord,
  type HatcheryResult,
} from "@/lib/hatchery";
import { formatNumber } from "@/lib/format";
import { formatDate, getSpeciesName } from "@/lib/livestock";

type CandlingFormState =
  | { mode: "create" }
  | { mode: "edit"; record: HatcheryCandlingRecord }
  | null;

type ResultFormState =
  | { mode: "create" }
  | { mode: "edit"; record: HatcheryResult }
  | null;

export default function HatcheryBatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [candlingForm, setCandlingForm] = useState<CandlingFormState>(null);
  const [candlingDelete, setCandlingDelete] =
    useState<HatcheryCandlingRecord | null>(null);
  const [resultForm, setResultForm] = useState<ResultFormState>(null);
  const [resultDelete, setResultDelete] = useState<HatcheryResult | null>(null);

  const batch = getHatcheryBatch(params.id);

  if (!batch) {
    return (
      <EmptyState
        title="Batch tidak ditemukan"
        description="Batch penetasan yang Anda cari tidak tersedia atau telah dihapus."
        action={
          <Button onClick={() => router.push("/hatchery/batches")}>
            Kembali ke Batch Penetasan
          </Button>
        }
      />
    );
  }

  const candlingRecords = getCandlingByBatch(batch.id);
  const results = getResultsByBatch(batch.id);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/hatchery/batches"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
      >
        <ChevronLeft aria-hidden className="size-3.5" />
        Batch Penetasan
      </Link>

      <PageHeader
        title={batch.batch_code}
        description={`${getSpeciesName(batch.species_id)} · mulai ${formatDate(
          batch.start_date,
        )}`}
        badge={
          <Badge variant={HATCHERY_STATUS_BADGE[batch.status]}>
            {HATCHERY_STATUS_LABEL[batch.status]}
          </Badge>
        }
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => setEditOpen(true)}
            >
              <Pencil aria-hidden className="size-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              className="flex-1 sm:flex-none"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash aria-hidden className="size-4" />
              Hapus
            </Button>
          </div>
        }
      />

      <div className="flex flex-col divide-y divide-border">
        <Section className="py-5 first:pt-0">
          <SectionHeader title="Informasi Batch" />
          <DescriptionList columns={3}>
            <DescriptionItem label="Batch Code">
              <span className="font-mono font-semibold">
                {batch.batch_code}
              </span>
            </DescriptionItem>
            <DescriptionItem label="Jenis Ternak">
              {getSpeciesName(batch.species_id)}
            </DescriptionItem>
            <DescriptionItem label="Status">
              <Badge variant={HATCHERY_STATUS_BADGE[batch.status]}>
                {HATCHERY_STATUS_LABEL[batch.status]}
              </Badge>
            </DescriptionItem>
            <DescriptionItem label="Tanggal Mulai">
              {formatDate(batch.start_date)}
            </DescriptionItem>
            <DescriptionItem label="Jumlah Telur">
              {formatNumber(batch.egg_quantity)}
            </DescriptionItem>
            <DescriptionItem label="Perkiraan Menetas">
              {formatDate(batch.expected_hatch_date)}
            </DescriptionItem>
          </DescriptionList>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
              Catatan
            </span>
            <p className="text-sm text-ink">
              {batch.notes || "Tidak ada catatan."}
            </p>
          </div>
        </Section>

        <Section className="py-5">
          <SectionHeader
            title="Candling"
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCandlingForm({ mode: "create" })}
              >
                <Plus aria-hidden className="size-3.5" />
                Tambah Candling
              </Button>
            }
          />
          {candlingRecords.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
              Belum ada data candling.
            </p>
          ) : (
            <Table className="min-w-[680px]">
              <THead>
                <tr>
                  <TH>Tanggal Candling</TH>
                  <TH className="text-right">Umur Hari</TH>
                  <TH className="text-right">Fertile</TH>
                  <TH className="text-right">Infertile</TH>
                  <TH className="text-right">Embrio Mati</TH>
                  <TH className="w-14 text-right">Aksi</TH>
                </tr>
              </THead>
              <TBody>
                {candlingRecords.map((record) => (
                  <TR key={record.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(record.candling_date)}
                    </TD>
                    <TD className="text-right">{record.age_days}</TD>
                    <TD className="text-right">
                      {formatNumber(record.fertile_count)}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(record.infertile_count)}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(record.dead_embryo_count)}
                    </TD>
                    <TD>
                      <RowActions
                        label="Aksi candling"
                        onEdit={() =>
                          setCandlingForm({ mode: "edit", record })
                        }
                        onDelete={() => setCandlingDelete(record)}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Section>

        <Section className="py-5 last:pb-0">
          <SectionHeader
            title="Hasil Penetasan"
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResultForm({ mode: "create" })}
              >
                <Plus aria-hidden className="size-3.5" />
                Tambah Hasil
              </Button>
            }
          />
          {results.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
              Belum ada hasil penetasan.
            </p>
          ) : (
            <Table className="min-w-[680px]">
              <THead>
                <tr>
                  <TH>Tanggal Menetas</TH>
                  <TH className="text-right">Menetas</TH>
                  <TH className="text-right">Gagal</TH>
                  <TH className="text-right">Survival</TH>
                  <TH>Catatan</TH>
                  <TH className="w-14 text-right">Aksi</TH>
                </tr>
              </THead>
              <TBody>
                {results.map((record) => (
                  <TR key={record.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(record.hatch_date)}
                    </TD>
                    <TD className="text-right font-medium">
                      {formatNumber(record.hatched_count)}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(record.failed_count)}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(record.survival_count)}
                    </TD>
                    <TD className="max-w-48 truncate text-xs text-muted">
                      {record.notes || "—"}
                    </TD>
                    <TD>
                      <RowActions
                        label="Aksi hasil penetasan"
                        onEdit={() => setResultForm({ mode: "edit", record })}
                        onDelete={() => setResultDelete(record)}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Section>
      </div>

      {editOpen ? (
        <HatcheryBatchFormDialog
          open
          mode="edit"
          batch={batch}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Batch Penetasan?"
          description={`Apakah Anda yakin ingin menghapus batch "${batch.batch_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => setDeleteOpen(false)}
        />
      ) : null}

      {candlingForm ? (
        <CandlingFormDialog
          open
          mode={candlingForm.mode}
          batchId={batch.id}
          record={candlingForm.mode === "edit" ? candlingForm.record : null}
          onClose={() => setCandlingForm(null)}
        />
      ) : null}

      {candlingDelete ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Candling?"
          description="Apakah Anda yakin ingin menghapus data candling ini?"
          confirmLabel="Hapus"
          onClose={() => setCandlingDelete(null)}
          onConfirm={() => setCandlingDelete(null)}
        />
      ) : null}

      {resultForm ? (
        <ResultFormDialog
          open
          mode={resultForm.mode}
          batchId={batch.id}
          record={resultForm.mode === "edit" ? resultForm.record : null}
          onClose={() => setResultForm(null)}
        />
      ) : null}

      {resultDelete ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Hasil Penetasan?"
          description="Apakah Anda yakin ingin menghapus hasil penetasan ini?"
          confirmLabel="Hapus"
          onClose={() => setResultDelete(null)}
          onConfirm={() => setResultDelete(null)}
        />
      ) : null}
    </div>
  );
}
