import { type Row } from "@tanstack/react-table";
import {
  Copy,
  Edit,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  Trash2Icon,
} from "lucide-react";

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
import { redirect } from "react-router";
import type { Client, Invoice } from "types";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { hasPermission } from "utils/permissions";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/useClipboard";
import { ClientEditDeleteDialogs } from "@/components/clients/client-dialogs";

interface ClientTableRowActionsProps {
  row: Row<Client>;
}

export function ClientTableRowActions({ row }: ClientTableRowActionsProps) {
  const { businessMember } = useOrganisation();

  if (!businessMember) throw redirect("/dashboard/organisations/");

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(row.original));
  };

  // const handleDeleteProduct = () => {
  //   removeProduct(row.original.id);
  // };

  return (
    <Drawer direction="right">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size={"icon-sm"}
              className="flex h-7 w-6 rounded-sm p-0 data-[state=open]:bg-muted mr-4"
            >
              <MoreHorizontal className="size-3" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          {/* Dropdown Content */}
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy row
                <DropdownMenuShortcut>
                  <Copy className="size-3" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {hasPermission(businessMember?.role, "customers:crud") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DrawerTrigger asChild>
                    <DropdownMenuItem className="text-xs px-1.5 py-1">
                      Edit row
                      <DropdownMenuShortcut>
                        <Edit className="size-3" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DrawerTrigger>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-xs px-1.5 py-1"
                      variant="destructive"
                    >
                      Delete row
                      <DropdownMenuShortcut>
                        <Trash2 className="size-3 text-destructive" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ClientEditDeleteDialogs row={row} />
      </AlertDialog>
    </Drawer>
  );
}
