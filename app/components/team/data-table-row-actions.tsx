import { type Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  redirect,
  useLocation,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router";
import type { OrganisationMember, Role } from "types";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useOrg } from "@/contexts/org-context";
import { useOrganisation } from "@/hooks/use-organisation";

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
  const { removeMember, isRemovingMember, businessMember } = useOrganisation();

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
  };

  return (
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
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
        <DropdownMenuItem>
          Copy email <address></address>
        </DropdownMenuItem>

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              disabled={isRemovingMember}
            >
              Delete
              <DropdownMenuShortcut>
                {isRemovingMember && <Spinner className="size-3" />}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
