import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-3.5">
        <Logo />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3.5 py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 border-t border-border p-2.5">
        <UserMenu />
      </div>
    </div>
  );
}
