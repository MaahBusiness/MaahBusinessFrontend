import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/utils/mode-toggle";
import { GalleryVerticalEnd, SlashIcon } from "lucide-react";
import { Outlet, Link } from "react-router";
import { SITE_NAME } from "types/consts";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col [--header-height:calc(theme(spacing.12))]">
      <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b border-border h-12 flex-shrink-0 font-medium">
        <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">
                    <GalleryVerticalEnd className="size-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">{SITE_NAME}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="min-w-full !min-h-[calc(100svh-var(--header-height))]">
        <Outlet />
      </main>
    </div>
  );
}
