import { useLocation } from "react-router";
import { UserNav } from "@/components/user-nav";
import TeamSwitcher from "@/components/team-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";

function useOrgIdFromPath(): string | null {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/dashboard\/org\/([^/]+)/);
  return match?.[1] ?? null;
}

export function SiteHeader() {
  const orgId = useOrgIdFromPath();

  return (
    <header className="sticky top-0 z-50 flex w-full shrink-0 flex-col items-center border-b border-violet-500/10 bg-background/80 text-sm font-medium backdrop-blur-md">
      <div className="flex h-[--header-height] w-full items-center gap-3 px-3 sm:px-4">
        <SidebarTrigger className="size-8 shrink-0 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400" />
        <div className="min-h-8 min-w-0 flex-1 overflow-x-auto">
          {orgId ? <TeamSwitcher currentId={orgId} /> : null}
        </div>
        <UserNav />
      </div>
    </header>
  );
}
