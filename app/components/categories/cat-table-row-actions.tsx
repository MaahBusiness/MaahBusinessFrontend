import { type Row } from "@tanstack/react-table";
import { Copy, Edit3, MoreHorizontal, Trash2, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface DataTableRowActionsProps<TData> {
  row: Row<Category | Subcategory>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { removeCategory, isRemovingCategory, businessMember } =
    useOrganisation();

  if (!user)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);

  if (!businessMember) throw redirect("/dashboard/organisations/");

  const handleDeleteUser = () => {
    console.log("HEREHERERE");
    removeCategory({ id: row.original.id, sub: "category_id" in row.original });
  };

  return (
    <AlertDialog>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[160px]" align="end">
            <DropdownMenuItem>
              <Copy className="size-4" />
              Copy name
            </DropdownMenuItem>
            {hasPermission(businessMember?.role, "products:crud") && (
              <>
                {/* <Dialog> */}
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Edit3 className="size-4" />
                    Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                {/* </Dialog> */}
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem variant="destructive">
                    <Trash2 className="size-4 text-destructive" />
                    Remove
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <EditDialog data={row.original} />

        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove '{row.original.name}'?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove '{row.original.name}' from all
              inventory controls.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              // type="button"
            >
              {isRemovingCategory && <Spinner className="size-4" />}
              Remove this
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Dialog>
    </AlertDialog>
  );
}
