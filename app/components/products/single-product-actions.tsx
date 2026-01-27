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

interface SingleProductActionsProps {
  data: Product;
}

export function SingleProductActions({ data }: SingleProductActionsProps) {
  const { removeProduct, isRemovingProduct, businessMember } =
    useOrganisation();

  if (!businessMember) {
    redirect("/dashboard/organisations/");
  }

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(data));
  };

  const handleDeleteProduct = () => {
    removeProduct(data.id);
  };

  return (
    <Drawer direction="right">
      <AlertDialog>
        <DropdownMenu>
          <div className="flex items-center gap-2">
            {hasPermission(businessMember?.role, "products:crud") && (
              <DrawerTrigger asChild>
                <Button size="sm" variant={"outline"}>
                  <Edit className="size-3" />
                  Update product
                </Button>
              </DrawerTrigger>
            )}

            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={"icon-sm"}
                className="flex w-7 rounded-sm data-[state=open]:bg-muted"
              >
                <MoreVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
          </div>

          {/* Dropdown Content */}
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy product
                <DropdownMenuShortcut>
                  <Copy className="size-3" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {hasPermission(businessMember?.role, "products:crud") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-xs px-1.5 py-1"
                      variant="destructive"
                    >
                      Delete product
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

        <EditProductDrawer data={data} />

        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {data.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {data.name} from your products. Are
              you sure you want to continue?
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
