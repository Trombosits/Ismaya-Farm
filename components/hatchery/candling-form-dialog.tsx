"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createCandlingRecord,
  updateCandlingRecord,
} from "@/app/(app)/hatchery/batches/actions";

import type { HatcheryCandlingRecord } from "@/lib/hatchery";

interface CandlingFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  batchId: string;
  maxFertile: number;
  startDate: string;
  record?: HatcheryCandlingRecord | null;
  eggQuantity: number;
}

export function CandlingFormDialog({
  open,
  mode,
  batchId,
  maxFertile,
  startDate,
  eggQuantity,
  record,
  onClose,
}: CandlingFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "candling-form";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [candlingDate, setCandlingDate] = useState(record?.candling_date ?? "");

  const [fertileCount, setFertileCount] = useState(
    String(record?.fertile_count ?? ""),
  );

  const ageDays =
    candlingDate && candlingDate >= startDate
      ? Math.floor(
          (new Date(`${candlingDate}T00:00:00`).getTime() -
            new Date(`${startDate}T00:00:00`).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : "";

  const fertileNumber = Number(fertileCount || 0);

  const infertileCount =
    fertileCount.trim() === ""
      ? ""
      : String(Math.max(0, maxFertile - fertileNumber));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const result =
        isEdit && record
          ? await updateCandlingRecord(record.id, formData)
          : await createCandlingRecord(formData);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data candling.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Candling" : "Tambah Candling"}
      description={
        isEdit
          ? "Perbarui data pemeriksaan candling."
          : "Catat hasil pemeriksaan candling."
      }
      className="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form={formId} size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="batch_id" value={batchId} />

        <FormSection title="Data Candling">
          <Field label="Tanggal Candling" htmlFor="hc-date" required>
            <Input
              id="hc-date"
              name="candling_date"
              type="date"
              min={startDate}
              value={candlingDate}
              onChange={(event) => setCandlingDate(event.target.value)}
              required
            />
          </Field>

          <Field label="Umur Hari" htmlFor="hc-age">
            <Input
              id="hc-age"
              name="age_days"
              type="number"
              value={String(ageDays)}
              placeholder="Terisi otomatis"
              readOnly
              required
            />
          </Field>

          <Field label={`Fertile* (Maks. ${maxFertile})`} htmlFor="hc-fertile">
            <Input
              id="hc-fertile"
              name="fertile_count"
              type="number"
              min={0}
              max={maxFertile}
              value={fertileCount}
              onChange={(event) => setFertileCount(event.target.value)}
              required
            />
          </Field>

          <Field label="Infertile" htmlFor="hc-infertile">
            <Input
              id="hc-infertile"
              name="infertile_count"
              type="number"
              value={infertileCount}
              placeholder="Terisi otomatis"
              readOnly
              required
            />
          </Field>

          <Field label="Embrio Mati" htmlFor="hc-dead">
            <Input
              id="hc-dead"
              name="dead_embryo_count"
              type="number"
              min={0}
              defaultValue={record?.dead_embryo_count ?? ""}
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
            placeholder="Catatan tambahan mengenai candling…"
          />
        </fieldset>

        {errorMessage && (
          <p className="text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </Dialog>
  );
}
