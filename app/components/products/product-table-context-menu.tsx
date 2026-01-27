import { EditProductDrawer } from "@/components/products/product-edit-row-drawer";
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
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import { visibles } from "@/routes/dashboard/products/data";
import type { Cell, Row } from "@tanstack/react-table";
import { Copy, Edit, Trash2, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "types";
import { hasPermission } from "utils/permissions";

interface DataTableContextMenuProps<TData, TValue> {
  cell: Cell<Product, TValue>;
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

export function ProductTableContextMenu<TData, TValue>({
  cell,
  className,
  children,
  title,
}: DataTableContextMenuProps<TData, TValue>) {
  const { businessMember, removeProduct, isRemovingProduct } =
    useOrganisation();

  const val = cell.getValue() as string | number | undefined;
  const label = visibles?.find((o) => o.value === cell.column.id)?.label;

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleCopyCell = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(`${val}`);
  };
  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(cell.row.original));
  };

  const handleDeleteProduct = () => {
    removeProduct(cell.row.original.id);
  };

  return (
    <ContextMenu>
      <Drawer direction="right">
        <AlertDialog>
          <ContextMenuTrigger
            title={title}
            className={cn(
              "flex h-full w-full max-w-xs items-center justify-start gap-2 px-4",
              className,
            )}
          >
            {children}
          </ContextMenuTrigger>

          {/* Context Menu */}
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyCell}
              >
                Copy cell
                <ContextMenuShortcut>
                  <Copy className="size-3" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy row
                <ContextMenuShortcut>
                  <Copy className="size-3" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
            {hasPermission(businessMember?.role, "products:crud") && (
              <>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <DrawerTrigger asChild>
                    <ContextMenuItem className="text-xs px-1.5 py-1">
                      Edit row
                      <ContextMenuShortcut>
                        <Edit className="size-3" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                  </DrawerTrigger>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuItem
                    className="text-xs px-1.5 py-1"
                    variant="destructive"
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

          {/* Drawer Content */}
          <EditProductDrawer data={cell.row.original} />

          {/* Alert Dialog */}
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                Remove {cell.row.original.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {cell.row.original.name} from your
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
    </ContextMenu>
  );
}
