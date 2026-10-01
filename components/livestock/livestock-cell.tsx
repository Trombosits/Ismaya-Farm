import Link from "next/link";

import {
  getBreedName,
  getLivestockById,
  getSpeciesName,
} from "@/lib/livestock";

interface LivestockCellProps {
  id: string | null;
}

export function LivestockCell({ id }: LivestockCellProps) {
  const animal = id ? getLivestockById(id) : undefined;

  if (!animal) {
    return <span className="text-muted">—</span>;
  }

  return (
    <Link
      href={`/livestock/${animal.id}`}
      className="flex flex-col transition-colors hover:text-brand-700"
    >
      <span className="font-mono text-[13px] font-semibold text-ink">
        {animal.tag_code}
      </span>
      <span className="text-[11px] text-subtle">
        {getSpeciesName(animal.species_id)} · {getBreedName(animal.breed_id)}
      </span>
    </Link>
  );
}
