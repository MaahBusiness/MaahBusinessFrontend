import { AppSidebar } from "@/components/app-sidebar";
import { useOrganisation } from "@/hooks/use-organisation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navigate, Outlet } from "react-router";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { businessMember } = useOrganisation();

  if (businessMember?.is_active === false) {
    return <Navigate to="/dashboard/organisations" replace />;
  }

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
