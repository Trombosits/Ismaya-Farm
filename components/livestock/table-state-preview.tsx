"use client";

import { Check, SlidersHorizontal } from "lucide-react";

import { DropdownItem, DropdownMenu } from "@/components/ui/dropdown";

export type TableViewState = "data" | "loading" | "empty" | "error";

const OPTIONS: { value: TableViewState; label: string }[] = [
  { value: "data", label: "Data" },
  { value: "loading", label: "Memuat" },
  { value: "empty", label: "Kosong" },
  { value: "error", label: "Gagal" },
];

/**
 * Prototype-only control. Lets reviewers preview the table loading, empty and
 * error patterns without a backend. Remove once real data fetching exists.
 */
export function TableStatePreview({
  value,
  onChange,
}: {
  value: TableViewState;
  onChange: (value: TableViewState) => void;
}) {
  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          aria-label="Pratinjau status tabel"
          title="Pratinjau status tabel"
          className="grid size-9 place-items-center rounded-md border border-border-strong bg-surface text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          <SlidersHorizontal aria-hidden className="size-4" />
        </button>
      }
    >
      <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-subtle uppercase">
        Pratinjau status
      </p>
      {OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          onClick={() => onChange(option.value)}
          icon={
            <Check
              className={
                option.value === value
                  ? "size-3.5 text-brand-600"
                  : "size-3.5 opacity-0"
              }
            />
          }
        >
          {option.label}
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}
