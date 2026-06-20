import { type ReactNode, useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";
import { useCloseDrawerOnActionSuccess } from "@/hooks/use-close-drawer-on-action-success";
import { Pencil, Plus, UserPlus } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Client, ServerActionState } from "types";
import { CUSTOMER_TYPES } from "types/consts";
import { capitalizeFirstChar, formatDisplayAmount } from "utils";
import { cn } from "@/lib/utils";

function normalizeCustomerType(type?: string) {
  return (type?.toLowerCase() ?? "regular") as (typeof CUSTOMER_TYPES)[number];
}

function ClientFormFields({ client }: { client?: Client }) {
  const [type, setType] = useState(normalizeCustomerType(client?.customer_type));

  return (
    <div className="flex flex-col gap-6 p-6 py-4">
      <input type="hidden" name="type" value={type} />
      <Field className="gap-4">
        <Label htmlFor="type">Client type</Label>
        <Select
          value={type}
          onValueChange={(value) =>
            setType(value as (typeof CUSTOMER_TYPES)[number])
          }
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
          defaultValue={client?.name}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email address (optional)</FieldLabel>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="member@acme.com"
          defaultValue={client?.email}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
        <Input
          id="address"
          type="text"
          name="address"
          placeholder="123 Market Street, San Francisco, CA"
          defaultValue={client?.address}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
        <Input
          id="phone"
          type="tel"
          name="phone"
          defaultValue={client?.phone_number}
          placeholder="+1 555 123 4596"
        />
      </Field>
    </div>
  );
}

type AddClientDialogProps = {
  triggerClassName?: string;
};

export function AddClientDialog({ triggerClassName }: AddClientDialogProps) {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-client";

  useCloseOnActionSuccess(open, () => setOpen(false), "add-client");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={isAdding} asChild>
        <Button
          size="sm"
          className={cn("h-8 gap-1.5 px-2 text-xs lg:px-3", triggerClassName)}
        >
          {isAdding ? <Spinner className="size-4" /> : <Plus className="size-4" />}
          Add client
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-4 w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:mx-auto sm:max-w-sm">
        <Form method="POST" key={open ? "add-client-open" : "add-client-closed"}>
          <input type="hidden" name="intent" value="add-client" />

          <DialogHeader className="border-b border-emerald-500/20 bg-emerald-500/5 p-6 py-4">
            <div className="mb-1 flex items-center gap-2 text-emerald-600">
              <UserPlus className="size-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Customer
              </span>
            </div>
            <DialogTitle className="text-base">Add new client</DialogTitle>
            <DialogDescription>
              Create a customer record for invoices and credit tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <ClientFormFields />
          </div>

          <DialogFooter className="border-t border-border p-6 py-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={isAdding}>
              {isAdding && <Spinner className="size-4" />}
              Add client
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditClientDrawer({
  client,
  open,
  onOpenChange,
}: {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actionData = useActionData<ServerActionState & { data?: Client }>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isUpdating = isSubmitting && intent === "update-client";

  useCloseDrawerOnActionSuccess(open, onOpenChange, "update-client");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <Form
          method="POST"
          className="flex h-full flex-col"
          key={open ? `edit-${client.id}` : "edit-closed"}
        >
          <input type="hidden" name="intent" value="update-client" />
          <input type="hidden" name="id" value={client.id} />

          <DrawerHeader className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent px-6 py-5">
            <div className="flex items-center gap-2 text-emerald-600">
              <Pencil className="size-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Edit client
              </span>
            </div>
            <DrawerTitle className="truncate text-lg">{client.name}</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Update contact details or customer type.
            </p>
          </DrawerHeader>

          <div className="relative flex-1 overflow-y-auto bg-muted/10">
            {actionData?.message && !actionData.success && (
              <p className="px-6 pt-4 text-sm text-destructive">
                {actionData.message}
              </p>
            )}
            <ClientFormFields client={client} />
          </div>

          <DrawerFooter className="border-t border-border bg-background/95 px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" disabled={isUpdating} className="auth-submit-btn border-0">
              {isUpdating && <Spinner className="size-4" />}
              Save changes
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

type ClientDetailsDrawerProps = {
  client: Client;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

function formatDateTime(value?: string) {
  if (!value) return "--";

  return new Date(value).toLocaleString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientDetailsDrawer({
  client,
  open: openProp,
  onOpenChange,
  trigger,
}: ClientDetailsDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const customerType = capitalizeFirstChar(
    normalizeCustomerType(client.customer_type),
  );

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}

      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent px-6 py-5">
            <div className="flex items-start gap-3">
              <Avatar className="mt-0.5 size-11">
                <BoringFallback name={client.name} />
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    Customer details
                  </Badge>
                  <Badge variant="secondary">{customerType}</Badge>
                </div>
                <DrawerTitle className="truncate text-lg">{client.name}</DrawerTitle>
                <DrawerDescription className="truncate">
                  Customer profile, contact details, and purchase summary.
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto bg-muted/10 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Item variant="outline" className="rounded-xl">
                <ItemContent className="gap-2">
                  <ItemDescription>Total spent</ItemDescription>
                  <ItemTitle className="text-base">
                    {formatDisplayAmount(Number(client.total_purchases ?? 0))}
                  </ItemTitle>
                </ItemContent>
              </Item>

              <Item variant="outline" className="rounded-xl">
                <ItemContent className="gap-2">
                  <ItemDescription>Loyalty points</ItemDescription>
                  <ItemTitle className="text-base">
                    {client.loyalty_points || "0"}
                  </ItemTitle>
                </ItemContent>
              </Item>
            </div>

            <div className="mt-5 space-y-3">
              <Item variant="outline" className="rounded-xl">
                <ItemContent>
                  <ItemDescription>Email</ItemDescription>
                  <ItemTitle>{client.email || "--"}</ItemTitle>
                </ItemContent>
              </Item>

              <Item variant="outline" className="rounded-xl">
                <ItemContent>
                  <ItemDescription>Phone</ItemDescription>
                  <ItemTitle>{client.phone_number || "--"}</ItemTitle>
                </ItemContent>
              </Item>

              <Item variant="outline" className="rounded-xl">
                <ItemContent>
                  <ItemDescription>Address</ItemDescription>
                  <ItemTitle className="w-full whitespace-normal">
                    {client.address || "--"}
                  </ItemTitle>
                </ItemContent>
              </Item>

              <Item variant="outline" className="rounded-xl">
                <ItemContent>
                  <ItemDescription>Customer ID</ItemDescription>
                  <ItemTitle className="break-all">{client.id}</ItemTitle>
                </ItemContent>
              </Item>

              <div className="grid gap-3 sm:grid-cols-2">
                <Item variant="outline" className="rounded-xl">
                  <ItemContent>
                    <ItemDescription>Created</ItemDescription>
                    <ItemTitle className="w-full whitespace-normal">
                      {formatDateTime(client.created_at)}
                    </ItemTitle>
                  </ItemContent>
                </Item>

                <Item variant="outline" className="rounded-xl">
                  <ItemContent>
                    <ItemDescription>Last updated</ItemDescription>
                    <ItemTitle className="w-full whitespace-normal">
                      {formatDateTime(client.updated_at)}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border bg-background/95 px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
