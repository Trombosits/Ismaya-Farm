"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

function getFormString(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function getOptionalNumber(value: string): number | null {
  if (!value) return null;

  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function formatTagCode(prefix: string, number: number) {
  return `${prefix.toUpperCase()}-${String(number).padStart(3, "0")}`;
}

/**
 * Mengambil nomor terkecil yang belum digunakan.
 * Contoh: KMB-001, KMB-002, KMB-004 -> nomor berikutnya KMB-003.
 */
function nextTagNumber(prefix: string, existingTags: string[]) {
  const normalizedPrefix = prefix.toUpperCase();
  const usedNumbers = new Set<number>();

  for (const tag of existingTags) {
    const match = tag.match(new RegExp(`^${normalizedPrefix}-(\\d+)$`, "i"));

    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  }

  let number = 1;

  while (usedNumbers.has(number)) {
    number++;
  }

  return number;
}

function parseBirthForm(formData: FormData) {
  const motherId = Number(getFormString(formData, "mother_id"));
  const fatherValue = getFormString(formData, "father_id");
  const fatherId = fatherValue ? Number(fatherValue) : null;
  const birthDate = getFormString(formData, "birth_date");
  const offspringCount = Number(getFormString(formData, "number_of_offspring"));
  const notes = getFormString(formData, "notes");

  if (!Number.isInteger(motherId) || motherId <= 0) {
    throw new Error("Induk wajib dipilih.");
  }

  if (fatherId !== null && (!Number.isInteger(fatherId) || fatherId <= 0)) {
    throw new Error("Data pejantan tidak valid.");
  }

  if (!birthDate) {
    throw new Error("Tanggal kelahiran wajib diisi.");
  }

  if (!Number.isInteger(offspringCount) || offspringCount < 1) {
    throw new Error("Jumlah anak minimal 1.");
  }

  return {
    motherId,
    fatherId,
    birthDate,
    offspringCount,
    notes: notes || null,
  };
}

/**
 * Membuat catatan kelahiran sekaligus membuat data anak di livestock.
 */
export async function createBirthRecord(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  let birthRecordId: number | null = null;
  let createdLivestockIds: number[] = [];

  try {
    const input = parseBirthForm(formData);

    // 1. Ambil data induk.
    const { data: mother, error: motherError } = await supabase
      .from("livestock")
      .select("id, sex, species_id, breed_id")
      .eq("id", input.motherId)
      .single();

    if (motherError || !mother) {
      throw new Error("Data induk tidak ditemukan.");
    }

    if (mother.sex.toLowerCase() !== "female") {
      throw new Error("Ternak yang dipilih sebagai induk harus betina.");
    }

    // 2. Validasi pejantan jika diisi.
    if (input.fatherId !== null) {
      const { data: father, error: fatherError } = await supabase
        .from("livestock")
        .select("id, sex, species_id")
        .eq("id", input.fatherId)
        .single();

      if (fatherError || !father) {
        throw new Error("Data pejantan tidak ditemukan.");
      }

      if (father.sex.toLowerCase() !== "male") {
        throw new Error("Ternak yang dipilih sebagai pejantan harus jantan.");
      }

      if (father.species_id !== mother.species_id) {
        throw new Error("Spesies pejantan harus sama dengan spesies induk.");
      }
    }

    // 3. Ambil kode spesies untuk membuat tag_code.
    const { data: species, error: speciesError } = await supabase
      .from("livestock_species")
      .select("id, code")
      .eq("id", mother.species_id)
      .single();

    if (speciesError || !species?.code) {
      throw new Error("Kode spesies induk tidak ditemukan.");
    }

    const prefix = species.code.trim().toUpperCase();

    // 4. Buat catatan kelahiran.
    const { data: birthRecord, error: birthError } = await supabase
      .from("birth_records")
      .insert({
        mother_id: input.motherId,
        father_id: input.fatherId,
        birth_date: input.birthDate,
        number_of_offspring: input.offspringCount,
        notes: input.notes,
      })
      .select("id")
      .single();

    if (birthError || !birthRecord) {
      throw new Error(
        birthError?.message ?? "Gagal membuat catatan kelahiran.",
      );
    }

    birthRecordId = birthRecord.id;

    // 5. Ambil kode ternak yang sudah digunakan.
    const { data: existingLivestock, error: tagsError } = await supabase
      .from("livestock")
      .select("tag_code");

    if (tagsError) {
      throw new Error(tagsError.message);
    }

    const existingTags = (existingLivestock ?? []).map((item) => item.tag_code);

    // 6. Buat satu data livestock untuk setiap anak.
    const livestockToInsert = Array.from(
      { length: input.offspringCount },
      () => {
        const tagNumber = nextTagNumber(prefix, existingTags);
        const tagCode = formatTagCode(prefix, tagNumber);

        existingTags.push(tagCode);

        return {
          tag_code: tagCode,
          species_id: mother.species_id,
          breed_id: mother.breed_id,
          sex: "unknown",
          birth_date: input.birthDate,
          mother_id: input.motherId,
          father_id: input.fatherId,
          status: "born",
        };
      },
    );

    const { data: children, error: childrenError } = await supabase
      .from("livestock")
      .insert(livestockToInsert)
      .select("id");

    if (childrenError || !children) {
      throw new Error(
        childrenError?.message ?? "Gagal membuat data anak ternak.",
      );
    }

    createdLivestockIds = children.map((child) => child.id);

    // 7. Hubungkan setiap anak dengan catatan kelahiran.
    const offspringRelations = createdLivestockIds.map((livestockId) => ({
      birth_record_id: birthRecordId!,
      livestock_id: livestockId,
    }));

    const { error: offspringError } = await supabase
      .from("birth_offspring")
      .insert(offspringRelations);

    if (offspringError) {
      throw new Error(offspringError.message);
    }

    revalidatePath("/livestock/births");
    revalidatePath("/livestock");
    revalidatePath("/livestock/reproduction");

    return {
      success: true,
      message: `${input.offspringCount} anak ternak berhasil dibuat dan dicatat.`,
    };
  } catch (error) {
    // Kompensasi: bersihkan data yang sempat dibuat jika proses gagal.
    if (createdLivestockIds.length > 0) {
      await supabase
        .from("birth_offspring")
        .delete()
        .in("livestock_id", createdLivestockIds);

      await supabase.from("livestock").delete().in("id", createdLivestockIds);
    }

    if (birthRecordId !== null) {
      await supabase.from("birth_records").delete().eq("id", birthRecordId);
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan kelahiran.",
    };
  }
}

/**
 * Mengubah informasi catatan kelahiran.
 * Data anak yang sudah dibuat tidak dihapus atau dibuat ulang.
 */
export async function updateBirthRecord(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID catatan kelahiran tidak valid.");
    }

    const input = parseBirthForm(formData);

    const { data: mother, error: motherError } = await supabase
      .from("livestock")
      .select("id, sex, species_id")
      .eq("id", input.motherId)
      .single();

    if (motherError || !mother || mother.sex.toLowerCase() !== "female") {
      throw new Error("Induk tidak valid.");
    }

    if (input.fatherId !== null) {
      const { data: father, error: fatherError } = await supabase
        .from("livestock")
        .select("id, sex, species_id")
        .eq("id", input.fatherId)
        .single();

      if (
        fatherError ||
        !father ||
        father.sex.toLowerCase() !== "male" ||
        father.species_id !== mother.species_id
      ) {
        throw new Error("Pejantan tidak valid.");
      }
    }

    // Jumlah anak tidak boleh diubah jika tidak sesuai jumlah relasi anak.
    const { count, error: countError } = await supabase
      .from("birth_offspring")
      .select("id", { count: "exact", head: true })
      .eq("birth_record_id", id);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((count ?? 0) !== input.offspringCount) {
      throw new Error(
        `Jumlah anak yang tercatat di sistem adalah ${count ?? 0}. Jumlah anak pada formulir tidak boleh diubah melalui edit catatan kelahiran.`,
      );
    }

    const { error } = await supabase
      .from("birth_records")
      .update({
        mother_id: input.motherId,
        father_id: input.fatherId,
        birth_date: input.birthDate,
        number_of_offspring: input.offspringCount,
        notes: input.notes,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/livestock/births");
    revalidatePath("/livestock");

    return {
      success: true,
      message: "Catatan kelahiran berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui catatan kelahiran.",
    };
  }
}

/**
 * Menghapus catatan kelahiran dan relasinya.
 * Data anak di livestock tetap dipertahankan.
 */
export async function deleteBirthRecord(id: number): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID catatan kelahiran tidak valid.");
    }

    const { error: relationError } = await supabase
      .from("birth_offspring")
      .delete()
      .eq("birth_record_id", id);

    if (relationError) {
      throw new Error(relationError.message);
    }

    const { error } = await supabase
      .from("birth_records")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/livestock/births");
    revalidatePath("/livestock");

    return {
      success: true,
      message:
        "Catatan kelahiran berhasil dihapus. Data anak ternak tetap tersimpan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menghapus catatan kelahiran.",
    };
  }
}
