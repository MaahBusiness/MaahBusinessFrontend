import { useState } from "react";
import { Eye, Pencil, Trash2, Trash2Icon } from "lucide-react";
import type { Client } from "types";
import { hasPermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ClientDetailsDialog,
  EditClientDialog,
} from "@/components/clients/client-dialogs";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function ClientItemActions({
  client,
  className,
  compact,
  hideView,
}: {
  client: Client;
  className?: string;
  compact?: boolean;
  hideView?: boolean;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { businessMember, isLoading, removeClient, isRemovingClient } =
    useOrganisation();

  const canView = hasPermission(businessMember?.role, "customers:view");
  const canCrud = hasPermission(businessMember?.role, "customers:crud");
  const compactBtn = compact ? "h-7 w-7 shrink-0" : undefined;

  if (isLoading || !businessMember) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        className={cn("h-7 w-7 shrink-0", className)}
        disabled
        aria-hidden
      />
    );
  }

  const handleDeleteClient = () => {
    removeClient(client.id, {
      onSuccess: (res) => {
        if (res.success) setDeleteOpen(false);
      },
    });
  };

  if (!canView && !canCrud) return null;

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-end gap-1 pr-2",
          compact ? "flex-nowrap" : "flex-wrap gap-1.5",
          className,
        )}
      >
        {canView && !hideView && (
          <Button
            type="button"
            variant="outline"
            size={compact ? "icon-sm" : "sm"}
            className={cn(
              compactBtn,
              "gap-1.5 border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 hover:text-violet-700",
            )}
            title="View details"
            onClick={() => setViewOpen(true)}
          >
            <Eye className="size-3.5" />
            {!compact && <span className="hidden tablet:inline">View</span>}
          </Button>
        )}
        {canCrud && (
          <>
            <Button
              type="button"
              variant="outline"
              size={compact ? "icon-sm" : "sm"}
              className={cn(
                compactBtn,
                "gap-1.5 border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-700",
              )}
              title="Edit client"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" />
              {!compact && <span className="hidden tablet:inline">Edit</span>}
            </Button>
            <Button
              type="button"
              variant="outline"
              size={compact ? "icon-sm" : "sm"}
              className={cn(
                compactBtn,
                "gap-1.5 border-destructive/25 bg-destructive/5 text-destructive hover:bg-destructive/10",
              )}
              title="Delete client"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              {!compact && <span className="hidden tablet:inline">Delete</span>}
            </Button>
          </>
        )}
      </div>

      {canView && (
        <ClientDetailsDialog
          client={client}
          open={viewOpen}
          onOpenChange={setViewOpen}
        />
      )}

      {canCrud && (
        <>
          <EditClientDialog
            client={client}
            open={editOpen}
            onOpenChange={setEditOpen}
          />

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Remove {client.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove {client.name} from your customer
                  list. Existing invoices are not affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline" disabled={isRemovingClient}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isRemovingClient}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteClient();
                  }}
                >
                  {isRemovingClient && <Spinner className="size-4" />}
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
