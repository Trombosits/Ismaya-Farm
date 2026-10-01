"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash } from "lucide-react";

import { LivestockFormDialog } from "@/components/livestock/livestock-form-dialog";
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
import {
  ACQUISITION_LABEL,
  formatAge,
  formatDate,
  getBreedName,
  getLivestockById,
  getSpeciesName,
  SEX_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "@/lib/livestock";

const FUTURE_TABS = ["Kesehatan", "Reproduksi", "Silsilah"];

export default function LivestockDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const animal = getLivestockById(params.id);

  if (!animal) {
    return (
      <EmptyState
        title="Data ternak tidak ditemukan"
        description="Data ternak yang Anda cari tidak tersedia atau telah dihapus."
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
        title={animal.tag_code}
        description={`${getSpeciesName(animal.species_id)} · ${getBreedName(
          animal.breed_id,
        )} · ${SEX_LABEL[animal.sex]}`}
        badge={
          <Badge variant={STATUS_BADGE[animal.status]}>
            {STATUS_LABEL[animal.status]}
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

      <nav className="flex items-center gap-4" aria-label="Bagian ternak">
        <span className="border-b-2 border-brand-600 pb-2 text-sm font-medium text-ink">
          Ikhtisar
        </span>
        {FUTURE_TABS.map((tab) => (
          <span
            key={tab}
            title="Segera tersedia"
            className="cursor-not-allowed border-b-2 border-transparent pb-2 text-sm text-subtle"
          >
            {tab}
          </span>
        ))}
      </nav>

      <div className="flex flex-col divide-y divide-border">
        <Section className="py-5 first:pt-0">
          <SectionHeader title="Informasi Dasar" />
          <DescriptionList columns={3}>
            <DescriptionItem label="Tag Code">
              <span className="font-mono font-semibold">
                {animal.tag_code}
              </span>
            </DescriptionItem>
            <DescriptionItem label="Jenis Ternak">
              {getSpeciesName(animal.species_id)}
            </DescriptionItem>
            <DescriptionItem label="Ras">
              {getBreedName(animal.breed_id)}
            </DescriptionItem>
            <DescriptionItem label="Jenis Kelamin">
              {SEX_LABEL[animal.sex]}
            </DescriptionItem>
            <DescriptionItem label="Tanggal Lahir">
              {formatDate(animal.birth_date)}
            </DescriptionItem>
            <DescriptionItem label="Umur">
              {formatAge(animal.birth_date)}
            </DescriptionItem>
          </DescriptionList>
        </Section>

        <Section className="py-5">
          <SectionHeader title="Perolehan" />
          <DescriptionList columns={2}>
            <DescriptionItem label="Tanggal Perolehan">
              {formatDate(animal.acquisition_date)}
            </DescriptionItem>
            <DescriptionItem label="Cara Perolehan">
              {ACQUISITION_LABEL[animal.acquisition_type]}
            </DescriptionItem>
          </DescriptionList>
        </Section>

        <Section className="py-5">
          <SectionHeader title="Asal / Induk" />
          <DescriptionList columns={2}>
            <DescriptionItem label="Induk Betina">
              <ParentReference id={animal.mother_id} />
            </DescriptionItem>
            <DescriptionItem label="Induk Jantan">
              <ParentReference id={animal.father_id} />
            </DescriptionItem>
          </DescriptionList>
        </Section>

        <Section className="py-5 last:pb-0">
          <SectionHeader title="Catatan" />
          {animal.notes ? (
            <p className="text-sm leading-relaxed text-ink">{animal.notes}</p>
          ) : (
            <p className="text-sm text-muted">Tidak ada catatan.</p>
          )}
        </Section>
      </div>

      {editOpen ? (
        <LivestockFormDialog
          open
          mode="edit"
          livestock={animal}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Data Ternak?"
          description={`Apakah Anda yakin ingin menghapus data ternak "${animal.tag_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => setDeleteOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ParentReference({ id }: { id: string | null }) {
  const parent = id ? getLivestockById(id) : undefined;

  if (!parent) {
    return <span className="text-muted">Tidak tercatat</span>;
  }

  return (
    <Link
      href={`/livestock/${parent.id}`}
      className="font-medium text-brand-700 hover:underline"
    >
      {parent.tag_code} — {getBreedName(parent.breed_id)}
    </Link>
  );
}
