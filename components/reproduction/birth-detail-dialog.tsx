"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { Dialog } from "@/components/ui/dialog";
import {
  formatDate,
  getBreedName,
  getLivestockById,
  getLivestockReference,
} from "@/lib/livestock";
import { getOffspringByBirth, type BirthRecord } from "@/lib/reproduction";

interface BirthDetailDialogProps {
  record: BirthRecord;
  onClose: () => void;
}

export function BirthDetailDialog({
  record,
  onClose,
}: BirthDetailDialogProps) {
  const offspring = getOffspringByBirth(record.id);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Detail Kelahiran"
      description={formatDate(record.birth_date)}
      className="max-w-lg"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <DescriptionList columns={2}>
          <DescriptionItem label="Induk Betina">
            {getLivestockReference(record.mother_id)}
          </DescriptionItem>
          <DescriptionItem label="Induk Jantan">
            {getLivestockReference(record.father_id)}
          </DescriptionItem>
          <DescriptionItem label="Tanggal Lahir">
            {formatDate(record.birth_date)}
          </DescriptionItem>
          <DescriptionItem label="Jumlah Anak">
            {record.number_of_offspring}
          </DescriptionItem>
        </DescriptionList>

        {record.notes ? (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
              Catatan
            </span>
            <p className="text-sm text-ink">{record.notes}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Anak Ternak
          </span>
          {offspring.length === 0 ? (
            <p className="text-sm text-muted">
              Belum ada data anak yang tercatat.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {offspring.map((item) => {
                const animal = getLivestockById(item.livestock_id);
                return (
                  <li key={item.id}>
                    {animal ? (
                      <Link
                        href={`/livestock/${animal.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-panel"
                      >
                        <span className="font-mono text-[13px] font-semibold text-ink">
                          {animal.tag_code}
                        </span>
                        <span className="text-xs text-muted">
                          {getBreedName(animal.breed_id)}
                        </span>
                      </Link>
                    ) : (
                      <span className="block px-3 py-2 text-sm text-muted">
                        Data ternak tidak tersedia
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  );
}
