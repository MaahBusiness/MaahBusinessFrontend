/* eslint-disable react/no-unescaped-entities */
import EditDialog from "@/components/categories/edit-dialog";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import type { Cell } from "@tanstack/react-table";
import { Copy, Edit, Trash2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Category, Subcategory, TableContextMenuProps } from "types";
import { hasPermission } from "utils/permissions";

export function CatTableContextMenu({
  cell: c,
  className,
  children,
  title,
}: TableContextMenuProps<Category | Subcategory>) {
  const { businessMember, removeCategory, isRemovingCategory } =
    useOrganisation();

  const cell = c as Cell<Category | Subcategory, any>;

  const val = cell.getValue() as string | number | undefined;

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

  const handleDeleteCategory = () => {
    removeCategory({
      id: cell.row.original.id,
      sub: "category_id" in cell.row.original,
    });
  };

  return (
    <ContextMenu>
      <Dialog>
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
                  <DialogTrigger asChild>
                    <ContextMenuItem className="text-xs px-1.5 py-1">
                      Edit row
                      <ContextMenuShortcut>
                        <Edit className="size-3" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                  </DialogTrigger>
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
          <EditDialog data={cell.row.original} />

          {/* Alert Dialog */}
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                Remove '{cell.row.original.name}'?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove '{cell.row.original.name}' from all
                inventory controls.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>

              <AlertDialogAction
                variant="destructive"
                disabled={isRemovingCategory}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteCategory();
                }}
                // type="button"
              >
                {isRemovingCategory && <Spinner className="size-4" />}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    </ContextMenu>
  );
}
