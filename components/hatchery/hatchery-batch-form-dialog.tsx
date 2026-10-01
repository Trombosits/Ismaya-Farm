"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  HATCHERY_STATUS_LABEL,
  type HatcheryBatch,
  type HatcheryBatchStatus,
} from "@/lib/hatchery";
import { speciesList } from "@/lib/livestock";

interface HatcheryBatchFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  batch?: HatcheryBatch | null;
}

export function HatcheryBatchFormDialog({
  open,
  onClose,
  mode,
  batch,
}: HatcheryBatchFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "hatchery-batch-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Batch Penetasan" : "Tambah Batch Penetasan"}
      description={
        isEdit
          ? "Perbarui data batch penetasan."
          : "Buat batch penetasan telur baru."
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
        className="scrollbar-thin flex max-h-[70vh] flex-col gap-6 overflow-y-auto"
      >
        <FormSection title="Informasi Batch">
          <Field label="Batch Code" htmlFor="hb-code" required>
            <Input
              id="hb-code"
              name="batch_code"
              defaultValue={batch?.batch_code ?? ""}
              placeholder="Contoh: HT-2026-006"
              autoComplete="off"
              className="font-mono uppercase"
            />
          </Field>
          <Field label="Jenis Ternak" htmlFor="hb-species" required>
            <Select
              id="hb-species"
              name="species_id"
              defaultValue={batch?.species_id ?? ""}
            >
              <option value="" disabled>
                Pilih jenis ternak
              </option>
              {speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal Mulai" htmlFor="hb-start" required>
            <Input
              id="hb-start"
              name="start_date"
              type="date"
              defaultValue={batch?.start_date ?? ""}
            />
          </Field>
          <Field label="Jumlah Telur" htmlFor="hb-eggs" required>
            <Input
              id="hb-eggs"
              name="egg_quantity"
              type="number"
              min={0}
              defaultValue={batch?.egg_quantity ?? ""}
            />
          </Field>
          <Field label="Perkiraan Tanggal Menetas" htmlFor="hb-expected">
            <Input
              id="hb-expected"
              name="expected_hatch_date"
              type="date"
              defaultValue={batch?.expected_hatch_date ?? ""}
            />
          </Field>
          <Field label="Status" htmlFor="hb-status">
            <Select
              id="hb-status"
              name="status"
              defaultValue={batch?.status ?? "incubating"}
            >
              {(Object.keys(HATCHERY_STATUS_LABEL) as HatcheryBatchStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {HATCHERY_STATUS_LABEL[status]}
                  </option>
                ),
              )}
            </Select>
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
            defaultValue={batch?.notes ?? ""}
            placeholder="Catatan tambahan mengenai batch ini…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
