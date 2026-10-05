import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center border-b border-border bg-brand-900 px-3.5">
        <Logo />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute bg-[0%_100%] inset-0 opacity-9"
          style={{
            backgroundImage: "url('/images/ismaya-farm-front.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100%",
          }}
        />

        <div className="absolute inset-0" />

        <div className="scrollbar-thin relative h-full overflow-y-auto px-3.5 py-4">
          <SidebarNav onNavigate={onNavigate} />
        </div>
      </div>

      <div className="relative shrink-0 border-t border-border bg-brand-900 p-2.5">
        <div
          className="absolute inset-0 bg-cover bg-[120%_0%] opacity-20 bg-no-repeat"
          style={{
            backgroundImage: "url('/images/domba.png')",
            backgroundSize: "60%"
          }}
        />

        <div className="absolute inset-0 bg-bg-brand-900" />

        <div className="relative">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
