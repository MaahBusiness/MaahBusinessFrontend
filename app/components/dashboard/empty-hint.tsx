import { Link } from "react-router";
import { Package, Plus, Receipt, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardEmptyHint({ orgId }: { orgId: string }) {
  return (
    <Card className="border-dashed border-violet-500/30 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-emerald-500/5">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/15">
          <Sparkles className="size-7 text-violet-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-semibold">No activity on this period yet</p>
          <p className="text-sm text-muted-foreground">
            Record your first sale or add products to see charts and KPIs come
            alive.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to={`/dashboard/org/${orgId}/invoices`}>
            <Button className="auth-submit-btn gap-2 border-0">
              <Receipt className="size-4" />
              Create sale
            </Button>
          </Link>
          <Link to={`/dashboard/org/${orgId}/products`}>
            <Button variant="outline" className="gap-2">
              <Package className="size-4" />
              Add product
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
