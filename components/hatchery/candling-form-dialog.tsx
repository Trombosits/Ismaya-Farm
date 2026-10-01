"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HatcheryCandlingRecord } from "@/lib/hatchery";

interface CandlingFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  batchId: string;
  record?: HatcheryCandlingRecord | null;
}

export function CandlingFormDialog({
  open,
  onClose,
  mode,
  batchId,
  record,
}: CandlingFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "candling-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Candling" : "Tambah Candling"}
      description={
        isEdit
          ? "Perbarui data pemeriksaan candling."
          : "Catat hasil pemeriksaan candling."
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
        <FormSection title="Data Candling">
          <Field label="Tanggal Candling" htmlFor="hc-date" required>
            <Input
              id="hc-date"
              name="candling_date"
              type="date"
              defaultValue={record?.candling_date ?? ""}
            />
          </Field>
          <Field label="Umur Hari" htmlFor="hc-age" required>
            <Input
              id="hc-age"
              name="age_days"
              type="number"
              min={0}
              defaultValue={record?.age_days ?? ""}
            />
          </Field>
          <Field label="Fertile" htmlFor="hc-fertile" required>
            <Input
              id="hc-fertile"
              name="fertile_count"
              type="number"
              min={0}
              defaultValue={record?.fertile_count ?? ""}
            />
          </Field>
          <Field label="Infertile" htmlFor="hc-infertile" required>
            <Input
              id="hc-infertile"
              name="infertile_count"
              type="number"
              min={0}
              defaultValue={record?.infertile_count ?? ""}
            />
          </Field>
          <Field label="Embrio Mati" htmlFor="hc-dead" required>
            <Input
              id="hc-dead"
              name="dead_embryo_count"
              type="number"
              min={0}
              defaultValue={record?.dead_embryo_count ?? ""}
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
            placeholder="Catatan tambahan mengenai candling…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
