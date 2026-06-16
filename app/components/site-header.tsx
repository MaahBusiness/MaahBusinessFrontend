import { SearchForm } from "@/components/search-form";
import { UserNav } from "@/components/user-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowUpRightIcon,
  GalleryVerticalEnd,
  Menu,
  SlashIcon,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MobileDrawerMenu } from "@/components/app-sidebar";
import { SITE_NAME } from "types/consts";

export function SiteHeader() {
  const { id } = useParams();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background sticky top-0 z-50 flex flex-col w-full items-center flex-shrink-0 font-medium text-sm">
      {/* Main header */}
      <div className="hidden tablet:flex h-[--header-height] w-full items-center justify-between gap-2 px-4 border-b">
        <Breadcrumbs />
        <div className="ml-auto flex items-center space-x-4">
          {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
          <UserNav />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="tablet:hidden flex h-[--mobile-header-height] w-full items-center justify-between gap-2 px-4 border-b">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="organisations">
                  <GalleryVerticalEnd className="size-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="organisations">{SITE_NAME}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center space-x-4">
          {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
          <UserNav />
        </div>
      </div>

      {/* Mobile breadcrumbs */}
      <div className="flex tablet:hidden h-[--header-height] w-full items-center border-b ">
        {!!id && (
          // <Button
          //   size="icon"
          //   variant="outline"
          //   className="rounded-none border-0 h-full px-6 border-r"
          // >
          //   <Menu />
          // </Button>

          <MobileDrawerMenu />
        )}

        <div className="flex items-center justify-between h-full pr-3 flex-1 overflow-x-auto gap-x-8 pl-4">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
}
