"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLivestock, updateLivestock } from "@/lib/actions/livestock";
import type { ActionState } from "@/lib/actions/types";
import {
  ACQUISITION_LABEL,
  nextTagNumber,
  parseTagNumber,
  SEX_LABEL,
  STATUS_LABEL,
  type AcquisitionType,
  type Livestock,
  type LivestockSex,
  type LivestockStatus,
  type LivestockSpecies,
  type LivestockBreed,
} from "@/lib/livestock";

interface LivestockFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  livestock?: Livestock | null;
  // Data master dari parent (Supabase)
  livestockList: Livestock[];
  speciesList: LivestockSpecies[];
  breedList: LivestockBreed[];
}

export function LivestockFormDialog({
  open,
  onClose,
  mode,
  livestock,
  livestockList,
  speciesList,
  breedList,
}: LivestockFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "livestock-form";

  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  // Konversi ID database ke string agar kompatibel dengan elemen <Select>
  const [speciesId, setSpeciesId] = useState(
    livestock?.species_id ? String(livestock.species_id) : "",
  );
  const [breedId, setBreedId] = useState(
    livestock?.breed_id ? String(livestock.breed_id) : "",
  );
  const [tagNumber, setTagNumber] = useState(
    livestock?.tag_code ? String(parseTagNumber(livestock.tag_code) ?? "") : "",
  );
  const [tagEdited, setTagEdited] = useState(false);
  const [motherId, setMotherId] = useState(
    livestock?.mother_id ? String(livestock.mother_id) : "",
  );
  const [fatherId, setFatherId] = useState(
    livestock?.father_id ? String(livestock.father_id) : "",
  );

  // Tag yang sudah terpakai, kecuali milik ternak yang sedang diedit.
  const usedTags = livestockList
    .filter((animal) => String(animal.id) !== String(livestock?.id ?? ""))
    .map((animal) => animal.tag_code);

  // Prefix kode ternak selalu mengikuti jenis ternak yang dipilih.
  const speciesPrefix = (
    speciesList.find((item) => String(item.id) === speciesId)?.code ?? ""
  )
    .trim()
    .toUpperCase();

  // Filter ras secara lokal berdasarkan spesies yang dipilih
  const breedOptions = speciesId
    ? breedList.filter((b) => String(b.species_id) === speciesId)
    : breedList;

  // Ambil daftar induk betina dan jantan dari props livestockList
  const mothers = livestockList.filter(
    (animal) =>
      animal.sex === "female" &&
      String(animal.id) !== String(livestock?.id ?? ""),
  );
  const fathers = livestockList.filter(
    (animal) =>
      animal.sex === "male" &&
      String(animal.id) !== String(livestock?.id ?? ""),
  );

  // Fungsi helper untuk mendapatkan nama ras secara lokal
  const getLocalBreedName = (bId: string | number | null) => {
    if (bId === null || bId === "") return "—";
    return (
      breedList.find((b) => String(b.id) === String(bId))?.name || "—"
    );
  };

  const parentOptions = (animals: Livestock[]) =>
    animals.map((animal) => ({
      value: String(animal.id),
      label: `${animal.tag_code} — ${getLocalBreedName(animal.breed_id)}`,
      keywords: animal.tag_code,
    }));

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const generalError = state && !state.ok ? state.message : undefined;

  function handleSpeciesChange(value: string) {
    const next = speciesList.find((item) => String(item.id) === value);

    setSpeciesId(value);
    setBreedId(""); // Reset ras jika spesies diubah

    // Nomor yang sudah diisi pengguna tidak pernah ditimpa.
    if (tagEdited) return;

    const nextPrefix = (next?.code ?? "").trim().toUpperCase();
    if (!nextPrefix) return;

    setTagNumber(
      String(nextTagNumber(nextPrefix, usedTags)),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && livestock
          ? await updateLivestock(Number(livestock.id), formData)
          : await createLivestock(formData);

      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setState(result);
      }
    });
  }

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
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            Batal
          </Button>
          <Button type="submit" form={formId} size="sm" loading={pending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="scrollbar-thin flex max-h-[70vh] flex-col gap-6 overflow-y-auto"
      >
        {generalError ? (
          <p
            role="alert"
            className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {generalError}
          </p>
        ) : null}

        <FormSection title="Identitas Ternak">
          <Field
            label="Jenis Ternak"
            htmlFor="livestock-species"
            required
            error={fieldErrors?.species_id}
          >
            <Select
              id="livestock-species"
              name="species_id"
              value={speciesId}
              disabled={pending}
              onChange={(event) => handleSpeciesChange(event.target.value)}
            >
              <option value="" disabled>
                Pilih jenis ternak
              </option>
              {speciesList.map((species) => (
                <option key={species.id} value={String(species.id)}>
                  {species.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Tag Code"
            htmlFor="livestock-tag-number"
            required
            error={fieldErrors?.tag_number}
            hint={
              speciesPrefix
                ? "Kode jenis ternak terkunci; hanya nomor urut yang dapat diubah."
                : "Pilih jenis ternak untuk mengunci kode awal."
            }
          >
            <div className="flex items-stretch">
              <span
                aria-hidden
                className="flex h-9 items-center rounded-l-md border border-r-0 border-border-strong bg-panel px-2.5 font-mono text-sm text-muted"
              >
                {speciesPrefix || "—"}-
              </span>
              <Input
                id="livestock-tag-number"
                name="tag_number"
                inputMode="numeric"
                value={tagNumber}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  setTagNumber(digits);
                  setTagEdited(true);
                }}
                placeholder="001"
                autoComplete="off"
                maxLength={6}
                className="rounded-l-none font-mono"
                disabled={pending || !speciesPrefix}
              />
            </div>
          </Field>
          <Field
            label="Ras"
            htmlFor="livestock-breed"
            required
            error={fieldErrors?.breed_id}
            hint={
              speciesId ? undefined : "Pilih jenis ternak terlebih dahulu."
            }
          >
            <Select
              id="livestock-breed"
              name="breed_id"
              value={breedId}
              disabled={!speciesId || pending}
              onChange={(event) => setBreedId(event.target.value)}
            >
              <option value="" disabled>
                Pilih ras
              </option>
              {breedOptions.map((breed) => (
                <option key={breed.id} value={String(breed.id)}>
                  {breed.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Jenis Kelamin"
            htmlFor="livestock-sex"
            required
            error={fieldErrors?.sex}
          >
            <Select
              id="livestock-sex"
              name="sex"
              defaultValue={livestock?.sex ?? "female"}
              disabled={pending}
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
          <Field
            label="Tanggal Lahir"
            htmlFor="livestock-birth"
            error={fieldErrors?.birth_date}
          >
            <Input
              id="livestock-birth"
              name="birth_date"
              type="date"
              defaultValue={livestock?.birth_date ?? ""}
              disabled={pending}
            />
          </Field>
          <Field
            label="Tanggal Perolehan"
            htmlFor="livestock-acquisition"
            error={fieldErrors?.acquisition_date}
          >
            <Input
              id="livestock-acquisition"
              name="acquisition_date"
              type="date"
              defaultValue={livestock?.acquisition_date ?? ""}
              disabled={pending}
            />
          </Field>
          <Field
            label="Cara Perolehan"
            htmlFor="livestock-acq-type"
            error={fieldErrors?.acquisition_type}
          >
            <Select
              id="livestock-acq-type"
              name="acquisition_type"
              defaultValue={livestock?.acquisition_type ?? ""}
              disabled={pending}
            >
              <option value="">Tidak diisi</option>
              {(Object.keys(ACQUISITION_LABEL) as AcquisitionType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {ACQUISITION_LABEL[type]}
                  </option>
                ),
              )}
            </Select>
          </Field>
          <Field
            label="Status"
            htmlFor="livestock-status"
            error={fieldErrors?.status}
          >
            <Select
              id="livestock-status"
              name="status"
              defaultValue={livestock?.status ?? "active"}
              disabled={pending}
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
          <Field
            label="Induk Betina"
            htmlFor="livestock-mother"
            error={fieldErrors?.mother_id}
          >
            <SearchableSelect
              id="livestock-mother"
              name="mother_id"
              value={motherId}
              onValueChange={setMotherId}
              options={parentOptions(mothers)}
              placeholder="Tidak tercatat"
              emptyOptionLabel="Tidak tercatat"
              searchPlaceholder="Cari nama atau tag code…"
              aria-label="Induk betina"
              disabled={pending}
              invalid={Boolean(fieldErrors?.mother_id)}
            />
          </Field>
          <Field
            label="Induk Jantan"
            htmlFor="livestock-father"
            error={fieldErrors?.father_id}
          >
            <SearchableSelect
              id="livestock-father"
              name="father_id"
              value={fatherId}
              onValueChange={setFatherId}
              options={parentOptions(fathers)}
              placeholder="Tidak tercatat"
              emptyOptionLabel="Tidak tercatat"
              searchPlaceholder="Cari nama atau tag code…"
              aria-label="Induk jantan"
              disabled={pending}
              invalid={Boolean(fieldErrors?.father_id)}
            />
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
            disabled={pending}
          />
          {fieldErrors?.notes ? (
            <p className="text-xs text-danger" role="alert">
              {fieldErrors.notes}
            </p>
          ) : null}
        </fieldset>
      </form>
    </Dialog>
  );
}
