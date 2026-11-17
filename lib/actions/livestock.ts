"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const requiredId = (message: string) =>
  z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z.number().int().positive(message),
  );

const optionalId = () =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    },
    z.number().int().positive().nullable(),
  );

const livestockSchema = z.object({
  tag_code: z
    .string()
    .trim()
    .min(1, "Tag code wajib diisi.")
    .max(30, "Tag code maksimal 30 karakter.")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "Tag code hanya boleh huruf, angka, dan tanda hubung.",
    )
    .transform((value) => value.toUpperCase()),
  species_id: requiredId("Jenis ternak wajib dipilih."),
  breed_id: optionalId(),
  sex: z.enum(["male", "female"], {
    message: "Jenis kelamin wajib dipilih.",
  }),
  birth_date: z
    .string()
    .regex(dateRegex, "Format tanggal lahir tidak valid (YYYY-MM-DD)."),
  acquisition_date: z
    .string()
    .regex(dateRegex, "Format tanggal perolehan tidak valid (YYYY-MM-DD)."),
  acquisition_type: z.enum(["born", "purchased", "gift"], {
    message: "Cara perolehan tidak valid.",
  }),
  status: z.enum(["active", "sold", "dead", "transferred"], {
    message: "Status tidak valid.",
  }),
  mother_id: optionalId(),
  father_id: optionalId(),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

const bulkSchema = z.object({
  species_id: requiredId("Jenis ternak wajib dipilih."),
  breed_id: optionalId(),
  sex: z.enum(["male", "female"], {
    message: "Jenis kelamin wajib dipilih.",
  }),
  count: z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z
      .number()
      .int()
      .min(1, "Jumlah minimal 1.")
      .max(1000, "Jumlah maksimal 1000 per proses massal."),
  ),
  prefix: z
    .string()
    .trim()
    .min(1, "Prefix kode wajib diisi.")
    .max(20, "Prefix maksimal 20 karakter.")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Prefix hanya boleh huruf dan angka.",
    )
    .transform((value) => value.toUpperCase()),
  start_number: z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z.number().int().min(1, "Nomor mulai minimal 1."),
  ),
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

function mapWriteError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") {
    return {
      ok: false,
      message: "Tag code sudah digunakan.",
      fieldErrors: { tag_code: "Tag code sudah digunakan." },
    };
  }
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Data referensi (jenis/ras/induk) tidak ditemukan.",
      fieldErrors: { species_id: "Jenis ternak tidak ditemukan." },
    };
  }
  return { ok: false, message: `Gagal menyimpan data: ${error.message}` };
}

function parse(formData: FormData) {
  const birthDate = String(formData.get("birth_date") ?? "");
  const acquisitionDate =
    String(formData.get("acquisition_date") ?? "") || birthDate;

  return livestockSchema.safeParse({
    tag_code: String(formData.get("tag_code") ?? ""),
    species_id: formData.get("species_id"),
    breed_id: formData.get("breed_id"),
    sex: String(formData.get("sex") ?? ""),
    birth_date: birthDate,
    acquisition_date: acquisitionDate,
    acquisition_type: String(formData.get("acquisition_type") ?? "born"),
    status: String(formData.get("status") ?? "active"),
    mother_id: formData.get("mother_id"),
    father_id: formData.get("father_id"),
    notes: String(formData.get("notes") ?? ""),
  });
}

function buildCode(prefix: string, value: number): string {
  return `${prefix}-${String(value).padStart(3, "0")}`;
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export async function createLivestock(
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data ternak yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("livestock").insert(parsed.data);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock");
  return { ok: true };
}

export async function updateLivestock(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID ternak tidak valid." };
  }

  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data ternak yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("livestock")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock");
  return { ok: true };
}

/**
 * Membuat banyak ternak sekaligus dengan kode berurutan.
 *
 * Karena form massal tidak mengisi tanggal, dipakai default:
 * - acquisition_date & birth_date = hari ini
 * - acquisition_type = "purchased"
 * - status = "active"
 */
export async function createLivestockBulk(
  formData: FormData,
): Promise<ActionState> {
  const parsed = bulkSchema.safeParse({
    species_id: formData.get("species_id"),
    breed_id: formData.get("breed_id"),
    sex: String(formData.get("sex") ?? ""),
    count: formData.get("count"),
    prefix: String(formData.get("prefix") ?? ""),
    start_number: formData.get("start_number"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data ternak massal yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const { species_id, breed_id, sex, count, prefix, start_number } =
    parsed.data;
  const today = todayIso();

  const rows = Array.from({ length: count }, (_, index) => ({
    tag_code: buildCode(prefix, start_number + index),
    species_id,
    breed_id,
    sex,
    birth_date: today,
    acquisition_date: today,
    acquisition_type: "purchased" as const,
    status: "active" as const,
    notes: null,
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("livestock").insert(rows);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock");
  return { ok: true };
}
