import Link from "next/link";
import { type Livestock, type LivestockSpecies, type LivestockBreed } from "@/lib/livestock";

interface LivestockCellProps {
  id: string | number | null;
  livestockList: Livestock[];
  speciesList: LivestockSpecies[];
  breedList: LivestockBreed[];
}

export function LivestockCell({ 
  id, 
  livestockList, 
  speciesList, 
  breedList 
}: LivestockCellProps) {
  if (!id) {
    return <span className="text-muted">—</span>;
  }

  // Cari data ternak berdasarkan id
  const animalId = Number(id);
  const animal = livestockList.find((a) => a.id === animalId);

  if (!animal) {
    return <span className="text-muted">—</span>;
  }

  // Cari nama spesies dan ras berdasarkan relasi ID
  const speciesName = speciesList.find((s) => s.id === animal.species_id)?.name || "—";
  const breedName = breedList.find((b) => b.id === animal.breed_id)?.name || "—";

  return (
    <Link
      href={`/livestock/${animal.id}`}
      className="flex flex-col transition-colors hover:text-brand-700"
    >
      <span className="font-mono text-[13px] font-semibold text-ink">
        {animal.tag_code}
      </span>
      <span className="text-[11px] text-subtle">
        {speciesName} · {breedName}
      </span>
    </Link>
  );
}