"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash } from "lucide-react";

import { BatchFormDialog } from "@/components/livestock/batch-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeader } from "@/components/ui/section";
import { formatNumber } from "@/lib/format";
import {
  ACQUISITION_LABEL,
  formatDate,
  getBreedName,
  getSpeciesName,
  STATUS_BADGE,
  STATUS_LABEL,
} from "@/lib/livestock";
import { getBatchById } from "@/lib/livestock-batches";

export default function LivestockBatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const batch = getBatchById(params.id);

  if (!batch) {
    return (
      <EmptyState
        title="Batch tidak ditemukan"
        description="Batch ternak yang Anda cari tidak tersedia atau telah dihapus."
        action={
          <Button onClick={() => router.push("/livestock")}>
            Kembali ke Data Ternak
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/livestock"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
      >
        <ChevronLeft aria-hidden className="size-3.5" />
        Data Ternak
      </Link>

      <PageHeader
        title={batch.batch_code}
        description={`${getSpeciesName(batch.species_id)} · ${getBreedName(
          batch.breed_id,
        )} · ${formatNumber(batch.quantity)} ekor`}
        badge={
          <Badge variant={STATUS_BADGE[batch.status]}>
            {STATUS_LABEL[batch.status]}
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

      <Section>
        <SectionHeader title="Informasi Batch" />
        <DescriptionList columns={3}>
          <DescriptionItem label="Batch Code">
            <span className="font-mono font-semibold">{batch.batch_code}</span>
          </DescriptionItem>
          <DescriptionItem label="Jenis Ternak">
            {getSpeciesName(batch.species_id)}
          </DescriptionItem>
          <DescriptionItem label="Ras">
            {getBreedName(batch.breed_id)}
          </DescriptionItem>
          <DescriptionItem label="Jumlah">
            {formatNumber(batch.quantity)} ekor
          </DescriptionItem>
          <DescriptionItem label="Tanggal Perolehan">
            {formatDate(batch.acquisition_date)}
          </DescriptionItem>
          <DescriptionItem label="Cara Perolehan">
            {ACQUISITION_LABEL[batch.acquisition_type]}
          </DescriptionItem>
          <DescriptionItem label="Status">
            <Badge variant={STATUS_BADGE[batch.status]}>
              {STATUS_LABEL[batch.status]}
            </Badge>
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

      {editOpen ? (
        <BatchFormDialog
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
          title="Hapus Batch Ternak?"
          description={`Apakah Anda yakin ingin menghapus batch "${batch.batch_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => setDeleteOpen(false)}
        />
      ) : null}
    </div>
  );
}
