"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HatcheryResult } from "@/lib/hatchery";

import {
  createHatcheryResult,
  updateHatcheryResult,
} from "@/app/(app)/hatchery/batches/actions";

interface ResultFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  batchId: number;
  startDate: string;
  maxAvailable: number;
  record?: HatcheryResult | null;
}

export function ResultFormDialog({
  open,
  onClose,
  mode,
  batchId,
  startDate,
  maxAvailable,
  record,
}: ResultFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "hatchery-result-form";

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [hatchDate, setHatchDate] = useState(record?.hatch_date ?? "");

  const [hatchedCount, setHatchedCount] = useState("0");
  const [failedCount, setFailedCount] = useState("0");

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setHatchDate("");
      setHatchedCount("0");
      setFailedCount("0");
    } else if (record) {
      setHatchDate(record.hatch_date);
      setHatchedCount(String(record.hatched_count ?? 0));
      setFailedCount(String(record.failed_count ?? 0));
    }

    setErrorMessage("");
  }, [open, mode, record]);

  const hatchedNumber = Number(hatchedCount || 0);
  const failedNumber = Number(failedCount || 0);

  const maxHatched = Math.max(0, maxAvailable - failedNumber);
  const maxFailed = Math.max(0, maxAvailable - hatchedNumber);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hatched = Number(hatchedCount || 0);
    const failed = Number(failedCount || 0);

    if (hatched === 0 && failed === 0) {
      setErrorMessage("Jumlah berhasil atau gagal harus lebih dari 0.");
      return;
    }

    if (hatched + failed > maxAvailable) {
      setErrorMessage(
        `Jumlah berhasil dan gagal tidak boleh melebihi ${maxAvailable}.`,
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const result =
        isEdit && record
          ? await updateHatcheryResult(record.id, formData)
          : await createHatcheryResult(formData);

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
          : "Terjadi kesalahan saat menyimpan hasil penetasan.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Hasil Penetasan" : "Tambah Hasil Penetasan"}
      description={
        isEdit
          ? "Perbarui hasil penetasan batch ini."
          : "Catat hasil penetasan batch ini."
      }
      className="max-w-2xl"
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
        <input type="hidden" name="batch_id" value={batchId} />

        {errorMessage && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <FormSection title="Hasil Penetasan">
          <Field label="Tanggal Menetas" htmlFor="hr-date" required>
            <Input
              id="hr-date"
              name="hatch_date"
              type="date"
              min={startDate}
              value={hatchDate}
              onChange={(event) => setHatchDate(event.target.value)}
              required
            />
          </Field>

          <Field label={`Berhasil* (Maks. ${maxHatched})`} htmlFor="hr-hatched">
            <Input
              id="hr-hatched"
              name="hatched_count"
              type="number"
              min={0}
              max={maxHatched}
              value={hatchedCount}
              onChange={(event) => setHatchedCount(event.target.value)}
              required
            />
          </Field>

          <Field label={`Gagal* (Maks. ${maxFailed})`} htmlFor="hr-failed">
            <Input
              id="hr-failed"
              name="failed_count"
              type="number"
              min={0}
              max={maxFailed}
              value={failedCount}
              onChange={(event) => setFailedCount(event.target.value)}
              required
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
            placeholder="Catatan tambahan mengenai hasil penetasan…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
