import { useState } from "react";
import {
  ClientDetailsDialog,
  EditClientDialog,
} from "@/components/clients/client-dialogs";
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import type { Cell } from "@tanstack/react-table";
import { Copy, Edit, Eye, Trash2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Client, TableContextMenuProps } from "types";
import { hasPermission } from "utils/permissions";

export function ClientTableContextMenu({
  cell: c,
  className,
  children,
  title,
}: TableContextMenuProps<Client>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const { businessMember, removeClient, isRemovingClient } = useOrganisation();

  const cell = c as Cell<Client, unknown>;
  const val = cell.getValue() as string | number | undefined;

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleDeleteClient = () => {
    removeClient(cell.row.original.id, {
      onSuccess: (res) => {
        if (res.success) setDeleteOpen(false);
      },
    });
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (!hasPermission(businessMember?.role, "customers:view")) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [role='checkbox'], input, label")) return;
    setViewOpen(true);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        title={title}
        className={cn(
          "flex h-full w-full max-w-xs cursor-pointer items-center justify-start gap-2 px-4",
          className,
        )}
        onClick={handleRowClick}
      >
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent>
        {hasPermission(businessMember?.role, "customers:view") && (
          <ContextMenuGroup>
            <ContextMenuItem
              className="px-1.5 py-1 text-xs"
              onClick={() => setViewOpen(true)}
            >
              View details
              <ContextMenuShortcut>
                <Eye className="size-3" />
              </ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
        )}
        <ContextMenuGroup>
          <ContextMenuItem
            className="px-1.5 py-1 text-xs"
            onClick={() => {
              if (!clipboard.isCopying) clipboard.copy(`${val}`);
            }}
          >
            Copy cell
            <ContextMenuShortcut>
              <Copy className="size-3" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            className="px-1.5 py-1 text-xs"
            onClick={() => {
              if (!clipboard.isCopying)
                clipboard.copy(JSON.stringify(cell.row.original));
            }}
          >
            Copy row
            <ContextMenuShortcut>
              <Copy className="size-3" />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        {hasPermission(businessMember?.role, "customers:crud") && (
          <>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                className="px-1.5 py-1 text-xs"
                onClick={() => setEditOpen(true)}
              >
                Edit row
                <ContextMenuShortcut>
                  <Edit className="size-3" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                className="px-1.5 py-1 text-xs"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete row
                <ContextMenuShortcut>
                  <Trash2 className="size-3 text-destructive" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
          </>
        )}
      </ContextMenuContent>

      {hasPermission(businessMember?.role, "customers:view") && (
        <ClientDetailsDialog
          client={cell.row.original}
          open={viewOpen}
          onOpenChange={setViewOpen}
        />
      )}

      <EditClientDialog
        client={cell.row.original}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {cell.row.original.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this customer from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
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
    </ContextMenu>
  );
}
