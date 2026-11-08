"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LivestockHealthRecord } from "@/lib/livestock";
import type { ActionState } from "@/lib/actions/types";
import { createHealthRecord, updateHealthRecord } from "@/lib/actions/health";

interface LivestockHealthFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  livestockId: string | number;
  record?: LivestockHealthRecord | null;
}

export function LivestockHealthFormDialog({
  open,
  onClose,
  mode,
  livestockId,
  record,
}: LivestockHealthFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "livestock-health-form";
  
  // 1. Tambahkan referensi form
  const formRef = useRef<HTMLFormElement>(null);
  
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  // 2. Gunakan onSubmit manual untuk mencegat nilai "undefined" pada hidden input
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // FIX: Pastikan hidden input tidak mengirim string "undefined" atau kosong
    const rawId = formData.get("livestock_id");
    if (!rawId || String(rawId).trim() === "" || String(rawId) === "undefined") {
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
      title={isEdit ? "Edit Catatan Kesehatan" : "Tambah Catatan Kesehatan"}
      description={
        isEdit
          ? "Perbarui catatan kesehatan ternak ini."
          : "Catat kejadian kesehatan ternak ini."
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
          {/* 3. Ubah menjadi tipe button agar tidak terblokir validasi HTML5 browser */}
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
        ref={formRef} // Sambungkan ref
        onSubmit={handleSubmit} // Gunakan fungsi onSubmit, bukan action
        noValidate // Matikan validasi diam-diam HTML5
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="livestock_id" defaultValue={livestockId} />

        {state && !state.ok && state.message && (
          <div className="text-sm font-medium text-red-500">
            {state.message}
          </div>
        )}

        <Field 
          label="Tanggal Pemeriksaan" 
          htmlFor="lh-date" 
          required
        >
          <Input
            id="lh-date"
            name="record_date"
            type="date"
            defaultValue={record?.record_date ?? ""}
            disabled={isPending}
          />
          {state && !state.ok && state.fieldErrors?.record_date && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.record_date}</p>
          )}
        </Field>

        <Field label="Kondisi" htmlFor="lh-condition">
          <Input
            id="lh-condition"
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

        <Field label="Diagnosis" htmlFor="lh-diagnosis">
          <Input
            id="lh-diagnosis"
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

        <Field label="Catatan" htmlFor="lh-notes">
          <Textarea
            id="lh-notes"
            name="notes"
            rows={3}
            defaultValue={record?.notes ?? ""}
            placeholder="Catatan tambahan mengenai kondisi ternak…"
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