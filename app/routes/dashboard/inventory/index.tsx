import DataTableSkeleton from "@/components/data-table-skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { inventoryApi } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrgPageShell } from "@/components/layout/org-page-shell";

export default function InventoryPage() {
  const { organisation } = useOrganisation();
  const { accessToken } = useAuth();
  const businessId = organisation?.data?.id;

  const lowStock = useQuery({
    queryKey: ["inventory", businessId, "low-stock"],
    queryFn: async () =>
      inventoryApi.getLowStockProducts(accessToken!, businessId!),
    enabled: !!businessId && !!accessToken,
  });
  const expired = useQuery({
    queryKey: ["inventory", businessId, "expired"],
    queryFn: async () =>
      inventoryApi.getExpiredProducts(accessToken!, businessId!),
    enabled: !!businessId && !!accessToken,
  });

  if (lowStock.isLoading || expired.isLoading) {
    return <DataTableSkeleton />;
  }

  return (
    <OrgPageShell orbs={["orange", "blue"]}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Inventory alerts</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {lowStock.data?.data?.length ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Products below threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Expired Products</CardTitle>
            <Archive className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{expired.data?.data?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Require removal/check</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button disabled>Check low stock</Button>
        <Button variant="secondary" disabled>
          Check expired
        </Button>
      </div>
    </OrgPageShell>
  );
}
