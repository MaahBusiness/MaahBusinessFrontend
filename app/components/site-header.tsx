import { SearchForm } from "@/components/search-form";
import { UserNav } from "@/components/user-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b border-border h-12 flex-shrink-0 font-medium text-sm">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        <Breadcrumbs />
        <div className="ml-auto flex items-center space-x-4">
          <SearchForm className="w-full sm:ml-auto sm:w-auto" />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
