"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LivestockSpecies } from "@/lib/livestock";

interface SpeciesFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  species?: LivestockSpecies | null;
}

export function SpeciesFormDialog({
  open,
  onClose,
  mode,
  species,
}: SpeciesFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "species-form";

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
        <Field label="Nama" htmlFor="species-name" required>
          <Input
            id="species-name"
            name="name"
            defaultValue={species?.name ?? ""}
            placeholder="Contoh: Kambing"
            autoComplete="off"
          />
        </Field>
        <Field
          label="Kode"
          htmlFor="species-code"
          required
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
          />
        </Field>
      </form>
    </Dialog>
  );
}
