"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LivestockBatch } from "@/lib/livestock-batches";
import {
  ACQUISITION_LABEL,
  breedList,
  getBreedsBySpecies,
  speciesList,
  STATUS_LABEL,
  type AcquisitionType,
  type LivestockStatus,
} from "@/lib/livestock";

interface BatchFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  batch?: LivestockBatch | null;
}

export function BatchFormDialog({
  open,
  onClose,
  mode,
  batch,
}: BatchFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "batch-form";

  const [speciesId, setSpeciesId] = useState(batch?.species_id ?? "");
  const [breedId, setBreedId] = useState(batch?.breed_id ?? "");

  const breedOptions = speciesId ? getBreedsBySpecies(speciesId) : breedList;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Batch Ternak" : "Tambah Batch Ternak"}
      description={
        isEdit
          ? "Perbarui informasi batch ternak."
          : "Lengkapi data untuk menambahkan batch ternak baru."
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
          <Field label="Batch Code" htmlFor="batch-code" required>
            <Input
              id="batch-code"
              name="batch_code"
              defaultValue={batch?.batch_code ?? ""}
              placeholder="Contoh: AY-B-005"
              autoComplete="off"
              className="font-mono uppercase"
            />
          </Field>
          <Field label="Jenis Ternak" htmlFor="batch-species" required>
            <Select
              id="batch-species"
              name="species_id"
              value={speciesId}
              onChange={(event) => {
                setSpeciesId(event.target.value);
                setBreedId("");
              }}
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
          <Field
            label="Ras"
            htmlFor="batch-breed"
            required
            hint={speciesId ? undefined : "Pilih jenis ternak terlebih dahulu."}
          >
            <Select
              id="batch-breed"
              name="breed_id"
              value={breedId}
              disabled={!speciesId}
              onChange={(event) => setBreedId(event.target.value)}
            >
              <option value="" disabled>
                Pilih ras
              </option>
              {breedOptions.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jumlah" htmlFor="batch-quantity" required>
            <Input
              id="batch-quantity"
              name="quantity"
              type="number"
              min={0}
              defaultValue={batch?.quantity ?? ""}
              placeholder="Contoh: 500"
            />
          </Field>
        </FormSection>

        <FormSection title="Perolehan">
          <Field label="Tanggal Perolehan" htmlFor="batch-date" required>
            <Input
              id="batch-date"
              name="acquisition_date"
              type="date"
              defaultValue={batch?.acquisition_date ?? ""}
            />
          </Field>
          <Field label="Cara Perolehan" htmlFor="batch-acq-type">
            <Select
              id="batch-acq-type"
              name="acquisition_type"
              defaultValue={batch?.acquisition_type ?? "purchased"}
            >
              {(Object.keys(ACQUISITION_LABEL) as AcquisitionType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {ACQUISITION_LABEL[type]}
                  </option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Status" htmlFor="batch-status">
            <Select
              id="batch-status"
              name="status"
              defaultValue={batch?.status ?? "active"}
            >
              {(Object.keys(STATUS_LABEL) as LivestockStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
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
            placeholder="Catatan tambahan mengenai batch ini…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
