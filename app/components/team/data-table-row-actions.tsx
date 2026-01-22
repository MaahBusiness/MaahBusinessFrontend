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
import { redirect, useLocation, useNavigation, useSubmit } from "react-router";
import type { OrganisationMember, Role } from "types";
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
import { useState } from "react";

import * as React from "react";
import { hasPermission } from "utils/permissions";
import { Spinner } from "@/components/ui/spinner";

interface DataTableRowActionsProps<TData> {
  row: Row<OrganisationMember>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { pathname, search, hash } = useLocation();
  const { removeMember, isRemovingMember, removeMemberState, businessMember } =
    useOrganisation();

  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  const [open, setOpen] = React.useState(false);

  if (!user)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);

  if (!businessMember) throw redirect("/dashboard/organisations/");

  const member = row.original;

  const canDelete = canManageMember(
    { id: user?.id, role: businessMember.role },
    member,
  );

  const handleDeleteUser = () => {
    if (member.user) removeMember(member.user?.id);
    if (!isRemovingMember) setShowNewTeamDialog(false);
  };

  return (
    <AlertDialog>
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
          <DropdownMenuItem disabled>
            <Edit3 className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="size-4" />
            Copy email
          </DropdownMenuItem>
          {hasPermission(businessMember?.role, "manage:members") &&
            canDelete && (
              <>
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
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this member from your team. Are you
            sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isRemovingMember}
            onSelect={(e) => {
              e.preventDefault();
              handleDeleteUser();
              // return true;
            }}
          >
            {isRemovingMember && <Spinner />}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    // <AlertDialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
    //   <DropdownMenu open={open} onOpenChange={setOpen}>
    //     <DropdownMenuTrigger asChild>
    //       <Button
    //         variant="ghost"
    //         className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
    //       >
    //         <MoreHorizontal />
    //         <span className="sr-only">Open menu</span>
    //       </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent className="w-[160px]" align="end">
    //       <DropdownMenuItem disabled>
    //         <Edit3 className="size-4" />
    //         Edit
    //       </DropdownMenuItem>
    //       <DropdownMenuItem>
    //         <Copy className="size-4" />
    //         Copy email
    //       </DropdownMenuItem>
    //       {canDelete && (
    //         <>
    //           <DropdownMenuSeparator />
    //           <AlertDialogTrigger asChild>
    //             <DropdownMenuItem
    //               variant="destructive"
    //               onSelect={() => {
    //                 setOpen(false);
    //                 setShowNewTeamDialog(true);
    //               }}
    //             >
    //               <Trash2 className="size-4 text-destructive" />
    //               Remove
    //             </DropdownMenuItem>
    //           </AlertDialogTrigger>
    //         </>
    //       )}
    //     </DropdownMenuContent>
    //   </DropdownMenu>
    //   <AlertDialogContent size="sm">
    //     <AlertDialogHeader>
    //       <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
    //         <Trash2Icon />
    //       </AlertDialogMedia>
    //       <AlertDialogTitle>Remove member?</AlertDialogTitle>
    //       <AlertDialogDescription>
    //         This will permanently remove this member from your team. Are you
    //         sure you want to continue?
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter>
    //       <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
    //       <AlertDialogAction
    //         variant="destructive"
    //         onSelect={(e) => {
    //           e.preventDefault();
    //console.log(3333)
    ////  handleDeleteUser();
    //         }}
    //       >
    //         Remove
    //       </AlertDialogAction>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
  );
}

/** Quick helper */
export function canManageMember(
  currentUser: { id: string; role: Role },
  target: { id: string; role: Role },
) {
  if (currentUser.id === target.id) return false; // self
  if (target.role === "owner") return false; // owner undeletable

  if (currentUser.role === "owner") return true;

  if (currentUser.role === "manager" && target.role !== "manager") {
    return true;
  }

  return false;
}
