"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LivestockHealthRecord } from "@/lib/livestock";

interface LivestockHealthFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  livestockId: string;
  record?: LivestockHealthRecord | null;
}

export function LivestockHealthFormDialog({
  open,
  onClose,
  mode,
  livestockId,
  record,
}: LivestockHealthFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "livestock-health-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Catatan Kesehatan" : "Tambah Catatan Kesehatan"}
      description={
        isEdit
          ? "Perbarui catatan kesehatan ternak ini."
          : "Catat kejadian kesehatan ternak ini."
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form={formId} size="sm">
            Simpan
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="livestock_id" defaultValue={livestockId} />
        <Field label="Tanggal Pemeriksaan" htmlFor="lh-date" required>
          <Input
            id="lh-date"
            name="record_date"
            type="date"
            defaultValue={record?.record_date ?? ""}
          />
        </Field>
        <Field label="Kondisi" htmlFor="lh-condition" required>
          <Input
            id="lh-condition"
            name="condition"
            defaultValue={record?.condition ?? ""}
            placeholder="Contoh: Kurang aktif"
            autoComplete="off"
          />
        </Field>
        <Field label="Diagnosis" htmlFor="lh-diagnosis">
          <Input
            id="lh-diagnosis"
            name="diagnosis"
            defaultValue={record?.diagnosis ?? ""}
            placeholder="Contoh: Demam"
            autoComplete="off"
          />
        </Field>
        <Field label="Catatan" htmlFor="lh-notes">
          <Textarea
            id="lh-notes"
            name="notes"
            rows={3}
            defaultValue={record?.notes ?? ""}
            placeholder="Catatan tambahan mengenai kondisi ternak…"
          />
        </Field>
      </form>
    </Dialog>
  );
}
