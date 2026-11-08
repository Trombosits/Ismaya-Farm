"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const healthSchema = z.object({
  // Preprocess dengan penulisan yang benar (return isNaN)
  livestock_id: z.preprocess(
    (val) => {
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    },
    z.number()
      .int()
      .positive("Ternak wajib dipilih.")
  ),
  record_date: z
    .string()
    .min(1, "Tanggal pencatatan wajib diisi.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)."),
  condition: z
    .string()
    .trim()
    .max(255, "Kondisi maksimal 255 karakter.")
    .optional()
    .transform((val) => (val === "" ? null : val)),
  diagnosis: z
    .string()
    .trim()
    .max(500, "Diagnosis maksimal 500 karakter.")
    .optional()
    .transform((val) => (val === "" ? null : val)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),
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
  // Kode menjadi lebih bersih karena z.preprocess di atas sudah otomatis
  // menangani string kosong (""), null, maupun teks "undefined" menjadi angka 0
  return healthSchema.safeParse({
    livestock_id: formData.get("livestock_id"),
    record_date: String(formData.get("record_date") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    diagnosis: String(formData.get("diagnosis") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

function mapWriteError(error: { code?: string; message: string }): ActionState {
  // 23503 adalah kode error PostgreSQL untuk Foreign Key Violation
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Data ternak tidak ditemukan.",
      fieldErrors: { livestock_id: "Ternak yang dipilih tidak terdaftar." },
    };
  }
  return { ok: false, message: `Gagal menyimpan catatan kesehatan: ${error.message}` };
}

export async function createHealthRecord(formData: FormData): Promise<ActionState> {
  const parsed = parse(formData);
  
  if (!parsed.success) {
    console.log("🚨 ERROR VALIDASI ZOD:", parsed.error.format()); 
    return {
      ok: false,
      message: "Periksa kembali data kesehatan yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("livestock_health_records")
    .insert({
      livestock_id: parsed.data.livestock_id,
      record_date: parsed.data.record_date,
      condition: parsed.data.condition,
      diagnosis: parsed.data.diagnosis,
      notes: parsed.data.notes,
    });

  if (error) {
    console.error("🚨 ERROR SUPABASE:", error); 
    return mapWriteError(error);
  }

  revalidatePath("/livestock/health");
  return { ok: true };
}

export async function updateHealthRecord(
  id: number,
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
  const { error } = await (supabase as any)
    .from("livestock_health_records")
    .update({
      livestock_id: parsed.data.livestock_id,
      record_date: parsed.data.record_date,
      condition: parsed.data.condition,
      diagnosis: parsed.data.diagnosis,
      notes: parsed.data.notes,
      updated_at: new Date().toISOString(), // Diperlukan karena PostgreSQL tidak otomatis meng-update kolom ini kecuali ada Trigger
    })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock/health");
  return { ok: true };
}

export async function deleteHealthRecord(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("livestock_health_records")
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, message: `Gagal menghapus catatan kesehatan: ${error.message}` };
  }

  revalidatePath("/livestock/health");
  return { ok: true };
}