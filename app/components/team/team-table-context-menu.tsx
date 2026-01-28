import { TeamEditDeleteDialogs } from "@/components/team/team-dialogs";
import { AlertDialog } from "@/components/ui/alert-dialog";
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
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import type { Cell } from "@tanstack/react-table";
import { Copy, Edit, Trash2 } from "lucide-react";
import { redirect, useLocation } from "react-router";
import { toast } from "sonner";
import type { OrganisationMember } from "types";
import { canManageMember, hasPermission } from "utils/permissions";

interface DataTableContextMenuProps<TData, TValue> {
  cell: Cell<OrganisationMember, TValue>;
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

export function TeamTableContextMenu<TData, TValue>({
  cell,
  className,
  children,
  title,
}: DataTableContextMenuProps<TData, TValue>) {
  const { user } = useAuth();
  const { businessMember } = useOrganisation();
  const { pathname } = useLocation();

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

  if (!user)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);
  if (!businessMember) throw redirect("/dashboard/organisations/");

  const member = cell.row.original;

  const canDelete = canManageMember(
    { id: user?.id, role: businessMember.role },
    member,
  );

  return (
    <ContextMenu>
      <Dialog>
        <AlertDialog>
          <ContextMenuTrigger
            title={title}
            className={cn(
              "flex h-full w-full max-w-xs items-center justify-start gap-2  px-4",
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
            {hasPermission(businessMember?.role, "products:crud") &&
              canDelete && (
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

          {/* Alert Dialog */}
          <TeamEditDeleteDialogs row={cell.row} />
        </AlertDialog>
      </Dialog>
    </ContextMenu>
  );
}
