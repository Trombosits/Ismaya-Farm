"use client";

import { useState, type FormEvent } from "react";

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

import {
  createHatcheryBatch,
  updateHatcheryBatch,
} from "@/app/(app)/hatchery/batches/actions";

interface SpeciesOption {
  id: number;
  name: string;
  code?: string;
}

interface HatcheryBatchFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
  batch?: HatcheryBatch | null;
  speciesOptions: SpeciesOption[];
}

export function HatcheryBatchFormDialog({
  open,
  onClose,
  onSuccess,
  mode,
  batch,
  speciesOptions,
}: HatcheryBatchFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "hatchery-batch-form";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);

      const result = isEdit
        ? batch
          ? await updateHatcheryBatch(batch.id, formData)
          : {
              success: false,
              message: "Data batch yang akan diedit tidak ditemukan.",
            }
        : await createHatcheryBatch(formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data.",
      );
    } finally {
      setSaving(false);
    }
  }

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
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>

          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={saving || speciesOptions.length === 0}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="scrollbar-thin flex max-h-[70vh] flex-col gap-6 overflow-y-auto"
      >
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <FormSection title="Informasi Batch">
          <Field label="Jenis Ternak" htmlFor="hb-species" required>
            <Select
              id="hb-species"
              name="species_id"
              defaultValue={batch?.species_id?.toString() ?? ""}
              required
            >
              <option value="" disabled>
                Pilih jenis ternak
              </option>

              {speciesOptions.map((species) => (
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
              required
            />
          </Field>

          <Field label="Jumlah Telur" htmlFor="hb-eggs" required>
            <Input
              id="hb-eggs"
              name="egg_quantity"
              type="number"
              min={1}
              defaultValue={batch?.egg_quantity ?? ""}
              required
            />
          </Field>

          <Field label="Status" htmlFor="hb-status">
            <Select
              id="hb-status"
              name="status"
              defaultValue={batch?.status ?? "incubating"}
            >
              {(
                Object.keys(HATCHERY_STATUS_LABEL) as HatcheryBatchStatus[]
              ).map((status) => (
                <option key={status} value={status}>
                  {HATCHERY_STATUS_LABEL[status]}
                </option>
              ))}
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
            placeholder="Catatan tambahan mengenai batch ini..."
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
