import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "types";
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditProductDrawer } from "@/components/products/product-edit-row-drawer";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useParams } from "react-router";

export function ProductItemActions({
  product,
  className,
  compact,
  hideView,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
  /** Hide View — use on the product detail page */
  hideView?: boolean;
}) {
  const { id: orgId } = useParams();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { businessMember, removeProduct, isRemovingProduct } = useOrganisation();

  const canEdit = hasPermission(businessMember?.role, "products:crud");
  const compactBtn = compact ? "size-7 shrink-0" : undefined;

  if (!canEdit) {
    return (
      <Button
        asChild
        variant="outline"
        size={compact ? "icon-sm" : "sm"}
        className={cn(compactBtn, className)}
      >
        <Link to={`/dashboard/org/${orgId}/products/${product.id}`}>
          <Eye className="size-3.5" />
          {!compact && <span className="ml-1.5 hidden tablet:inline">View</span>}
        </Link>
      </Button>
    );
  }

  return (
    <>
      <div className={cn("flex w-full items-center gap-1 tablet:w-auto", compact ? "flex-nowrap" : "flex-wrap gap-1.5", className)}>
        {!hideView && (
          <Button
            asChild
            variant="outline"
            size={compact ? "icon-sm" : "sm"}
            className={cn(
              compactBtn,
              "gap-1.5 border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 hover:text-violet-700",
            )}
          >
            <Link to={`/dashboard/org/${orgId}/products/${product.id}`}>
              <Eye className="size-3.5" />
              {!compact && <span className="hidden tablet:inline">View</span>}
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "sm"}
          className={cn(
            compactBtn,
            "gap-1.5 border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-700",
          )}
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
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-3.5" />
          {!compact && <span className="hidden tablet:inline">Delete</span>}
        </Button>
      </div>

      <EditProductDrawer
        data={product}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="mx-4 w-[calc(100%-2rem)] max-w-sm sm:mx-auto sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{product.name}</strong> will be permanently removed from
              your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isRemovingProduct}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemovingProduct}
              onClick={(e) => {
                e.preventDefault();
                removeProduct(product.id, {
                  onSuccess: (res) => {
                    if (res.success) setDeleteOpen(false);
                  },
                });
              }}
            >
              {isRemovingProduct && <Spinner className="size-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
