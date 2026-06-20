import DataTableSkeleton from "@/components/data-table-skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { inventoryApi } from "@/lib/api/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Archive, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrgPageShell } from "@/components/layout/org-page-shell";
import { hasPermission } from "utils/permissions";
import { toast } from "sonner";

export default function InventoryPage() {
  const { organisation } = useOrganisation();
  const { businessMember } = useOrganisation();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const businessId = organisation?.data?.id;
  const canManageStock = hasPermission(businessMember?.role, "stock:movements");

  const lowStock = useQuery({
    queryKey: ["inventory", businessId, "low-stock"],
    queryFn: async () =>
      inventoryApi.getLowStockProducts(accessToken!, businessId!),
    enabled: !!businessId && !!accessToken && canManageStock,
  });
  const expired = useQuery({
    queryKey: ["inventory", businessId, "expired"],
    queryFn: async () =>
      inventoryApi.getExpiredProducts(accessToken!, businessId!),
    enabled: !!businessId && !!accessToken && canManageStock,
  });

  const checkLowStock = useMutation({
    mutationFn: () =>
      inventoryApi.checkLowStock(accessToken!, businessId!),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message ?? "Low stock check completed.");
        queryClient.invalidateQueries({
          queryKey: ["inventory", businessId, "low-stock"],
        });
      } else toast.error(res.message ?? "Low stock check failed.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const checkExpired = useMutation({
    mutationFn: () =>
      inventoryApi.checkExpired(accessToken!, businessId!),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message ?? "Expired products check completed.");
        queryClient.invalidateQueries({
          queryKey: ["inventory", businessId, "expired"],
        });
      } else toast.error(res.message ?? "Expired products check failed.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!canManageStock) {
    return (
      <OrgPageShell orbs={["orange", "blue"]}>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view inventory alerts.
        </p>
      </OrgPageShell>
    );
  }

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
            <p className="text-2xl font-semibold">
              {expired.data?.data?.length ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Require removal/check
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={checkLowStock.isPending || !businessId}
          onClick={() => checkLowStock.mutate()}
        >
          {checkLowStock.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          Run low stock check
        </Button>
        <Button
          variant="secondary"
          disabled={checkExpired.isPending || !businessId}
          onClick={() => checkExpired.mutate()}
        >
          {checkExpired.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          Run expired check
        </Button>
      </div>
    </OrgPageShell>
  );
}
