"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSpecies, updateSpecies } from "@/lib/actions/species";
import type { ActionState } from "@/lib/actions/types";
import type { SpeciesRow } from "@/lib/supabase/types";

interface SpeciesFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  species?: SpeciesRow | null;
}

export function SpeciesFormDialog({
  open,
  onClose,
  mode,
  species,
}: SpeciesFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "species-form";
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && species
          ? await updateSpecies(species.id, formData)
          : await createSpecies(formData);

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
      title={isEdit ? "Edit Jenis Ternak" : "Tambah Jenis Ternak"}
      description={
        isEdit
          ? "Perbarui informasi jenis ternak."
          : "Lengkapi data untuk menambahkan jenis ternak baru."
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
          label="Nama"
          htmlFor="species-name"
          required
          error={fieldErrors?.name}
        >
          <Input
            id="species-name"
            name="name"
            defaultValue={species?.name ?? ""}
            placeholder="Contoh: Kambing"
            autoComplete="off"
            disabled={pending}
          />
        </Field>
        <Field
          label="Kode"
          htmlFor="species-code"
          required
          error={fieldErrors?.code}
          hint="Kode unik, maksimal 8 karakter."
        >
          <Input
            id="species-code"
            name="code"
            defaultValue={species?.code ?? ""}
            placeholder="Contoh: KMB"
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
