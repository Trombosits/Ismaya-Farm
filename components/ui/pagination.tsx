"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageItems(current: number, count: number): (number | "ellipsis")[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(count - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < count - 1) items.push("ellipsis");
  items.push(count);

  return items;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const items = getPageItems(page, Math.max(pageCount, 1));

  return (
    <div
      className={cn(
        "flex flex-col-reverse items-center justify-between gap-3 sm:flex-row",
        className,
      )}
    >
      <p className="text-xs text-muted">
        Menampilkan{" "}
        <span className="font-medium text-ink">
          {start}–{end}
        </span>{" "}
        dari <span className="font-medium text-ink">{total}</span>
      </p>

      <nav
        aria-label="Navigasi halaman"
        className="flex items-center gap-1.5"
      >
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft aria-hidden className="size-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <ul className="hidden items-center gap-1 sm:flex">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <li
                key={`ellipsis-${index}`}
                aria-hidden
                className="px-1 text-xs text-subtle"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <Button
                  variant={item === page ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(item)}
                  aria-label={`Halaman ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className="w-8"
                >
                  {item}
                </Button>
              </li>
            ),
          )}
        </ul>

        <span className="text-xs text-muted sm:hidden">
          Hal. {page} / {Math.max(pageCount, 1)}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight aria-hidden className="size-3.5" />
        </Button>
      </nav>
    </div>
  );
}
