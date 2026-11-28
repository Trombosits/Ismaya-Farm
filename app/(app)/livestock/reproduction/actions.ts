"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

function parseReproductionForm(formData: FormData) {
  const femaleId = Number(formData.get("female_livestock_id"));
  const maleValue = String(formData.get("male_livestock_id") ?? "").trim();

  const maleId = maleValue ? Number(maleValue) : null;

  const matingDate = String(formData.get("mating_date") ?? "").trim() || null;

  const pregnancyDate =
    String(formData.get("pregnancy_date") ?? "").trim() || null;

  const expectedBirthDate =
    String(formData.get("expected_birth_date") ?? "").trim() || null;

  const actualBirthDate =
    String(formData.get("actual_birth_date") ?? "").trim() || null;

  const status = String(formData.get("status") ?? "").trim() || "ongoing";

  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!Number.isInteger(femaleId) || femaleId <= 0) {
    throw new Error("Ternak betina wajib dipilih.");
  }

  if (maleId !== null && (!Number.isInteger(maleId) || maleId <= 0)) {
    throw new Error("Data pejantan tidak valid.");
  }

  return {
    female_livestock_id: femaleId,
    male_livestock_id: maleId,
    mating_date: matingDate,
    pregnancy_date: pregnancyDate,
    expected_birth_date: expectedBirthDate,
    actual_birth_date: actualBirthDate,
    status,
    notes,
  };
}

async function validateReproductionLivestock(
  femaleId: number,
  maleId: number | null,
) {
  const supabase = await createClient();

  const { data: female, error: femaleError } = await supabase
    .from("livestock")
    .select("id, sex")
    .eq("id", femaleId)
    .single();

  if (femaleError || !female || female.sex.toLowerCase() !== "female") {
    throw new Error("Ternak betina yang dipilih tidak valid.");
  }

  if (maleId !== null) {
    const { data: male, error: maleError } = await supabase
      .from("livestock")
      .select("id, sex")
      .eq("id", maleId)
      .single();

    if (maleError || !male || male.sex.toLowerCase() !== "male") {
      throw new Error("Ternak jantan yang dipilih tidak valid.");
    }
  }
}

export async function createReproductionRecord(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const input = parseReproductionForm(formData);

    await validateReproductionLivestock(
      input.female_livestock_id,
      input.male_livestock_id,
    );

    const { error } = await supabase
      .from("livestock_reproduction_records")
      .insert(input);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/livestock/reproduction");

    return {
      success: true,
      message: "Data reproduksi berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menambahkan data reproduksi.",
    };
  }
}

export async function updateReproductionRecord(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID data reproduksi tidak valid.");
    }

    const input = parseReproductionForm(formData);

    await validateReproductionLivestock(
      input.female_livestock_id,
      input.male_livestock_id,
    );

    const { error } = await supabase
      .from("livestock_reproduction_records")
      .update(input)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/livestock/reproduction");

    return {
      success: true,
      message: "Data reproduksi berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data reproduksi.",
    };
  }
}

export async function deleteReproductionRecord(
  id: number,
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID data reproduksi tidak valid.");
    }

    const { error } = await supabase
      .from("livestock_reproduction_records")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/livestock/reproduction");

    return {
      success: true,
      message: "Data reproduksi berhasil dihapus.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menghapus data reproduksi.",
    };
  }
}
