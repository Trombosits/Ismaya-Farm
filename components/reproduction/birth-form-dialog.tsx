"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBreedName, livestockList } from "@/lib/livestock";
import type { BirthRecord } from "@/lib/reproduction";

interface BirthFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  record?: BirthRecord | null;
}

export function BirthFormDialog({
  open,
  onClose,
  mode,
  record,
}: BirthFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "birth-form";
  const females = livestockList.filter((animal) => animal.sex === "female");
  const males = livestockList.filter((animal) => animal.sex === "male");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kelahiran" : "Tambah Kelahiran"}
      description={
        isEdit
          ? "Perbarui data kelahiran ternak."
          : "Catat kelahiran beserta jumlah anak yang lahir."
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
        <Field label="Induk Betina" htmlFor="bt-mother" required>
          <Select
            id="bt-mother"
            name="mother_id"
            defaultValue={record?.mother_id ?? ""}
          >
            <option value="" disabled>
              Pilih induk betina
            </option>
            {females.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.tag_code} — {getBreedName(animal.breed_id)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Induk Jantan" htmlFor="bt-father">
          <Select
            id="bt-father"
            name="father_id"
            defaultValue={record?.father_id ?? ""}
          >
            <option value="">Tidak tercatat</option>
            {males.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.tag_code} — {getBreedName(animal.breed_id)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tanggal Lahir" htmlFor="bt-date" required>
          <Input
            id="bt-date"
            name="birth_date"
            type="date"
            defaultValue={record?.birth_date ?? ""}
          />
        </Field>
        <Field label="Jumlah Anak" htmlFor="bt-count" required>
          <Input
            id="bt-count"
            name="number_of_offspring"
            type="number"
            min={1}
            defaultValue={record?.number_of_offspring ?? 1}
          />
        </Field>
        <Field label="Catatan" htmlFor="bt-notes">
          <Textarea
            id="bt-notes"
            name="notes"
            rows={3}
            defaultValue={record?.notes ?? ""}
            placeholder="Catatan tambahan mengenai kelahiran ini…"
          />
        </Field>
      </form>
    </Dialog>
  );
}
