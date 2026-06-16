import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import type { Cell } from "@tanstack/react-table";
import { Copy, Edit, Trash2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Product, TableContextMenuProps } from "types";
import { hasPermission } from "utils/permissions";

export function ProductTableContextMenu({
  cell: c,
  className,
  children,
  title,
}: TableContextMenuProps<Product>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { businessMember, removeProduct, isRemovingProduct } =
    useOrganisation();

  const cell = c as Cell<Product, unknown>;
  const val = cell.getValue() as string | number | undefined;

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleDeleteProduct = () => {
    removeProduct(cell.row.original.id, {
      onSuccess: (res) => {
        if (res.success) setDeleteOpen(false);
      },
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        title={title}
        className={cn(
          "flex h-full w-full max-w-xs items-center justify-start gap-2 px-4",
          className,
        )}
      >
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem
            className="text-xs px-1.5 py-1"
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
            className="text-xs px-1.5 py-1"
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
        {hasPermission(businessMember?.role, "products:crud") && (
          <>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                className="text-xs px-1.5 py-1"
                onClick={() => setEditOpen(true)}
              >
                Edit
                <ContextMenuShortcut>
                  <Edit className="size-3" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                className="text-xs px-1.5 py-1"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
                <ContextMenuShortcut>
                  <Trash2 className="size-3 text-destructive" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
          </>
        )}
      </ContextMenuContent>

      <EditProductDrawer
        data={cell.row.original}
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
              This will permanently remove this product from your catalog.
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
              }}
            >
              {isRemovingProduct && <Spinner className="size-4" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContextMenu>
  );
}
