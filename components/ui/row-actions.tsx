"use client";

import { Ellipsis, Eye, Pencil, Trash } from "lucide-react";

import { DropdownItem, DropdownMenu, DropdownSeparator } from "./dropdown";

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  label?: string;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function RowActions({
  onEdit,
  onDelete,
  onView,
  label = "Aksi baris",
  viewLabel = "Lihat Detail",
  editLabel = "Edit",
  deleteLabel = "Hapus",
}: RowActionsProps) {
  return (
    <DropdownMenu
      portal
      className="flex justify-end"
      trigger={
        <button
          type="button"
          aria-label={label}
          className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <Ellipsis className="size-4" />
        </button>
      }
    >
      {onView ? (
        <DropdownItem icon={<Eye className="size-3.5" />} onClick={onView}>
          {viewLabel}
        </DropdownItem>
      ) : null}
      {onEdit ? (
        <DropdownItem icon={<Pencil className="size-3.5" />} onClick={onEdit}>
          {editLabel}
        </DropdownItem>
      ) : null}
      {onDelete ? (
        <>
          <DropdownSeparator />
          <DropdownItem
            icon={<Trash className="size-3.5" />}
            onClick={onDelete}
            className="text-danger hover:bg-danger-soft"
          >
            {deleteLabel}
          </DropdownItem>
        </>
      ) : null}
    </DropdownMenu>
  );
}
