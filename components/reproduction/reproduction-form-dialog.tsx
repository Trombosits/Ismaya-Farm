"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getBreedName,
  livestockList,
  type Livestock,
} from "@/lib/livestock";
import {
  REPRODUCTION_STATUS_LABEL,
  type LivestockReproductionRecord,
  type ReproductionStatus,
} from "@/lib/reproduction";

interface ReproductionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  record?: LivestockReproductionRecord | null;
}

function livestockOptions(sex: Livestock["sex"]) {
  return livestockList.filter((animal) => animal.sex === sex);
}

export function ReproductionFormDialog({
  open,
  onClose,
  mode,
  record,
}: ReproductionFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "reproduction-form";
  const females = livestockOptions("female");
  const males = livestockOptions("male");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Perkawinan" : "Tambah Perkawinan"}
      description={
        isEdit
          ? "Perbarui data perkawinan ternak."
          : "Catat perkawinan antara ternak betina dan jantan."
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
        <FormSection title="Data Perkawinan">
          <Field label="Betina" htmlFor="rp-female" required>
            <Select
              id="rp-female"
              name="female_livestock_id"
              defaultValue={record?.female_livestock_id ?? ""}
            >
              <option value="" disabled>
                Pilih ternak betina
              </option>
              {females.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag_code} — {getBreedName(animal.breed_id)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jantan" htmlFor="rp-male" required>
            <Select
              id="rp-male"
              name="male_livestock_id"
              defaultValue={record?.male_livestock_id ?? ""}
            >
              <option value="" disabled>
                Pilih ternak jantan
              </option>
              {males.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag_code} — {getBreedName(animal.breed_id)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal Kawin" htmlFor="rp-mating" required>
            <Input
              id="rp-mating"
              name="mating_date"
              type="date"
              defaultValue={record?.mating_date ?? ""}
            />
          </Field>
          <Field label="Status" htmlFor="rp-status">
            <Select
              id="rp-status"
              name="status"
              defaultValue={record?.status ?? "ongoing"}
            >
              {(Object.keys(REPRODUCTION_STATUS_LABEL) as ReproductionStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {REPRODUCTION_STATUS_LABEL[status]}
                  </option>
                ),
              )}
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Perkembangan">
          <Field label="Tanggal Kebuntingan" htmlFor="rp-pregnancy">
            <Input
              id="rp-pregnancy"
              name="pregnancy_date"
              type="date"
              defaultValue={record?.pregnancy_date ?? ""}
            />
          </Field>
          <Field label="Perkiraan Tanggal Lahir" htmlFor="rp-expected">
            <Input
              id="rp-expected"
              name="expected_birth_date"
              type="date"
              defaultValue={record?.expected_birth_date ?? ""}
            />
          </Field>
          <Field label="Tanggal Lahir Aktual" htmlFor="rp-actual">
            <Input
              id="rp-actual"
              name="actual_birth_date"
              type="date"
              defaultValue={record?.actual_birth_date ?? ""}
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
            placeholder="Catatan tambahan mengenai perkawinan ini…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
