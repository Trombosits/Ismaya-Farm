"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createBreed, updateBreed } from "@/lib/actions/breeds";
import type { ActionState } from "@/lib/actions/types";
import type { BreedRow, SpeciesRow } from "@/lib/supabase/types";

interface BreedFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  breed?: BreedRow | null;
  species: SpeciesRow[];
}

export function BreedFormDialog({
  open,
  onClose,
  mode,
  breed,
  species,
}: BreedFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "breed-form";
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && breed
          ? await updateBreed(breed.id, formData)
          : await createBreed(formData);

      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setState(result);
      }
    });
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const generalError = state && !state.ok ? state.message : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Ras Ternak" : "Tambah Ras Ternak"}
      description={
        isEdit
          ? "Perbarui informasi ras ternak."
          : "Lengkapi data untuk menambahkan ras ternak baru."
      }
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
        className="flex flex-col gap-4"
      >
        {generalError ? (
          <p
            role="alert"
            className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {generalError}
          </p>
        ) : null}

        <Field
          label="Jenis Ternak"
          htmlFor="breed-species"
          required
          error={fieldErrors?.species_id}
        >
          <Select
            id="breed-species"
            name="species_id"
            defaultValue={breed?.species_id ? String(breed.species_id) : ""}
            disabled={pending}
          >
            <option value="" disabled>
              Pilih jenis ternak
            </option>
            {species.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Nama"
          htmlFor="breed-name"
          required
          error={fieldErrors?.name}
        >
          <Input
            id="breed-name"
            name="name"
            defaultValue={breed?.name ?? ""}
            placeholder="Contoh: Etawa"
            autoComplete="off"
            disabled={pending}
          />
        </Field>
        <Field
          label="Kode"
          htmlFor="breed-code"
          required
          error={fieldErrors?.code}
          hint="Kode unik, maksimal 8 karakter."
        >
          <Input
            id="breed-code"
            name="code"
            defaultValue={breed?.code ?? ""}
            placeholder="Contoh: ETW"
            autoComplete="off"
            maxLength={8}
            className="font-mono uppercase"
            disabled={pending}
          />
        </Field>
      </form>
    </Dialog>
  );
}
