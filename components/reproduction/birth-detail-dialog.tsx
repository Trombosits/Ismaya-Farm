"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/livestock";
import type { BirthRecord } from "@/lib/reproduction";

export interface BirthLivestockSummary {
  id: number;
  tag_code: string;
  breed_name: string;
}

export interface BirthOffspringDetail {
  id: number;
  livestock: BirthLivestockSummary | null;
}

interface BirthDetailDialogProps {
  record: BirthRecord;
  mother: BirthLivestockSummary | null;
  father: BirthLivestockSummary | null;
  offspring: BirthOffspringDetail[];
  onClose: () => void;
}

export function BirthDetailDialog({
  record,
  mother,
  father,
  offspring,
  onClose,
}: BirthDetailDialogProps) {
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
            {mother ? (
              <span>
                {mother.tag_code} - {mother.breed_name}
              </span>
            ) : (
              "Data tidak tersedia"
            )}
          </DescriptionItem>

          <DescriptionItem label="Induk Jantan">
            {father ? (
              <span>
                {father.tag_code} - {father.breed_name}
              </span>
            ) : (
              "Tidak diketahui"
            )}
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
              {offspring.map((item) => (
                <li key={item.id}>
                  {item.livestock ? (
                    <Link
                      href={`/livestock/${item.livestock.id}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-panel"
                    >
                      <span className="font-mono text-[13px] font-semibold text-ink">
                        {item.livestock.tag_code}
                      </span>

                      <span className="text-xs text-muted">
                        {item.livestock.breed_name}
                      </span>
                    </Link>
                  ) : (
                    <span className="block px-3 py-2 text-sm text-muted">
                      Data ternak tidak tersedia
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  );
}
