import { type Row } from "@tanstack/react-table";
import { Copy, Edit, MoreVertical, Trash2, Trash2Icon } from "lucide-react";

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
import type { Product } from "types";
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
import { Spinner } from "@/components/ui/spinner";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { EditProductDrawer } from "@/components/products/product-edit-row-drawer";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/useClipboard";

interface ProductTableRowActionsProps {
  row: Row<Product>;
}

export function ProductTableRowActions({ row }: ProductTableRowActionsProps) {
  const { removeProduct, isRemovingProduct, businessMember } =
    useOrganisation();

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

  const handleDeleteProduct = () => {
    removeProduct(row.original.id);
  };

  return (
    <Drawer direction="right">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={"icon-sm"}
              className="flex h-7 w-6 rounded-sm p-0 data-[state=open]:bg-muted mr-4"
            >
              <MoreVertical className="size-3" />
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
            {hasPermission(businessMember?.role, "products:crud") && (
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

        <EditProductDrawer data={row.original} />

        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {row.original.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {row.original.name} from your
              products. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemovingProduct}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct();
                // return true;
              }}
            >
              {isRemovingProduct && <Spinner />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
