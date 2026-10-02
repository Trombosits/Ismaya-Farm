"use client";

import { Eye, Pencil, Trash } from "lucide-react";

import { cn } from "@/lib/cn";

interface RowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  label?: string;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

const buttonBase =
  "grid size-7 place-items-center rounded-md border transition-colors hover:brightness-95 disabled:pointer-events-none disabled:opacity-40";

/**
 * Icon-only row actions. Each action sits in a small rounded box with its own
 * restrained color. Text is kept only as a tooltip / accessible label.
 */
export function RowActions({
  onView,
  onEdit,
  onDelete,
  label = "Aksi baris",
  viewLabel = "Detail",
  editLabel = "Edit",
  deleteLabel = "Hapus",
  className,
}: RowActionsProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center justify-end gap-1 whitespace-nowrap",
        className,
      )}
    >
      {onView ? (
        <button
          type="button"
          title={viewLabel}
          aria-label={viewLabel}
          onClick={onView}
          className={cn(
            buttonBase,
            "border-info/20 bg-info-soft text-info hover:border-info/40",
          )}
        >
          <Eye aria-hidden className="size-3.5" />
        </button>
      ) : null}
      {onEdit ? (
        <button
          type="button"
          title={editLabel}
          aria-label={editLabel}
          onClick={onEdit}
          className={cn(
            buttonBase,
            "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300",
          )}
        >
          <Pencil aria-hidden className="size-3.5" />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          title={deleteLabel}
          aria-label={deleteLabel}
          onClick={onDelete}
          className={cn(
            buttonBase,
            "border-danger/20 bg-danger-soft text-danger hover:border-danger/40",
          )}
        >
          <Trash aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
