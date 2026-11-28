"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createReproductionRecord,
  updateReproductionRecord,
} from "@/app/(app)/livestock/reproduction/actions";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  REPRODUCTION_STATUS_LABEL,
  type LivestockReproductionRecord,
  type ReproductionStatus,
} from "@/lib/reproduction";

export interface ReproductionLivestockOption {
  id: number;
  tag_code: string;
  sex: string;
  breed_name: string;
}

interface ReproductionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  record?: LivestockReproductionRecord | null;
  livestockOptions: ReproductionLivestockOption[];
}

export function ReproductionFormDialog({
  open,
  onClose,
  mode,
  record,
  livestockOptions,
}: ReproductionFormDialogProps) {
  const router = useRouter();

  const isEdit = mode === "edit";
  const formId = "reproduction-form";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const females = livestockOptions.filter(
    (animal) => animal.sex.toLowerCase() === "female",
  );

  const males = livestockOptions.filter(
    (animal) => animal.sex.toLowerCase() === "male",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const result =
        isEdit && record
          ? await updateReproductionRecord(Number(record.id), formData)
          : await createReproductionRecord(formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data perkawinan.",
      );
    } finally {
      setLoading(false);
    }
  }

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
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button type="submit" form={formId} size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="scrollbar-thin flex max-h-[70vh] flex-col gap-6 overflow-y-auto"
      >
        {error ? (
          <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <FormSection title="Data Perkawinan">
          <Field label="Betina" htmlFor="rp-female" required>
            <Select
              id="rp-female"
              name="female_livestock_id"
              defaultValue={record?.female_livestock_id ?? ""}
              required
            >
              <option value="" disabled>
                Pilih ternak betina
              </option>

              {females.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag_code} — {animal.breed_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Jantan" htmlFor="rp-male" required>
            <Select
              id="rp-male"
              name="male_livestock_id"
              defaultValue={record?.male_livestock_id ?? ""}
              required
            >
              <option value="" disabled>
                Pilih ternak jantan
              </option>

              {males.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag_code} — {animal.breed_name}
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
              required
            />
          </Field>

          <Field label="Status" htmlFor="rp-status">
            <Select
              id="rp-status"
              name="status"
              defaultValue={record?.status ?? "ongoing"}
            >
              {(
                Object.keys(REPRODUCTION_STATUS_LABEL) as ReproductionStatus[]
              ).map((status) => (
                <option key={status} value={status}>
                  {REPRODUCTION_STATUS_LABEL[status]}
                </option>
              ))}
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
