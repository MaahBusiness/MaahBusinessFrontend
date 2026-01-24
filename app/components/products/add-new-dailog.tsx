import * as React from "react";
import { ChevronDown, SearchIcon, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoleSelector from "@/components/role-selector";
import { PasswordInput } from "@/components/forms/password-input";
import { Form, useActionData, useNavigation } from "react-router";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { ServerActionState } from "types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// ? NOTE: Would've loved to use `useOrganisations`'s handy methods here, but React Router 8 and forms are just built different. The easiest/safest way is just using actions and handling toasting/invalidation manually

export default function AddNewDialog() {
  // const { addMember, isAddingMember, addMemberState } = useOrganisation();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAddingMember = isSubmitting && intent === "add-member";

  React.useEffect(() => {
    if (intent === "add-member" && actionData?.success)
      toast.success("New member has been added succesfully!");
  }, [actionData]);

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
