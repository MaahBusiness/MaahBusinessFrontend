import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function Layout({ children }: { children: React.ReactNode }) {
  // const { businessMember } = useOrganisation();

  // if (businessMember?.user?.is_active === false) redirect("");

  return (
    <div className="flex flex-col">
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <Outlet />
        </SidebarInset>
      </div>
    </div>
  );
}
