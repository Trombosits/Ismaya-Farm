"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { speciesList, type LivestockBreed } from "@/lib/livestock";

interface BreedFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  breed?: LivestockBreed | null;
}

export function BreedFormDialog({
  open,
  onClose,
  mode,
  breed,
}: BreedFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "breed-form";

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
        <Field label="Jenis Ternak" htmlFor="breed-species" required>
          <Select
            id="breed-species"
            name="species_id"
            defaultValue={breed?.species_id ?? ""}
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
        <Field label="Nama" htmlFor="breed-name" required>
          <Input
            id="breed-name"
            name="name"
            defaultValue={breed?.name ?? ""}
            placeholder="Contoh: Etawa"
            autoComplete="off"
          />
        </Field>
        <Field
          label="Kode"
          htmlFor="breed-code"
          required
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
          />
        </Field>
      </form>
    </Dialog>
  );
}
