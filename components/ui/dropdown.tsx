"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  /**
   * Render the menu in a portal with fixed positioning. Use inside scroll or
   * overflow containers (e.g. table rows) where an absolutely positioned menu
   * would be clipped.
   */
  portal?: boolean;
}

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  className,
  portal = false,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !portal) return;

    const menu = menuRef.current;
    const triggerElement = triggerRef.current;
    if (!menu || !triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    let top = rect.bottom + 4;
    if (top + menuRect.height > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuRect.height - 4);
    }
    let left = align === "end" ? rect.right - menuRect.width : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = "visible";
  }, [open, portal, align]);

  useEffect(() => {
    if (!open || !portal) return;

    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, portal]);

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      onClick={() => setOpen(false)}
      style={portal ? { position: "fixed", top: 0, left: 0, visibility: "hidden" } : undefined}
      className={cn(
        "z-50 min-w-44 rounded-md border border-border bg-surface p-1 shadow-lg",
        !portal && "absolute mt-1",
        !portal && (align === "end" ? "right-0" : "left-0"),
      )}
    >
      {children}
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        ref={triggerRef}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open
        ? portal
          ? createPortal(menu, document.body)
          : menu
        : null}
    </div>
  );
}

interface DropdownItemProps extends React.ComponentProps<"button"> {
  icon?: React.ReactNode;
}

export function DropdownItem({
  icon,
  className,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-ink transition-colors",
        "hover:bg-canvas disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {icon ? <span className="text-muted">{icon}</span> : null}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />;
}
