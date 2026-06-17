import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ORG_EMPTY_HINTS } from "@/lib/org-navigation";
import { filterByRole } from "@/lib/dashboard-widgets";
import type { Role } from "types";

export function DashboardEmptyHint({
  orgId,
  role,
}: {
  orgId: string;
  role?: Role;
}) {
  const actions = filterByRole(role, ORG_EMPTY_HINTS);

  return (
    <Card className="border-dashed border-violet-500/30 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-emerald-500/5">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/15">
          <Sparkles className="size-7 text-violet-600" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-semibold">No activity on this period yet</p>
          <p className="text-sm text-muted-foreground">
            {actions.length
              ? "Start with one of the actions below to populate your dashboard."
              : "Activity will appear here once your team records sales or stock updates."}
          </p>
        </div>
        {actions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {actions.map((action) =>
              action.variant === "primary" ? (
                <Link key={action.id} to={action.href(orgId)}>
                  <Button className="auth-submit-btn gap-2 border-0">
                    <action.icon className="size-4" />
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Link key={action.id} to={action.href(orgId)}>
                  <Button variant="outline" className="gap-2">
                    <action.icon className="size-4" />
                    {action.label}
                  </Button>
                </Link>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
