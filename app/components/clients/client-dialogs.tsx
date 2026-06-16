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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { cn } from "@/lib/utils";
import type { Row } from "@tanstack/react-table";
import {
  ChevronDown,
  SearchIcon,
  UserPlus,
  Trash2Icon,
  Plus,
} from "lucide-react";
import {
  useActionData,
  useNavigation,
  Form,
  useLocation,
  redirect,
} from "react-router";
import type { ServerActionState, OrganisationMember, Client } from "types";
import { CUSTOMER_TYPES } from "types/consts";
import { capitalizeFirstChar } from "utils";

export function AddClientDialog() {
  // const { addMember, isAdding, addMemberState } = useOrganisation();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-client";

  return (
    <Dialog>
      <DialogTrigger disabled={isAdding} asChild>
        <Button size={"sm"} className="h-8 px-2 lg:px-3 text-xs">
          {isAdding ? <Spinner className="size-4" /> : <Plus size={4} />}
          Add client
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-sm p-0">
        <Form method="POST">
          <input type="hidden" name="intent" value="add-client" />

          <DialogHeader className="p-6 py-4 border-b border-border">
            <DialogTitle className="text-base">Add new client</DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="flex flex-col gap-6 p-6 py-4">
              <Field className="gap-4">
                <Label htmlFor="type">Client type</Label>
                <Select name="type" defaultValue="regular" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select the type of client" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {capitalizeFirstChar(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Beff Jezos"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Email address (optional)</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="member@acme.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
                <Input
                  id="addr"
                  type="text"
                  name="address"
                  placeholder="123 Market Street, San Francisco, CA"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 555 123 4596"
                />
              </Field>
            </div>
          </div>

          <DialogFooter className="p-6 py-3 border-t border-border">
            <DialogClose asChild>
              <Button variant="outline" size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size={"sm"} disabled={isAdding}>
              {isAdding && <Spinner className="size-4" />}
              Add client
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DataTableRowActionsProps {
  row: Row<Client>;
}

export function ClientEditDeleteDialogs({ row }: DataTableRowActionsProps) {
  const { isRemovingMember } = useOrganisation();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isUpdating = isSubmitting && intent === "update-client";

  const client = row.original;

  const handleDeleteUser = () => {
    // if (member.user) removeMember(member.id);
  };

  return (
    <>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove {client.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove {client.name} from your invoices. Are
            you sure you want to continue?
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
          <input type="hidden" name="intent" value="update-client" />
          <input type="hidden" name="id" value={client.id} />

          <DialogHeader className="p-6 py-4 border-b border-border">
            <DialogTitle className="text-base">
              Update '{client.name}'
            </DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="flex flex-col gap-6 p-6 py-4">
              <Field className="gap-4">
                <Label htmlFor="type">Client type</Label>
                <Select
                  name="type"
                  defaultValue={client.customer_type}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select the type of client" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {capitalizeFirstChar(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Beff Jezos"
                  required
                  defaultValue={client.name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Email address (optional)</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="member@acme.com"
                  defaultValue={client.email}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
                <Input
                  id="addr"
                  type="text"
                  name="address"
                  placeholder="123 Market Street, San Francisco, CA"
                  defaultValue={client.address}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  defaultValue={client.phone_number}
                  placeholder="+1 555 123 4596"
                />
              </Field>
            </div>
          </div>
          <DialogFooter className="p-6 py-3 border-t border-border">
            <DialogClose asChild>
              <Button variant="outline" size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size={"sm"} disabled={isUpdating}>
              {isUpdating && <Spinner className="size-4" />}
              Update client
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </>
  );
}
