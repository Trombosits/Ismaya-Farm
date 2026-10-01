"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HatcheryResult } from "@/lib/hatchery";

interface ResultFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  batchId: string;
  record?: HatcheryResult | null;
}

export function ResultFormDialog({
  open,
  onClose,
  mode,
  batchId,
  record,
}: ResultFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "hatchery-result-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Hasil Penetasan" : "Tambah Hasil Penetasan"}
      description={
        isEdit
          ? "Perbarui hasil penetasan batch ini."
          : "Catat hasil penetasan batch ini."
      }
      className="max-w-2xl"
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
        <input type="hidden" name="batch_id" defaultValue={batchId} />
        <FormSection title="Hasil Penetasan">
          <Field label="Tanggal Menetas" htmlFor="hr-date" required>
            <Input
              id="hr-date"
              name="hatch_date"
              type="date"
              defaultValue={record?.hatch_date ?? ""}
            />
          </Field>
          <Field label="Jumlah Menetas" htmlFor="hr-hatched" required>
            <Input
              id="hr-hatched"
              name="hatched_count"
              type="number"
              min={0}
              defaultValue={record?.hatched_count ?? ""}
            />
          </Field>
          <Field label="Jumlah Gagal" htmlFor="hr-failed" required>
            <Input
              id="hr-failed"
              name="failed_count"
              type="number"
              min={0}
              defaultValue={record?.failed_count ?? ""}
            />
          </Field>
          <Field label="Jumlah Survival" htmlFor="hr-survival" required>
            <Input
              id="hr-survival"
              name="survival_count"
              type="number"
              min={0}
              defaultValue={record?.survival_count ?? ""}
            />
          </Field>
        </FormSection>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Catatan
          </legend>
          <Textarea
            name="notes"
            aria-label="Catatan"
            rows={3}
            defaultValue={record?.notes ?? ""}
            placeholder="Catatan tambahan mengenai hasil penetasan…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
