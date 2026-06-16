import { Link } from "react-router";
import { BarChart3, Package, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardLimitedAccess({ orgId }: { orgId: string }) {
  return (
    <div className="dashboard-page relative flex min-h-full items-center justify-center p-8">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />
      <Card className="relative z-10 max-w-lg border-violet-500/20 bg-card/90 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle>Owner analytics</CardTitle>
          <CardDescription>
            The full dashboard with charts and financial insights is available
            to business owners only. Use the modules below for your daily work.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Link to={`/dashboard/org/${orgId}/invoices`}>
            <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
              <Receipt className="size-5 text-violet-600" />
              Sales
            </Button>
          </Link>
          <Link to={`/dashboard/org/${orgId}/products`}>
            <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
              <Package className="size-5 text-blue-600" />
              Products
            </Button>
          </Link>
          <Link to={`/dashboard/org/${orgId}/inventory`}>
            <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
              <BarChart3 className="size-5 text-emerald-600" />
              Inventory
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
