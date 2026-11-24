"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildNextTagCode, formatTagCode } from "@/lib/livestock";
import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

type Supabase = Awaited<ReturnType<typeof createClient>>;

const optionalDate = (message: string) =>
  z.preprocess(
    (value) => {
      const text = typeof value === "string" ? value.trim() : "";
      return text === "" ? null : text;
    },
    z.string().regex(dateRegex, message).nullable(),
  );

const optionalAcquisitionType = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? null : text;
  },
  z
    .enum(["born", "purchased", "gift"], {
      message: "Cara perolehan tidak valid.",
    })
    .nullable(),
);

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

const optionalTagCode = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? null : text;
  },
  z
    .string()
    .max(30, "Tag code maksimal 30 karakter.")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "Tag code hanya boleh huruf, angka, dan tanda hubung.",
    )
    .transform((value) => value.toUpperCase())
    .nullable(),
);

const livestockSchema = z.object({
  tag_code: optionalTagCode,
  species_id: requiredId("Jenis ternak wajib dipilih."),
  breed_id: optionalId(),
  sex: z.enum(["male", "female"], {
    message: "Jenis kelamin wajib dipilih.",
  }),
  birth_date: optionalDate("Format tanggal lahir tidak valid (YYYY-MM-DD)."),
  acquisition_date: optionalDate(
    "Format tanggal perolehan tidak valid (YYYY-MM-DD).",
  ),
  acquisition_type: optionalAcquisitionType,
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
  return livestockSchema.safeParse({
    tag_code: String(formData.get("tag_code") ?? ""),
    species_id: formData.get("species_id"),
    breed_id: formData.get("breed_id"),
    sex: String(formData.get("sex") ?? ""),
    birth_date: String(formData.get("birth_date") ?? ""),
    acquisition_date: String(formData.get("acquisition_date") ?? ""),
    acquisition_type: String(formData.get("acquisition_type") ?? ""),
    status: String(formData.get("status") ?? "active"),
    mother_id: formData.get("mother_id"),
    father_id: formData.get("father_id"),
    notes: String(formData.get("notes") ?? ""),
  });
}

/**
 * Menentukan Tag Code final. Bila form mengirim tag kosong, kode dibentuk dari
 * kode jenis ternak + nomor urut terkecil yang belum terpakai di database.
 */
async function resolveTagCode(
  supabase: Supabase,
  tagCode: string | null,
  speciesId: number,
  excludeId?: number,
): Promise<string | null> {
  if (tagCode) return tagCode;

  const { data: species, error: speciesError } = await supabase
    .from("livestock_species")
    .select("code")
    .eq("id", speciesId)
    .maybeSingle();

  if (speciesError || !species?.code) return null;

  let query = supabase.from("livestock").select("tag_code");
  if (excludeId !== undefined) query = query.neq("id", excludeId);

  const { data: rows, error } = await query;
  if (error) return null;

  const existing = (rows ?? [])
    .map((row) => row.tag_code)
    .filter((code): code is string => Boolean(code));

  return buildNextTagCode(species.code, existing) || null;
}

function buildCode(prefix: string, value: number): string {
  return formatTagCode(prefix, value);
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
  const tagCode = await resolveTagCode(
    supabase,
    parsed.data.tag_code,
    parsed.data.species_id,
  );

  if (!tagCode) {
    return {
      ok: false,
      message: "Tag code gagal dibuat otomatis. Isi tag code secara manual.",
      fieldErrors: { tag_code: "Tag code wajib diisi." },
    };
  }

  const { error } = await supabase
    .from("livestock")
    .insert({ ...parsed.data, tag_code: tagCode });

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
  const tagCode = await resolveTagCode(
    supabase,
    parsed.data.tag_code,
    parsed.data.species_id,
    id,
  );

  const { error } = await supabase
    .from("livestock")
    .update({
      ...parsed.data,
      tag_code: tagCode ?? parsed.data.tag_code ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock");
  return { ok: true };
}

/**
 * Membuat banyak ternak sekaligus dengan kode berurutan.
 *
 * Form massal hanya mengisi identitas dasar, sehingga tanggal lahir, tanggal
 * perolehan, dan cara perolehan dikirim sebagai null. Status diisi "active".
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

  const rows = Array.from({ length: count }, (_, index) => ({
    tag_code: buildCode(prefix, start_number + index),
    species_id,
    breed_id,
    sex,
    birth_date: null,
    acquisition_date: null,
    acquisition_type: null,
    status: "active" as const,
    notes: null,
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("livestock").insert(rows);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock");
  return { ok: true };
}
