"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const healthSchema = z.object({
  livestock_id: z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z.number().int().positive("Ternak wajib dipilih."),
  ),
  record_date: z
    .string()
    .min(1, "Tanggal pencatatan wajib diisi.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)."),
  condition: z
    .string()
    .trim()
    .min(1, "Kondisi wajib diisi.")
    .max(150, "Kondisi maksimal 150 karakter."),
  diagnosis: z
    .string()
    .trim()
    .max(150, "Diagnosis maksimal 150 karakter.")
    .optional()
    .transform((value) => (value ? value : null)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

function parse(formData: FormData) {
  return healthSchema.safeParse({
    livestock_id: formData.get("livestock_id"),
    record_date: String(formData.get("record_date") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    diagnosis: String(formData.get("diagnosis") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

function mapWriteError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Data ternak tidak ditemukan.",
      fieldErrors: { livestock_id: "Ternak yang dipilih tidak terdaftar." },
    };
  }
  return {
    ok: false,
    message: `Gagal menyimpan catatan kesehatan: ${error.message}`,
  };
}

function revalidateHealthPages() {
  revalidatePath("/health");
  revalidatePath("/livestock", "layout");
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export async function createHealthRecord(
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data kesehatan yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("livestock_health_records").insert({
    livestock_id: parsed.data.livestock_id,
    record_date: parsed.data.record_date,
    condition: parsed.data.condition,
    diagnosis: parsed.data.diagnosis,
    notes: parsed.data.notes,
  });

  if (error) return mapWriteError(error);

  revalidateHealthPages();
  return { ok: true };
}

export async function updateHealthRecord(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID catatan kesehatan tidak valid." };
  }

  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data kesehatan yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("livestock_health_records")
    .update({
      livestock_id: parsed.data.livestock_id,
      record_date: parsed.data.record_date,
      condition: parsed.data.condition,
      diagnosis: parsed.data.diagnosis,
      notes: parsed.data.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidateHealthPages();
  return { ok: true };
}

export async function deleteHealthRecord(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID catatan kesehatan tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("livestock_health_records")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      message: `Gagal menghapus catatan kesehatan: ${error.message}`,
    };
  }

  revalidateHealthPages();
  return { ok: true };
}
