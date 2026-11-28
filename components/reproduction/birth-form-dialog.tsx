"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createBirthRecord,
  updateBirthRecord,
} from "@/app/(app)/livestock/births/actions";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BirthRecord } from "@/lib/reproduction";

export interface BirthLivestockOption {
  id: number;
  tag_code: string;
  sex: string;
  breed_name: string;
}

interface BirthFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  record?: BirthRecord | null;
  livestockOptions: BirthLivestockOption[];
}

export function BirthFormDialog({
  open,
  onClose,
  mode,
  record,
  livestockOptions,
}: BirthFormDialogProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEdit = mode === "edit";
  const formId = "birth-form";

  const females = livestockOptions.filter(
    (animal) => animal.sex.toLowerCase() === "female",
  );

  const males = livestockOptions.filter(
    (animal) => animal.sex.toLowerCase() === "male",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const result =
        isEdit && record
          ? await updateBirthRecord(Number(record.id), formData)
          : await createBirthRecord(formData);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      onClose();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data kelahiran.",
      );
    } finally {
      setSaving(false);
    }
  }

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
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>

          <Button type="submit" form={formId} size="sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Induk Betina" htmlFor="bt-mother" required>
          <Select
            id="bt-mother"
            name="mother_id"
            defaultValue={record?.mother_id ?? ""}
            required
          >
            <option value="" disabled>
              Pilih induk betina
            </option>

            {females.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.tag_code} — {animal.breed_name}
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
                {animal.tag_code} — {animal.breed_name}
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
            required
          />
        </Field>

        <Field label="Jumlah Anak" htmlFor="bt-count" required>
          <Input
            id="bt-count"
            name="number_of_offspring"
            type="number"
            min={1}
            step={1}
            defaultValue={record?.number_of_offspring ?? 1}
            required
            disabled={isEdit}
          />
          {isEdit ? (
            <p className="text-xs text-muted">
              Jumlah anak tidak dapat diubah melalui edit catatan kelahiran
              karena data anak sudah dibuat di Data Ternak.
            </p>
          ) : (
            <p className="text-xs text-muted">
              Sistem akan otomatis membuat data ternak untuk setiap anak.
            </p>
          )}
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

        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}
