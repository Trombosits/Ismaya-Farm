"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/cn";

export interface SearchableOption {
  value: string;
  label: string;
  /** Teks tambahan yang ikut dicari (mis. tag code atau nama jenis). */
  keywords?: string;
}

interface SearchableSelectProps {
  id?: string;
  /** Nama field yang dikirim lewat FormData (memakai input hidden). */
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** Opsi kosong di paling atas, mis. "Tidak tercatat". */
  emptyOptionLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
}

interface Anchor {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

export function SearchableSelect({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Pilih…",
  searchPlaceholder = "Cari…",
  emptyOptionLabel,
  disabled = false,
  invalid = false,
  className,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  // Panel dirender di dalam <dialog> induk bila ada: konten di luar dialog
  // modal bersifat inert sehingga tidak bisa diklik.
  const [host, setHost] = useState<HTMLElement | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const allOptions = useMemo<SearchableOption[]>(
    () =>
      emptyOptionLabel
        ? [{ value: "", label: emptyOptionLabel }, ...options]
        : options,
    [emptyOptionLabel, options],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return allOptions;
    return allOptions.filter((option) =>
      `${option.label} ${option.keywords ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allOptions, normalizedQuery]);

  const selected = allOptions.find((option) => option.value === value);
  const selectedIndex = filtered.findIndex((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Tutup saat halaman/induk dialog di-scroll, tapi jangan saat daftar opsi
    // sendiri yang di-scroll.
    const close = (event: Event) => {
      const target = event.target as Node | null;
      if (target && panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !anchor || !panelRef.current) return;

    const panelHeight = panelRef.current.getBoundingClientRect().height;
    const spaceBelow = window.innerHeight - anchor.bottom - 8;
    const top =
      panelHeight > spaceBelow && anchor.top - panelHeight - 4 > 8
        ? anchor.top - panelHeight - 4
        : anchor.bottom + 4;

    setPosition({
      top,
      left: Math.max(
        8,
        Math.min(anchor.left, window.innerWidth - anchor.width - 8),
      ),
    });
  }, [open, anchor, filtered.length]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function openPanel() {
    if (disabled) return;
    const element = triggerRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setAnchor({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
    setPosition(null);
    setQuery("");
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setHost(element.closest("dialog") ?? document.body);
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function select(option: SearchableOption) {
    onValueChange(option.value);
    closePanel();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0 ? 0 : (index + 1) % filtered.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0
          ? 0
          : (index - 1 + filtered.length) % filtered.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) select(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-surface pr-2.5 pl-2.5 text-left text-sm",
          "transition-colors hover:border-muted/50",
          "focus-visible:border-brand-600 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:bg-panel disabled:opacity-60",
          invalid ? "border-danger" : "border-border-strong",
        )}
      >
        <span className={cn("truncate", selected ? "text-ink" : "text-subtle")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-subtle" />
      </button>

      {open && anchor && host
        ? createPortal(
            <div
              ref={panelRef}
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                width: anchor.width,
                visibility: position ? "visible" : "hidden",
              }}
              className="fixed z-50 flex max-h-72 flex-col rounded-md border border-border bg-surface shadow-lg"
            >
              <div className="border-b border-border p-1.5">
                <div className="relative">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    autoComplete="off"
                    className="h-8 w-full rounded-sm border border-border-strong bg-surface pr-2 pl-8 text-sm text-ink placeholder:text-subtle focus-visible:border-brand-600 focus-visible:outline-none"
                  />
                </div>
              </div>

              <ul
                id={listboxId}
                role="listbox"
                className="scrollbar-thin overflow-y-auto p-1"
              >
                {filtered.length === 0 ? (
                  <li className="px-2 py-2 text-xs text-subtle">
                    Tidak ada hasil.
                  </li>
                ) : (
                  filtered.map((option, index) => {
                    const isSelected = option.value === value;
                    return (
                      <li key={option.value || "__empty"}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={-1}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => select(option)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                            index === activeIndex
                              ? "bg-canvas text-ink"
                              : "text-ink",
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                          {isSelected ? (
                            <Check aria-hidden className="size-3.5 shrink-0" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            host,
          )
        : null}
    </div>
  );
}
