"use client";

import { useRef, useState, useTransition } from "react";
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

import type { ActionState } from "@/lib/actions/types";
import { createHealthRecord, updateHealthRecord } from "@/lib/actions/health";

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

  const formRef = useRef<HTMLFormElement>(null);

  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // FIX: Cegat nilai kosong atau string "undefined" agar Zod tidak menerima NaN
    const rawLivestockId = formData.get("livestock_id");
    if (!rawLivestockId || String(rawLivestockId).trim() === "" || String(rawLivestockId) === "undefined") {
      formData.set("livestock_id", "0");
    }

    startTransition(async () => {
      let result: ActionState;

      if (isEdit && record?.id) {
        result = await updateHealthRecord(Number(record.id), formData); 
      } else {
        result = await createHealthRecord(formData);
      }

      setState(result);

      if (result.ok) {
        onClose();
      }
    });
  };

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
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button 
            type="button" 
            size="sm"
            disabled={isPending}
            onClick={() => formRef.current?.requestSubmit()}
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {state && !state.ok && state.message && (
          <div className="text-sm font-medium text-red-500">
            {state.message}
          </div>
        )}

        <Field label="Ternak" htmlFor="health-livestock" required>
          <Select
            id="health-livestock"
            name="livestock_id"
            defaultValue={
              record?.livestock_id ?? defaultLivestockId ?? ""
            }
            disabled={isPending}
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
          {state && !state.ok && state.fieldErrors?.livestock_id && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.livestock_id}</p>
          )}
        </Field>

        <Field label="Tanggal" htmlFor="health-date" required>
          <Input
            id="health-date"
            name="record_date"
            type="date"
            defaultValue={record?.record_date ?? ""}
            disabled={isPending}
          />
          {state && !state.ok && state.fieldErrors?.record_date && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.record_date}</p>
          )}
        </Field>

        <Field label="Kondisi" htmlFor="health-condition">
          <Input
            id="health-condition"
            name="condition"
            defaultValue={record?.condition ?? ""}
            placeholder="Contoh: Kurang aktif"
            autoComplete="off"
            disabled={isPending}
          />
          {state && !state.ok && state.fieldErrors?.condition && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.condition}</p>
          )}
        </Field>

        <Field label="Diagnosis" htmlFor="health-diagnosis">
          <Input
            id="health-diagnosis"
            name="diagnosis"
            defaultValue={record?.diagnosis ?? ""}
            placeholder="Contoh: Demam"
            autoComplete="off"
            disabled={isPending}
          />
          {state && !state.ok && state.fieldErrors?.diagnosis && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.diagnosis}</p>
          )}
        </Field>

        <Field label="Catatan" htmlFor="health-notes">
          <Textarea
            id="health-notes"
            name="notes"
            rows={3}
            defaultValue={record?.notes ?? ""}
            placeholder="Catatan tambahan mengenai riwayat kesehatan ini…"
            disabled={isPending}
          />
          {state && !state.ok && state.fieldErrors?.notes && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.notes}</p>
          )}
        </Field>
      </form>
    </Dialog>
  );
}