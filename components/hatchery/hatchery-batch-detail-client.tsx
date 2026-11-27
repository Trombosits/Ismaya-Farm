"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  HATCHERY_STATUS_BADGE,
  HATCHERY_STATUS_LABEL,
  type HatcheryBatch,
  type HatcheryCandlingRecord,
  type HatcheryResult,
} from "@/lib/hatchery";
import { formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  deleteCandlingRecord,
  deleteHatcheryBatch,
  deleteHatcheryResult,
} from "@/app/(app)/hatchery/batches/actions";

type SpeciesOption = {
  id: number;
  name: string;
};

type HatcheryBatchDetailClientProps = {
  batch: HatcheryBatch | null;
  candlingRecords: HatcheryCandlingRecord[];
  results: HatcheryResult[];
  speciesOptions: SpeciesOption[];
};

type CandlingFormState =
  | { mode: "create" }
  | { mode: "edit"; record: HatcheryCandlingRecord }
  | null;

type ResultFormState =
  | { mode: "create" }
  | { mode: "edit"; record: HatcheryResult }
  | null;

export function HatcheryBatchDetailClient({
  batch,
  candlingRecords,
  results,
  speciesOptions,
}: HatcheryBatchDetailClientProps) {
  const router = useRouter();

  function getMaxFertile(record?: HatcheryCandlingRecord) {
    const previousCandlings = candlingRecords
      .filter((item) => {
        if (!record) return true;

        return (
          item.candling_date < record.candling_date ||
          (item.candling_date === record.candling_date && item.id < record.id)
        );
      })
      .sort((a, b) => {
        const dateComparison = b.candling_date.localeCompare(a.candling_date);

        if (dateComparison !== 0) return dateComparison;

        return b.id - a.id;
      });

    const previousCandling = previousCandlings[0];

    const totalHatched = results.reduce(
      (total, result) => total + result.hatched_count,
      0,
    );

    const availableEggs = previousCandling
      ? previousCandling.fertile_count - previousCandling.infertile_count
      : (batch?.egg_quantity ?? 0);

    return Math.max(0, availableEggs - totalHatched);
  }

  function getMaxResultAvailable(record?: HatcheryResult) {
    const latestCandling = [...candlingRecords].sort((a, b) => {
      const dateComparison = b.candling_date.localeCompare(a.candling_date);

      if (dateComparison !== 0) return dateComparison;

      return b.id - a.id;
    })[0];

    if (!latestCandling) return 0;

    const previousResults = results.filter((item) => item.id !== record?.id);

    const alreadyProcessed = previousResults.reduce(
      (total, item) => total + item.hatched_count + item.failed_count,
      0,
    );

    return Math.max(0, latestCandling.fertile_count - alreadyProcessed);
  }

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [deleteBatchError, setDeleteBatchError] = useState("");
  const [candlingForm, setCandlingForm] = useState<CandlingFormState>(null);
  const [candlingDelete, setCandlingDelete] =
    useState<HatcheryCandlingRecord | null>(null);
  const [candlingDeleteError, setCandlingDeleteError] = useState("");
  const [isDeletingCandling, setIsDeletingCandling] = useState(false);
  const [resultForm, setResultForm] = useState<ResultFormState>(null);
  const [resultDelete, setResultDelete] = useState<HatcheryResult | null>(null);
  const [resultDeleteError, setResultDeleteError] = useState("");
  const [isDeletingResult, setIsDeletingResult] = useState(false);

  async function handleDeleteCandling() {
    if (!batch || !candlingDelete) return;

    setIsDeletingCandling(true);
    setCandlingDeleteError("");

    try {
      const result = await deleteCandlingRecord(candlingDelete.id, batch.id);

      if (!result.success) {
        setCandlingDeleteError(result.message);
        return;
      }

      setCandlingDelete(null);
      router.refresh();
    } catch (error) {
      setCandlingDeleteError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus data candling.",
      );
    } finally {
      setIsDeletingCandling(false);
    }
  }

  async function handleDeleteResult() {
    if (!batch || !resultDelete || isDeletingResult) return;

    setIsDeletingResult(true);
    setResultDeleteError("");

    try {
      const response = await deleteHatcheryResult(resultDelete.id, batch.id);

      if (!response.success) {
        setResultDeleteError(response.message);
        return;
      }

      setResultDelete(null);
      router.refresh();
    } catch (error) {
      setResultDeleteError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus hasil penetasan.",
      );
    } finally {
      setIsDeletingResult(false);
    }
  }

  async function handleDeleteBatch() {
    if (!batch || isDeletingBatch) return;

    setIsDeletingBatch(true);
    setDeleteBatchError("");

    try {
      const result = await deleteHatcheryBatch(batch.id);

      if (!result.success) {
        setDeleteBatchError(result.message);
        return;
      }

      setDeleteOpen(false);
      router.push("/hatchery/batches");
      router.refresh();
    } catch (error) {
      setDeleteBatchError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus batch penetasan.",
      );
    } finally {
      setIsDeletingBatch(false);
    }
  }

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

  //   const candlingRecords = getCandlingByBatch(batch.id);
  //   const results = getResultsByBatch(batch.id);

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
        description={`${batch.species_name} · mulai ${formatDate(
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
              {batch.species_name}
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
                  <TH>Catatan</TH>
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
                    <TD className="max-w-48 truncate text-xs text-muted">
                      {record.notes || "—"}
                    </TD>
                    <TD>
                      <RowActions
                        label="Aksi candling"
                        onEdit={() => setCandlingForm({ mode: "edit", record })}
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
          speciesOptions={speciesOptions}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Batch Penetasan?"
          description={
            deleteBatchError ||
            `Apakah Anda yakin ingin menghapus batch "${batch.batch_code}"?`
          }
          confirmLabel={isDeletingBatch ? "Menghapus..." : "Hapus"}
          onClose={() => {
            if (!isDeletingBatch) {
              setDeleteOpen(false);
              setDeleteBatchError("");
            }
          }}
          onConfirm={handleDeleteBatch}
        />
      ) : null}

      {candlingForm ? (
        <CandlingFormDialog
          open
          mode={candlingForm.mode}
          batchId={String(batch.id)}
          maxFertile={getMaxFertile(
            candlingForm.mode === "edit" ? candlingForm.record : undefined,
          )}
          startDate={batch.start_date}
          eggQuantity={batch.egg_quantity}
          record={candlingForm.mode === "edit" ? candlingForm.record : null}
          onClose={() => {
            setCandlingForm(null);
            router.refresh();
          }}
        />
      ) : null}

      {candlingDelete ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Candling?"
          description="Apakah Anda yakin ingin menghapus data candling ini?"
          confirmLabel={isDeletingCandling ? "Menghapus..." : "Hapus"}
          onClose={() => {
            if (!isDeletingCandling) {
              setCandlingDelete(null);
              setCandlingDeleteError("");
            }
          }}
          onConfirm={handleDeleteCandling}
        />
      ) : null}

      {resultForm ? (
        <ResultFormDialog
          open
          mode={resultForm.mode}
          batchId={batch.id}
          startDate={batch.start_date}
          maxAvailable={getMaxResultAvailable(
            resultForm.mode === "edit" ? resultForm.record : undefined,
          )}
          record={resultForm.mode === "edit" ? resultForm.record : null}
          onClose={() => {
            setResultForm(null);
            router.refresh();
          }}
        />
      ) : null}

      {resultDelete ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Hasil Penetasan?"
          description={
            resultDeleteError ||
            "Apakah Anda yakin ingin menghapus hasil penetasan ini?"
          }
          confirmLabel={isDeletingResult ? "Menghapus..." : "Hapus"}
          onClose={() => {
            if (!isDeletingResult) {
              setResultDelete(null);
              setResultDeleteError("");
            }
          }}
          onConfirm={handleDeleteResult}
        />
      ) : null}
    </div>
  );
}
