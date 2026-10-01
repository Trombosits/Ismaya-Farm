"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACQUISITION_LABEL,
  breedList,
  getBreedName,
  getBreedsBySpecies,
  livestockList,
  SEX_LABEL,
  speciesList,
  STATUS_LABEL,
  type AcquisitionType,
  type Livestock,
  type LivestockSex,
  type LivestockStatus,
} from "@/lib/livestock";

interface LivestockFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  livestock?: Livestock | null;
}

export function LivestockFormDialog({
  open,
  onClose,
  mode,
  livestock,
}: LivestockFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "livestock-form";

  const [speciesId, setSpeciesId] = useState(livestock?.species_id ?? "");
  const [breedId, setBreedId] = useState(livestock?.breed_id ?? "");

  const breedOptions = speciesId
    ? getBreedsBySpecies(speciesId)
    : breedList;

  const mothers = livestockList.filter(
    (animal) => animal.sex === "female" && animal.id !== livestock?.id,
  );
  const fathers = livestockList.filter(
    (animal) => animal.sex === "male" && animal.id !== livestock?.id,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Ternak" : "Tambah Ternak"}
      description={
        isEdit
          ? "Perbarui informasi data ternak."
          : "Lengkapi data untuk menambahkan ternak baru."
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
        <FormSection title="Identitas Ternak">
          <Field label="Tag Code" htmlFor="livestock-tag" required>
            <Input
              id="livestock-tag"
              name="tag_code"
              defaultValue={livestock?.tag_code ?? ""}
              placeholder="Contoh: KMB-006"
              autoComplete="off"
              className="font-mono uppercase"
            />
          </Field>
          <Field label="Jenis Ternak" htmlFor="livestock-species" required>
            <Select
              id="livestock-species"
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
            htmlFor="livestock-breed"
            required
            hint={
              speciesId ? undefined : "Pilih jenis ternak terlebih dahulu."
            }
          >
            <Select
              id="livestock-breed"
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
          <Field label="Jenis Kelamin" htmlFor="livestock-sex" required>
            <Select
              id="livestock-sex"
              name="sex"
              defaultValue={livestock?.sex ?? "female"}
            >
              {(Object.keys(SEX_LABEL) as LivestockSex[]).map((sex) => (
                <option key={sex} value={sex}>
                  {SEX_LABEL[sex]}
                </option>
              ))}
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Tanggal & Perolehan">
          <Field label="Tanggal Lahir" htmlFor="livestock-birth" required>
            <Input
              id="livestock-birth"
              name="birth_date"
              type="date"
              defaultValue={livestock?.birth_date ?? ""}
            />
          </Field>
          <Field label="Tanggal Perolehan" htmlFor="livestock-acquisition">
            <Input
              id="livestock-acquisition"
              name="acquisition_date"
              type="date"
              defaultValue={livestock?.acquisition_date ?? ""}
            />
          </Field>
          <Field label="Cara Perolehan" htmlFor="livestock-acq-type">
            <Select
              id="livestock-acq-type"
              name="acquisition_type"
              defaultValue={livestock?.acquisition_type ?? "born"}
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
          <Field label="Status" htmlFor="livestock-status">
            <Select
              id="livestock-status"
              name="status"
              defaultValue={livestock?.status ?? "active"}
            >
              {(Object.keys(STATUS_LABEL) as LivestockStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ),
              )}
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Asal / Induk">
          <Field label="Induk Betina" htmlFor="livestock-mother">
            <Select
              id="livestock-mother"
              name="mother_id"
              defaultValue={livestock?.mother_id ?? ""}
            >
              <option value="">Tidak tercatat</option>
              {mothers.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag_code} — {getBreedName(animal.breed_id)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Induk Jantan" htmlFor="livestock-father">
            <Select
              id="livestock-father"
              name="father_id"
              defaultValue={livestock?.father_id ?? ""}
            >
              <option value="">Tidak tercatat</option>
              {fathers.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag_code} — {getBreedName(animal.breed_id)}
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
            id="livestock-notes"
            name="notes"
            aria-label="Catatan"
            rows={3}
            defaultValue={livestock?.notes ?? ""}
            placeholder="Catatan tambahan mengenai ternak ini…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
