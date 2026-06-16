import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Category, Subcategory } from "types";
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
import { CategoryEditDialog } from "@/components/categories/category-edit-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function CategoryItemActions({
  data,
  className,
  compact,
}: {
  data: Category | Subcategory;
  className?: string;
  compact?: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { businessMember, removeCategory, isRemovingCategory } =
    useOrganisation();

  const canEdit = hasPermission(businessMember?.role, "products:crud");
  const isSub = "category_id" in data;

  if (!canEdit) return null;

  const handleDelete = () => {
    removeCategory(
      { id: data.id, sub: isSub },
      {
        onSuccess: (res) => {
          if (res.success) setDeleteOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className={cn("flex items-center gap-1", className)}>
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "sm"}
          className={cn("gap-1.5", !compact && "min-w-0")}
          onClick={() => setEditOpen(true)}
          aria-label={isSub ? "Edit subcategory" : "Edit category"}
        >
          <Pencil className="size-3.5" />
          {!compact && <span className="hidden sm:inline">Edit</span>}
        </Button>
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "sm"}
          className={cn(
            "gap-1.5 text-destructive hover:text-destructive",
            !compact && "min-w-0",
          )}
          onClick={() => setDeleteOpen(true)}
          aria-label={isSub ? "Delete subcategory" : "Delete category"}
        >
          <Trash2 className="size-3.5" />
          {!compact && <span className="hidden sm:inline">Delete</span>}
        </Button>
      </div>

      <CategoryEditDialog
        data={data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="mx-4 w-[calc(100%-2rem)] max-w-sm sm:mx-auto sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {isSub ? "subcategory" : "category"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{data.name}</strong> will be permanently removed.
              {isSub
                ? " Products linked to this subcategory may be affected."
                : " All subcategories and linked products may be affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isRemovingCategory}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemovingCategory}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isRemovingCategory && <Spinner className="size-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
