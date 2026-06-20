import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { PickerDropdown } from "@/components/sales/picker-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  Edit3,
  RefreshCcwIcon,
  CircleDashed,
  CircleSlash,
  ChevronDown,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Client, ClientUpdateParams, Customer } from "types";
import { CUSTOMER_TYPES } from "types/consts";
import { capitalizeFirstChar, genericErrorState } from "utils";

const PAGE_SIZE = 15;

export default function ClientSelector({
  disabled,
  className,
  allowWalkIn = false,
}: {
  value?: string;
  disabled?: boolean;
  className?: string;
  allowWalkIn?: boolean;
}) {
  const { fetchClients } = useOrganisation();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [client, setClient] = useState<Client | ClientUpdateParams>();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Client[]>([]);
  const [pendingCustomer, setPendingCustomer] = useState<Client | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    if (!pickerOpen) {
      setQuery("");
      setDebounced("");
      setPage(1);
      setItems([]);
      setPendingCustomer(null);
    }
  }, [pickerOpen]);

  const searchFilter =
    debounced.length >= 2 ? { search: debounced } : {};

  const { data, error, refetch, isFetching } = fetchClients(
    { page, page_size: PAGE_SIZE, ...searchFilter },
    { enabled: pickerOpen },
  );

  useEffect(() => {
    if (!pickerOpen || !data?.success || !data.data) return;
    if (page === 1) {
      setItems(data.data);
      return;
    }
    setItems((prev) => {
      const known = new Set(prev.map((c) => c.id));
      const next = data.data!.filter((c) => !known.has(c.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }, [pickerOpen, data?.data, data?.success, page]);

  const meta = data?.meta;
  const hasMore = meta ? meta.current_page < meta.total_pages : false;

  const listHint = useMemo(() => {
    if (debounced.length >= 2) {
      return `Showing results for "${debounced}".`;
    }
    if (meta?.count != null) {
      return `Browse customers (${meta.count} total). Use search to narrow down.`;
    }
    return "Browse customers or search by name, email, or phone.";
  }, [debounced, meta?.count]);

  const confirmSelection = () => {
    if (!pendingCustomer) return;
    setClient(pendingCustomer);
    setPickerOpen(false);
  };

  const selectCustomerImmediately = (c: Client) => {
    setClient(c);
    setPickerOpen(false);
  };

  const openAddCustomer = () => {
    setPickerOpen(false);
    setAddOpen(true);
  };

  return (
    <>
      <input
        type="hidden"
        name="client-id"
        value={(client as Client)?.id ?? ""}
      />
      <input type="hidden" name="client" value={JSON.stringify(client)} />

      <div className="flex w-full flex-col gap-3">
        {client ? (
          <Item variant="outline" size="sm">
            <ItemMedia>
              <Avatar>
                <BoringFallback name={client?.name} />
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>
                {client?.name}
                <span className="text-muted-foreground">
                  {" "}
                  · {capitalizeFirstChar(client?.customer_type)}
                </span>
              </ItemTitle>
              <ItemDescription>{client?.email || "No email"}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {!Object.hasOwn(client, "id") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => setAddOpen(true)}
                >
                  <Edit3 />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setClient(undefined)}
              >
                <X />
              </Button>
            </ItemActions>
          </Item>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <PickerDropdown
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                className="flex-1"
                minWidth={340}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-expanded={pickerOpen}
                    onClick={() => setPickerOpen((v) => !v)}
                    className={cn(
                      className,
                      "h-9 w-full justify-between font-normal",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Users className="size-4 shrink-0 text-muted-foreground" />
                      Select customer
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 opacity-50 transition-transform",
                        pickerOpen && "rotate-180",
                      )}
                    />
                  </Button>
                }
              >
                <div className="flex max-h-[inherit] flex-col">
                  <div className="shrink-0 border-b border-border p-2">
                    <Input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name, email, or phone…"
                      className="h-8"
                    />
                    <p className="mt-1.5 px-0.5 text-[11px] text-muted-foreground">
                      {listHint}
                    </p>
                  </div>

                  <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1">
                    {isFetching && page === 1 ? (
                      <div className="flex justify-center py-8">
                        <Spinner />
                      </div>
                    ) : error || !data?.success ? (
                      <Empty className="border-0 py-4">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <CircleSlash />
                          </EmptyMedia>
                          <EmptyTitle>Could not load</EmptyTitle>
                          <EmptyDescription>
                            {genericErrorState().message}
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void refetch()}
                          >
                            <RefreshCcwIcon className="size-4" />
                            Retry
                          </Button>
                        </EmptyContent>
                      </Empty>
                    ) : items.length === 0 ? (
                      <Empty className="border-0 py-4">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <CircleDashed />
                          </EmptyMedia>
                          <EmptyTitle>No customers found</EmptyTitle>
                          <EmptyDescription>
                            {debounced.length >= 2
                              ? `No match for "${debounced}".`
                              : "No customers yet."}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <>
                        {items.map((c) => {
                          const checked = pendingCustomer?.id === c.id;
                          const inputId = `customer-pick-${c.id}`;
                          return (
                            <Label
                              key={c.id}
                              htmlFor={inputId}
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent",
                                checked && "bg-violet-500/10",
                              )}
                            >
                              <Checkbox
                                id={inputId}
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value === true) {
                                    setPendingCustomer(c);
                                    selectCustomerImmediately(c);
                                  } else {
                                    setPendingCustomer(null);
                                  }
                                }}
                              />
                              <Avatar className="size-7 shrink-0">
                                <BoringFallback name={c.name ?? c.id} />
                              </Avatar>
                              <span className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium">
                                  {c.name}
                                </span>
                                <span className="truncate text-[11px] text-muted-foreground">
                                  {c.email || c.phone_number || "—"}
                                </span>
                              </span>
                            </Label>
                          );
                        })}
                        {hasMore && (
                          <div className="px-1 py-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-full text-xs"
                              disabled={isFetching && page > 1}
                              onClick={() => setPage((p) => p + 1)}
                            >
                              {isFetching && page > 1 ? (
                                <Spinner className="size-3.5" />
                              ) : (
                                `Load more (${items.length}/${meta?.count ?? "…"})`
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-2 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={openAddCustomer}
                    >
                      <Plus className="size-3.5" />
                      New customer
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!pendingCustomer}
                      onClick={confirmSelection}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </PickerDropdown>

              {allowWalkIn && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onClick={() =>
                    setClient({
                      name: "Walk-in customer",
                      customer_type: "regular",
                    })
                  }
                >
                  Walk-in
                </Button>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-fit text-xs font-normal"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={4} />
              Add new customer
            </Button>
          </div>
        )}
      </div>

      <AddNewDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        setClient={setClient}
        client={client}
      />
    </>
  );
}

export function AddNewDialog({
  open,
  onOpenChange,
  setClient,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setClient: Dispatch<SetStateAction<ClientUpdateParams | undefined>>;
  client?: ClientUpdateParams;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const customer_type = formData.get("type") as Customer;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | undefined;
    const address = formData.get("address") as string | undefined;
    const phone_number = formData.get("phone") as string | undefined;

    setClient({ customer_type, name, address, email, phone_number });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border p-6 py-4">
            <DialogTitle className="text-base">Add new customer</DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar max-h-[50vh] overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-6">
              <Field className="gap-4">
                <Label htmlFor="type">Customer type</Label>
                <Select
                  name="type"
                  defaultValue={client?.customer_type ?? "regular"}
                  required
                >
                  <SelectTrigger className="w-full" id="type">
                    <SelectValue placeholder="Select customer type" />
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
                  defaultValue={client?.name}
                  placeholder="John Doe"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  defaultValue={client?.email}
                  placeholder="customer@example.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
                <Input
                  id="address"
                  type="text"
                  name="address"
                  defaultValue={client?.address}
                  placeholder="123 Market Street"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  defaultValue={client?.phone_number}
                  placeholder="+1 555 123 4567"
                />
              </Field>
            </div>
          </div>
          <DialogFooter className="border-t border-border p-6 py-3">
            <DialogClose asChild>
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" className="auth-submit-btn border-0">
              Add customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
