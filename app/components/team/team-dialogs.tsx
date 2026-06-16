/* eslint-disable react/no-unescaped-entities */
import { PasswordInput } from "@/components/forms/password-input";
import RoleSelector from "@/components/role-selector";
import {
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { cn } from "@/lib/utils";
import type { Row } from "@tanstack/react-table";
import { ChevronDown, SearchIcon, UserPlus, Trash2Icon } from "lucide-react";
import {
  useActionData,
  useNavigation,
  Form,
  useLocation,
  redirect,
} from "react-router";
import type { ServerActionState, OrganisationMember } from "types";

// ? NOTE: Would've loved to use `useOrganisations`'s handy methods here, but React Router 8 and forms are just built different. The easiest/safest way is just using actions and handling toasting/invalidation manually

export function AddNewDialog() {
  // const { addMember, isAddingMember, addMemberState } = useOrganisation();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAddingMember = isSubmitting && intent === "add-member";

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={isAddingMember} asChild>
          <Button size={"sm"} className="h-8 px-2 lg:px-3 text-xs">
            Add member
            {isAddingMember ? (
              <Spinner className="size-4" />
            ) : (
              <ChevronDown size={4} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem disabled>
              <SearchIcon />
              Search...
            </DropdownMenuItem>
            <DialogTrigger disabled={isAddingMember} asChild>
              <DropdownMenuItem>
                {isAddingMember ? <Spinner /> : <UserPlus />}
                Create new
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="!max-w-sm p-0">
        <Form method="POST">
          <input type="hidden" name="intent" value="add-member" />

          <DialogHeader className="p-6 py-4 border-b border-border">
            <DialogTitle className="text-base">Create a new member</DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="space-y-4 p-6 py-4">
              <Field>
                <Label htmlFor="plan">Role</Label>
                <RoleSelector className="w-full justify-between" />
                <FieldError errors={[{ message: errors?.role }]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Name (optional)</FieldLabel>{" "}
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Beff Jezos"
                />
                <FieldError errors={[{ message: errors?.name }]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Email address</FieldLabel>{" "}
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="member@acme.com"
                  required
                />
                <FieldError errors={[{ message: errors?.email }]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password (optional)</FieldLabel>
                <PasswordInput required={false} />
                <FieldError errors={[{ message: errors?.password }]} />
              </Field>

              <div className="text-muted-foreground">
                A confirmation email will be sent to the new member with their
                credentials.
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 py-3 border-t border-border">
            <DialogClose asChild>
              <Button variant="outline" size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size={"sm"} disabled={isAddingMember}>
              {isAddingMember && <Spinner className="size-4" />}
              Create member
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DataTableRowActionsProps {
  row: Row<OrganisationMember>;
}

export function TeamEditDeleteDialogs({ row }: DataTableRowActionsProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { removeMember, isRemovingMember, businessMember } = useOrganisation();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();

  // const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  // const [open, setOpen] = React.useState(false);

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAddingMember = isSubmitting && intent === "update-member";

  if (!user)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);
  if (!businessMember) throw redirect("/dashboard/organisations/");

  const member = row.original;

  const handleDeleteUser = () => {
    if (member.user) removeMember(member.id);
  };

  return (
    <>
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

      <DialogContent className="!max-w-sm p-0">
        <Form method="POST">
          <input type="hidden" name="intent" value="update-member" />
          <input type="hidden" name="id" value={member.id} />
          <input type="hidden" name="status" value={`${member.is_active}`} />

          <DialogHeader className="p-6 py-4 border-b border-border">
            <DialogTitle className="text-base">
              Update '{member.user?.name}'
            </DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="flex flex-col gap-6 p-6 py-4">
              <Field className="gap-4">
                <Label htmlFor="plan">Change member role?</Label>
                <RoleSelector
                  value={member.role}
                  className="w-full justify-between"
                />
                <FieldError errors={[{ message: errors?.role }]} />
              </Field>

              <FieldLabel
                htmlFor="switch-status"
                className="p-4 border-destructive"
              >
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle
                      className={cn(member.is_active && "text-destructive")}
                    >
                      {member.is_active ? "Deactivate" : "Activate"} member?
                    </FieldTitle>
                    <FieldDescription className="text-xs">
                      {member.is_active
                        ? "This will temporarily disable the member’s access to the organisation. They won’t be able to sign in or perform any actions until reactivated."
                        : "This will restore the member’s access to the organisation."}
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-status" name="sswitch" />
                </Field>
              </FieldLabel>
            </div>
          </div>
          <DialogFooter className="p-6 py-3 border-t border-border">
            <DialogClose asChild>
              <Button variant="outline" size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size={"sm"} disabled={isAddingMember}>
              {isAddingMember && <Spinner className="size-4" />}
              Update member
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </>
  );
}
