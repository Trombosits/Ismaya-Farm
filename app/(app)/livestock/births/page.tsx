import { createClient } from "@/lib/supabase/server";

import BirthClient, {
  type BirthPageRecord,
} from "@/components/reproduction/birth-client";

import type { BirthRecord } from "@/lib/reproduction";
import type { BirthLivestockOption } from "@/components/reproduction/birth-form-dialog";
import type {
  BirthLivestockSummary,
  BirthOffspringDetail,
} from "@/components/reproduction/birth-detail-dialog";

export default async function BirthsPage() {
  const supabase = await createClient();

  const [
    { data: birthData, error: birthError },
    { data: livestockData, error: livestockError },
    { data: breedData, error: breedError },
    { data: offspringData, error: offspringError },
  ] = await Promise.all([
    supabase
      .from("birth_records")
      .select("*")
      .order("birth_date", { ascending: false }),

    supabase
      .from("livestock")
      .select("id, tag_code, sex, species_id, breed_id"),

    supabase.from("livestock_breeds").select("id, name"),

    supabase
      .from("birth_offspring")
      .select("id, birth_record_id, livestock_id"),
  ]);

  if (birthError) {
    throw new Error(`Gagal memuat data kelahiran: ${birthError.message}`);
  }

  if (livestockError) {
    throw new Error(`Gagal memuat data ternak: ${livestockError.message}`);
  }

  if (breedError) {
    throw new Error(`Gagal memuat data ras: ${breedError.message}`);
  }

  if (offspringError) {
    throw new Error(`Gagal memuat data anak ternak: ${offspringError.message}`);
  }

  // Membuat lookup ternak berdasarkan ID.
  const livestockById = new Map(
    (livestockData ?? []).map((animal) => [animal.id, animal]),
  );

  // Membuat lookup nama ras berdasarkan ID.
  const breedNameById = new Map(
    (breedData ?? []).map((breed) => [breed.id, breed.name]),
  );

  // Mengubah data ternak menjadi format ringkasan.
  function toSummary(livestockId: number | null): BirthLivestockSummary | null {
    if (livestockId === null) return null;

    const animal = livestockById.get(livestockId);

    if (!animal) return null;

    return {
      id: animal.id,
      tag_code: animal.tag_code,
      breed_name: animal.breed_id
        ? (breedNameById.get(animal.breed_id) ?? "Ras tidak diketahui")
        : "Ras tidak diketahui",
    };
  }

  // Mengelompokkan anak ternak berdasarkan catatan kelahiran.
  const offspringByBirthId = new Map<number, BirthOffspringDetail[]>();

  for (const item of offspringData ?? []) {
    const current = offspringByBirthId.get(item.birth_record_id) ?? [];

    current.push({
      id: item.id,
      livestock: toSummary(item.livestock_id),
    });

    offspringByBirthId.set(item.birth_record_id, current);
  }

  // Menyiapkan data catatan kelahiran.
  const records: BirthPageRecord[] = (birthData ?? []).map((row) => {
    const record: BirthRecord = {
      id: String(row.id),
      mother_id: String(row.mother_id),
      father_id: row.father_id === null ? null : String(row.father_id),
      birth_date: row.birth_date,
      number_of_offspring: row.number_of_offspring,
      notes: row.notes ?? "",
      created_at: row.created_at,
    };

    return {
      record,
      mother: toSummary(row.mother_id),
      father: toSummary(row.father_id),
      offspring: offspringByBirthId.get(row.id) ?? [],
    };
  });

  // Menyiapkan pilihan ternak untuk form kelahiran.
  const livestockOptions: BirthLivestockOption[] = (livestockData ?? []).map(
    (animal) => ({
      id: animal.id,
      tag_code: animal.tag_code,
      sex: animal.sex,
      breed_name: animal.breed_id
        ? (breedNameById.get(animal.breed_id) ?? "Ras tidak diketahui")
        : "Ras tidak diketahui",
    }),
  );

  return <BirthClient records={records} livestockOptions={livestockOptions} />;
}
