"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/cn";

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Cari…",
  id,
  className,
  "aria-label": ariaLabel = "Cari",
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-9 w-full rounded-md border border-border-strong bg-surface pr-8 pl-8 text-sm text-ink",
          "placeholder:text-subtle",
          "transition-colors hover:border-muted/50",
          "focus-visible:border-brand-600",
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="Bersihkan pencarian"
          className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-subtle transition-colors hover:bg-canvas hover:text-ink"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
