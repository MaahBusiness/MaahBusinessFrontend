import { type Row } from "@tanstack/react-table";
import {
  Copy,
  Edit,
  Edit3,
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
import { redirect, useLocation } from "react-router";
import type { Category, Subcategory } from "types";
import { useAuth } from "@/contexts/auth-context";
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
  AlertDialogTrigger,
  AlertDialogMedia,
  // AlertDialogMedia,
} from "@/components/ui/alert-dialog";

import { hasPermission } from "utils/permissions";
import EditDialog from "@/components/categories/edit-dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";

interface DataTableRowActionsProps<TData> {
  data: Category | Subcategory;
}

export function SingleCatActions<TData>({
  data,
}: DataTableRowActionsProps<TData>) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { removeCategory, isRemovingCategory, businessMember } =
    useOrganisation();

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  if (!user)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);
  if (!businessMember) throw redirect("/dashboard/organisations/");

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(data));
  };

  const handleRemoveCategory = () => {
    removeCategory({ id: data.id, sub: "category_id" in data });
  };

  return (
    <AlertDialog>
      <Dialog>
        <DropdownMenu>
          <div className="flex items-center gap-2">
            {hasPermission(businessMember?.role, "products:crud") && (
              <DialogTrigger asChild>
                <Button size="sm" variant={"outline"}>
                  <Edit className="size-3" />
                  Update
                </Button>
              </DialogTrigger>
            )}

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
          </div>

          {/* Dropdown Content */}
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy
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
                      Delete
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

        <EditDialog data={data} />

        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove '{data.name}'?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove '{data.name}' from all inventory
              controls.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={isRemovingCategory}
              onClick={(e) => {
                e.preventDefault();
                handleRemoveCategory();
              }}
              // type="button"
            >
              {isRemovingCategory && <Spinner className="size-4" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Dialog>
    </AlertDialog>
  );
}
