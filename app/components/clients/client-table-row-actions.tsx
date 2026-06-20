import { useState } from "react";
import { type Row } from "@tanstack/react-table";
import { Copy, Edit, Eye, MoreHorizontal, Trash2, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Client } from "types";
import { useOrganisation } from "@/hooks/use-organisation";
import {
  AlertDialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

import { hasPermission } from "utils/permissions";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/useClipboard";
import {
  ClientDetailsDrawer,
  EditClientDrawer,
} from "@/components/clients/client-dialogs";
import { Spinner } from "@/components/ui/spinner";

interface ClientTableRowActionsProps {
  row: Row<Client>;
}

export function ClientTableRowActions({ row }: ClientTableRowActionsProps) {
  const { businessMember, isLoading, removeClient, isRemovingClient } =
    useOrganisation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading || !businessMember) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        className="mr-4 h-7 w-6 rounded-sm p-0"
        disabled
        aria-hidden
      />
    );
  }

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(row.original));
  };

  const handleDeleteClient = () => {
    removeClient(row.original.id, {
      onSuccess: (res) => {
        if (res.success) setDeleteOpen(false);
      },
    });
  };

  const canCrud = hasPermission(businessMember.role, "customers:crud");

  return (
    <>
      <div className="flex min-w-[116px] items-center justify-end gap-1 pr-2">
        <ClientDetailsDrawer
          client={row.original}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
            >
              <Eye className="size-3.5" />
              View
            </Button>
          }
        />

        {canCrud && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-7 w-7 shrink-0"
            title="Edit customer"
            onClick={() => setEditOpen(true)}
          >
            <Edit className="size-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="sr-only">Edit customer</span>
          </Button>
        )}

        {canCrud && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-7 w-7 shrink-0"
            title="Delete customer"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5 text-destructive" />
            <span className="sr-only">Delete customer</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="flex h-7 w-6 rounded-sm p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-3" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="px-1.5 py-1 text-xs"
                onClick={handleCopyRow}
              >
                Copy row
                <DropdownMenuShortcut>
                  <Copy className="size-3" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {canCrud && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="px-1.5 py-1 text-xs"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit row
                    <DropdownMenuShortcut>
                      <Edit className="size-3" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="px-1.5 py-1 text-xs"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete row
                    <DropdownMenuShortcut>
                      <Trash2 className="size-3 text-destructive" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditClientDrawer
        client={row.original}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {row.original.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {row.original.name} from your
              customer list. Existing invoices are not affected.
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
  );
}
