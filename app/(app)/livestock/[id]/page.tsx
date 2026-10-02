"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash } from "lucide-react";

import { GenealogyTab } from "@/components/livestock/detail/genealogy-tab";
import { HealthTab } from "@/components/livestock/detail/health-tab";
import { InformasiTab } from "@/components/livestock/detail/informasi-tab";
import { ReproductionTab } from "@/components/livestock/detail/reproduction-tab";
import { LivestockFormDialog } from "@/components/livestock/livestock-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import {
  getBreedName,
  getLivestockById,
  getSpeciesName,
  SEX_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
} from "@/lib/livestock";

type DetailTab = "informasi" | "kesehatan" | "reproduksi" | "silsilah";

const TABS = [
  { value: "informasi", label: "Informasi" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "reproduksi", label: "Reproduksi" },
  { value: "silsilah", label: "Silsilah" },
];

export default function LivestockDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<DetailTab>("informasi");
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

      <Tabs
        tabs={TABS}
        value={tab}
        onValueChange={(value) => setTab(value as DetailTab)}
        aria-label="Bagian ternak"
      />

      {tab === "informasi" ? <InformasiTab animal={animal} /> : null}
      {tab === "kesehatan" ? <HealthTab animal={animal} /> : null}
      {tab === "reproduksi" ? <ReproductionTab animal={animal} /> : null}
      {tab === "silsilah" ? <GenealogyTab animal={animal} /> : null}

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
