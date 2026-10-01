"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EggCollectionRecord } from "@/lib/hatchery";
import { speciesList } from "@/lib/livestock";

interface EggCollectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  record?: EggCollectionRecord | null;
}

export function EggCollectionFormDialog({
  open,
  onClose,
  mode,
  record,
}: EggCollectionFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "egg-collection-form";

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
        <FormSection title="Data Pengumpulan">
          <Field label="Jenis Ternak" htmlFor="ec-species" required>
            <Select
              id="ec-species"
              name="species_id"
              defaultValue={record?.species_id ?? ""}
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
          <Field label="Tanggal Pengumpulan" htmlFor="ec-date" required>
            <Input
              id="ec-date"
              name="collection_date"
              type="date"
              defaultValue={record?.collection_date ?? ""}
            />
          </Field>
          <Field label="Jumlah" htmlFor="ec-qty" required>
            <Input
              id="ec-qty"
              name="quantity"
              type="number"
              min={0}
              defaultValue={record?.quantity ?? ""}
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
