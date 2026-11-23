"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EggCollectionRecord } from "@/lib/hatchery";

import {
  createEggCollectionRecord,
  getSpeciesOptions,
  updateEggCollectionRecord,
} from "@/app/(app)/hatchery/batches/actions";

interface EggCollectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode: "create" | "edit";
  record?: EggCollectionRecord | null;
}

interface SpeciesOption {
  id: number;
  name: string;
}

export function EggCollectionFormDialog({
  open,
  onClose,
  onSaved,
  mode,
  record,
}: EggCollectionFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "egg-collection-form";

  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSpecies() {
      const result = await getSpeciesOptions();

      if (result.success) {
        setSpeciesOptions(
          result.data.map((species) => ({
            id: Number(species.id),
            name: species.name,
          })),
        );
      } else {
        setErrorMessage(result.message);
      }
    }

    if (open) {
      loadSpecies();
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const result =
        isEdit && record
          ? await updateEggCollectionRecord(Number(record.id), formData)
          : await createEggCollectionRecord(formData);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      onSaved();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
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
      title={isEdit ? "Edit Pengumpulan Telur" : "Tambah Pengumpulan Telur"}
      description={
        isEdit
          ? "Perbarui data pengumpulan telur."
          : "Catat hasil pengumpulan telur."
      }
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

          <Button type="submit" form={formId} size="sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMessage && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <FormSection title="Data Pengumpulan">
          <Field label="Jenis Ternak" htmlFor="ec-species" required>
            <Select
              id="ec-species"
              name="species_id"
              defaultValue={record?.species_id?.toString() ?? ""}
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

          <Field label="Tanggal Pengumpulan" htmlFor="ec-date" required>
            <Input
              id="ec-date"
              name="collection_date"
              type="date"
              defaultValue={record?.collection_date ?? ""}
              required
            />
          </Field>

          <Field label="Jumlah" htmlFor="ec-qty" required>
            <Input
              id="ec-qty"
              name="quantity"
              type="number"
              min={1}
              step="any"
              defaultValue={record?.quantity ?? ""}
              required
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
            placeholder="Catatan tambahan mengenai pengumpulan telur…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
