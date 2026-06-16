import { type Row } from "@tanstack/react-table";
import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react";

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
  AlertDialog,
  AlertDialogTrigger,
  // AlertDialogMedia,
} from "@/components/ui/alert-dialog";

import { canManageMember, hasPermission } from "utils/permissions";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TeamEditDeleteDialogs } from "@/components/team/team-dialogs";

interface DataTableRowActionsProps {
  row: Row<OrganisationMember>;
}

export function TeamTableRowActions({ row }: DataTableRowActionsProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { businessMember } = useOrganisation();

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

  return (
    <Dialog>
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
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="text-xs px-1.5 py-1">
                        Edit row
                        <DropdownMenuShortcut>
                          <Edit className="size-3" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuGroup>

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

        <TeamEditDeleteDialogs row={row} />
      </AlertDialog>
    </Dialog>

    // <AlertDialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
    //   <DropdownMenu open={open} onOpenChange={setOpen}>
  );
}
