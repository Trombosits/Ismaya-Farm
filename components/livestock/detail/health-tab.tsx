"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { LivestockHealthFormDialog } from "@/components/livestock/livestock-health-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/ui/row-actions";
import { Section, SectionHeader } from "@/components/ui/section";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  formatDate,
  getHealthByLivestock,
  type Livestock,
  type LivestockHealthRecord,
} from "@/lib/livestock";

type HealthFormState =
  | { mode: "create" }
  | { mode: "edit"; record: LivestockHealthRecord }
  | null;

export function HealthTab({ animal }: { animal: Livestock }) {
  const [form, setForm] = useState<HealthFormState>(null);
  const [deleting, setDeleting] = useState<LivestockHealthRecord | null>(null);

  const records = getHealthByLivestock(animal.id);

  return (
    <Section>
      <SectionHeader
        title="Riwayat Kesehatan"
        description={`Catatan kesehatan untuk ${animal.tag_code}.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setForm({ mode: "create" })}
          >
            <Plus aria-hidden className="size-3.5" />
            Tambah Catatan
          </Button>
        }
      />

      {records.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-8 text-center text-sm text-muted">
          Belum ada catatan kesehatan.
        </p>
      ) : (
        <Table className="min-w-[640px]">
          <THead>
            <tr>
              <TH>Tanggal</TH>
              <TH>Kondisi</TH>
              <TH>Diagnosis</TH>
              <TH>Catatan</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {records.map((record) => (
              <TR key={record.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(record.record_date)}
                </TD>
                <TD className="font-medium">{record.condition}</TD>
                <TD className="text-muted">{record.diagnosis || "—"}</TD>
                <TD className="max-w-64 truncate text-xs text-muted">
                  {record.notes || "—"}
                </TD>
                <TD>
                  <RowActions
                    label="Aksi catatan kesehatan"
                    onEdit={() => setForm({ mode: "edit", record })}
                    onDelete={() => setDeleting(record)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {form ? (
        <LivestockHealthFormDialog
          open
          mode={form.mode}
          livestockId={animal.id}
          record={form.mode === "edit" ? form.record : null}
          onClose={() => setForm(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Catatan Kesehatan?"
          description="Apakah Anda yakin ingin menghapus catatan kesehatan ini?"
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </Section>
  );
}
