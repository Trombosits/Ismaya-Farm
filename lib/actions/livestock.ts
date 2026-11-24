"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { formatTagCode, nextTagNumber } from "@/lib/livestock";
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

const optionalTagNumber = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? null : Number(text);
  },
  z
    .number({ message: "Nomor tag hanya boleh angka." })
    .int("Nomor tag hanya boleh angka.")
    .min(1, "Nomor tag minimal 1.")
    .max(999999, "Nomor tag maksimal 999999.")
    .nullable(),
);

const livestockSchema = z.object({
  tag_number: optionalTagNumber,
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
      fieldErrors: { tag_number: "Nomor tag sudah digunakan." },
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
    tag_number: String(formData.get("tag_number") ?? ""),
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
 * Membentuk Tag Code final. Prefix selalu diambil dari kode jenis ternak,
 * sehingga pengguna hanya menentukan nomor urutnya. Bila nomor kosong, dipakai
 * nomor urut terkecil yang belum terpakai di database.
 */
async function resolveTagCode(
  supabase: Supabase,
  tagNumber: number | null,
  speciesId: number,
  excludeId?: number,
): Promise<string | null> {
  const { data: species, error: speciesError } = await supabase
    .from("livestock_species")
    .select("code")
    .eq("id", speciesId)
    .maybeSingle();

  if (speciesError || !species?.code) return null;

  if (tagNumber !== null) {
    return formatTagCode(species.code, tagNumber);
  }

  let query = supabase.from("livestock").select("tag_code");
  if (excludeId !== undefined) query = query.neq("id", excludeId);

  const { data: rows, error } = await query;
  if (error) return null;

  const existing = (rows ?? [])
    .map((row) => row.tag_code)
    .filter((code): code is string => Boolean(code));

  return formatTagCode(species.code, nextTagNumber(species.code, existing));
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

  const { tag_number, ...values } = parsed.data;
  const supabase = await createClient();
  const tagCode = await resolveTagCode(
    supabase,
    tag_number,
    values.species_id,
  );

  if (!tagCode) {
    return {
      ok: false,
      message: "Tag code gagal dibuat. Periksa jenis ternak yang dipilih.",
      fieldErrors: { tag_number: "Tag code gagal dibuat." },
    };
  }

  const { error } = await supabase
    .from("livestock")
    .insert({ ...values, tag_code: tagCode });

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

  const { tag_number, ...values } = parsed.data;
  const supabase = await createClient();
  const tagCode = await resolveTagCode(
    supabase,
    tag_number,
    values.species_id,
    id,
  );

  if (!tagCode) {
    return {
      ok: false,
      message: "Tag code gagal dibuat. Periksa jenis ternak yang dipilih.",
      fieldErrors: { tag_number: "Tag code gagal dibuat." },
    };
  }

  const { error } = await supabase
    .from("livestock")
    .update({
      ...values,
      tag_code: tagCode,
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
    start_number: formData.get("start_number"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data ternak massal yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const { species_id, breed_id, sex, count, start_number } = parsed.data;

  const supabase = await createClient();
  const { data: species, error: speciesError } = await supabase
    .from("livestock_species")
    .select("code")
    .eq("id", species_id)
    .maybeSingle();

  if (speciesError || !species?.code) {
    return {
      ok: false,
      message: "Jenis ternak tidak ditemukan.",
      fieldErrors: { species_id: "Jenis ternak tidak ditemukan." },
    };
  }

  const rows = Array.from({ length: count }, (_, index) => ({
    tag_code: buildCode(species.code, start_number + index),
    species_id,
    breed_id,
    sex,
    birth_date: null,
    acquisition_date: null,
    acquisition_type: null,
    status: "active" as const,
    notes: null,
  }));

  const { error } = await supabase.from("livestock").insert(rows);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock");
  return { ok: true };
}
