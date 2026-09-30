"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-lg rounded-lg border border-border bg-surface p-0 text-ink backdrop:bg-ink/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 id="dialog-title" className="text-sm font-semibold text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="-mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>

      {children ? <div className="px-4 py-4">{children}</div> : null}

      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-border bg-panel px-4 py-3">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
