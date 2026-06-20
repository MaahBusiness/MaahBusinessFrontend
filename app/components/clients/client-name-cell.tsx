import { useState } from "react";
import type { Client } from "types";
import { hasPermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { ClientDetailsDialog } from "@/components/clients/client-dialogs";
import { cn } from "@/lib/utils";

export function ClientNameCell({
  client,
  className,
}: {
  client: Client;
  className?: string;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const { businessMember } = useOrganisation();
  const canView = hasPermission(businessMember?.role, "customers:view");

  const content = (
    <>
      <Avatar className="size-5">
        <BoringFallback name={client.name} />
      </Avatar>
      <span className="truncate">{client.name}</span>
    </>
  );

  if (!canView) {
    return (
      <div className={cn("flex items-center gap-2", className)}>{content}</div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "flex w-full min-w-0 items-center gap-2 text-left hover:underline",
          className,
        )}
        onClick={() => setViewOpen(true)}
      >
        {content}
      </button>

      <ClientDetailsDialog
        client={client}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
    </>
  );
}
