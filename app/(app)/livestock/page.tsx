"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { BatchFormDialog } from "@/components/livestock/batch-form-dialog";
import { BatchList } from "@/components/livestock/batch-list";
import { BulkAddDialog } from "@/components/livestock/bulk-add-dialog";
import { IndividualList } from "@/components/livestock/individual-list";
import { LivestockFormDialog } from "@/components/livestock/livestock-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { type Livestock } from "@/lib/livestock";
import { type LivestockBatch } from "@/lib/livestock-batches";

type DataTab = "individu" | "batch";

const TABS = [
  { value: "individu", label: "Individu" },
  { value: "batch", label: "Batch" },
];

export default function LivestockPage() {
  const [tab, setTab] = useState<DataTab>("individu");

  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Livestock | null>(null);
  const [deleting, setDeleting] = useState<Livestock | null>(null);

  const [batchAddOpen, setBatchAddOpen] = useState(false);
  const [batchEditing, setBatchEditing] = useState<LivestockBatch | null>(null);
  const [batchDeleting, setBatchDeleting] = useState<LivestockBatch | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Data Ternak"
        description="Registri pusat ternak, terpisah antara ternak individual dan ternak batch."
        actions={
          tab === "individu" ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setBulkOpen(true)}
              >
                <Plus aria-hidden className="size-4" />
                Tambah Massal
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => setAddOpen(true)}
              >
                <Plus aria-hidden className="size-4" />
                Tambah Ternak
              </Button>
            </div>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={() => setBatchAddOpen(true)}
            >
              <Plus aria-hidden className="size-4" />
              Tambah Batch
            </Button>
          )
        }
      />

      <Tabs
        tabs={TABS}
        value={tab}
        onValueChange={(value) => setTab(value as DataTab)}
        aria-label="Jenis data ternak"
      />

      {tab === "individu" ? (
        <IndividualList
          onCreate={() => setAddOpen(true)}
          onEdit={(animal) => setEditing(animal)}
          onDelete={(animal) => setDeleting(animal)}
        />
      ) : (
        <BatchList
          onCreate={() => setBatchAddOpen(true)}
          onEdit={(batch) => setBatchEditing(batch)}
          onDelete={(batch) => setBatchDeleting(batch)}
        />
      )}

      {addOpen ? (
        <LivestockFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {bulkOpen ? (
        <BulkAddDialog open onClose={() => setBulkOpen(false)} />
      ) : null}

      {editing ? (
        <LivestockFormDialog
          open
          mode="edit"
          livestock={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Data Ternak?"
          description={`Apakah Anda yakin ingin menghapus data ternak "${deleting.tag_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}

      {batchAddOpen ? (
        <BatchFormDialog
          open
          mode="create"
          onClose={() => setBatchAddOpen(false)}
        />
      ) : null}

      {batchEditing ? (
        <BatchFormDialog
          open
          mode="edit"
          batch={batchEditing}
          onClose={() => setBatchEditing(null)}
        />
      ) : null}

      {batchDeleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Batch Ternak?"
          description={`Apakah Anda yakin ingin menghapus batch "${batchDeleting.batch_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setBatchDeleting(null)}
          onConfirm={() => setBatchDeleting(null)}
        />
      ) : null}
    </div>
  );
}
