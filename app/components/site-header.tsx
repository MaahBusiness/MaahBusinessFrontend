import { UserNav } from "@/components/user-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex w-full shrink-0 flex-col items-center border-b border-violet-500/10 bg-background/80 text-sm font-medium backdrop-blur-md">
      <div className="flex h-[--header-height] w-full items-center gap-3 px-3 sm:px-4">
        <SidebarTrigger className="size-8 shrink-0 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400" />
        <div className="min-w-0 flex-1 overflow-x-auto">
          <Breadcrumbs />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
