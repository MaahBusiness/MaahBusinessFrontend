import { type Row } from "@tanstack/react-table";
import { Copy, MoreVertical, Trash2, Trash2Icon } from "lucide-react";

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
import type { OrganisationMember } from "types";
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

import { canManageMember, hasPermission } from "utils/permissions";
import { Spinner } from "@/components/ui/spinner";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";

interface DataTableRowActionsProps {
  row: Row<OrganisationMember>;
}

export function TeamTableRowActions({ row }: DataTableRowActionsProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { removeMember, isRemovingMember, businessMember } = useOrganisation();

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  // const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  // const [open, setOpen] = React.useState(false);

  if (!user)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);
  if (!businessMember) throw redirect("/dashboard/organisations/");

  const member = row.original;

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(row.original));
  };

  const canDelete = canManageMember(
    { id: user?.id, role: businessMember.role },
    member,
  );

  const handleDeleteUser = () => {
    if (member.user) removeMember(member.id);
  };

  return (
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
          {hasPermission(businessMember?.role, "products:crud") &&
            canDelete && (
              <>
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

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove {member.user?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove {member.user?.name}r from your team.
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isRemovingMember}
            onClick={(e) => {
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
  );
}
