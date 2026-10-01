"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getBreedName,
  getSpeciesName,
  livestockList,
  type LivestockHealthRecord,
} from "@/lib/livestock";

interface HealthFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  record?: LivestockHealthRecord | null;
  defaultLivestockId?: string;
}

export function HealthFormDialog({
  open,
  onClose,
  mode,
  record,
  defaultLivestockId,
}: HealthFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "health-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Riwayat Kesehatan" : "Tambah Riwayat Kesehatan"}
      description={
        isEdit
          ? "Perbarui informasi riwayat kesehatan."
          : "Catat kejadian kesehatan untuk ternak tertentu."
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
        <Field label="Ternak" htmlFor="health-livestock" required>
          <Select
            id="health-livestock"
            name="livestock_id"
            defaultValue={
              record?.livestock_id ?? defaultLivestockId ?? ""
            }
          >
            <option value="" disabled>
              Pilih ternak
            </option>
            {livestockList.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.tag_code} — {getSpeciesName(animal.species_id)} /{" "}
                {getBreedName(animal.breed_id)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tanggal" htmlFor="health-date" required>
          <Input
            id="health-date"
            name="record_date"
            type="date"
            defaultValue={record?.record_date ?? ""}
          />
        </Field>
        <Field label="Kondisi" htmlFor="health-condition" required>
          <Input
            id="health-condition"
            name="condition"
            defaultValue={record?.condition ?? ""}
            placeholder="Contoh: Kurang aktif"
            autoComplete="off"
          />
        </Field>
        <Field label="Diagnosis" htmlFor="health-diagnosis">
          <Input
            id="health-diagnosis"
            name="diagnosis"
            defaultValue={record?.diagnosis ?? ""}
            placeholder="Contoh: Demam"
            autoComplete="off"
          />
        </Field>
        <Field label="Catatan" htmlFor="health-notes">
          <Textarea
            id="health-notes"
            name="notes"
            rows={3}
            defaultValue={record?.notes ?? ""}
            placeholder="Catatan tambahan mengenai riwayat kesehatan ini…"
          />
        </Field>
      </form>
    </Dialog>
  );
}
