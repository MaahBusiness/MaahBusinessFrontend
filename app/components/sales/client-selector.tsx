import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  PlusCircle,
  Plus,
  SearchIcon,
  X,
  Edit3,
  RefreshCcwIcon,
  CircleDashed,
  CircleSlash,
} from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Client, ClientUpdateParams, Customer } from "types";
import { CUSTOMER_TYPES } from "types/consts";
import { capitalizeFirstChar, genericErrorState } from "utils";

export default function ClientSelector({
  value,
  disabled,
  className,
  allowWalkIn = false,
}: {
  value?: string;
  disabled?: boolean;
  className?: string;
  /** When true, show a quick walk-in option (no saved customer record). */
  allowWalkIn?: boolean;
}) {
  const { fetchClients } = useOrganisation();

  const [open, setOpen] = useState(false);
  const [d, setD] = useState(false);
  const [client, setClient] = useState<Client | ClientUpdateParams>();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const { data, error, refetch, isFetching } = fetchClients(
    { search: debounced || undefined, page_size: 20 },
    { enabled: open },
  );

  const customers = data?.data ?? [];

  const selectCustomer = (c: Client) => {
    setClient(c);
    setOpen(false);
  };

  const openAddCustomer = () => {
    setOpen(false);
    setD(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Dialog open={d} onOpenChange={setD}>
        <input
          type="hidden"
          name="client-id"
          value={(client as Client)?.id ?? ""}
        />

        <input type="hidden" name="client" value={JSON.stringify(client)} />

        <div className="flex flex-col gap-4 w-full">
          {client ? (
            <Item variant="outline" size={"sm"}>
              <ItemMedia>
                <Avatar>
                  {/* <AvatarImage src={extractImageUrl(person.avatar)} className="grayscale" /> */}
                  <BoringFallback name={client?.name} />
                </Avatar>
              </ItemMedia>
              <ItemContent className="gap-0">
                <ItemTitle>
                  {client?.name} |
                  <span className="text-muted-foreground">
                    {capitalizeFirstChar(client?.customer_type)}
                  </span>
                </ItemTitle>
                <ItemDescription>{client?.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                {!Object.hasOwn(client, "id") && (
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                    >
                      <Edit3 />
                    </Button>
                  </DialogTrigger>
                )}

                <Button
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
                <PopoverTrigger disabled={disabled} asChild>
                  <Button
                    variant="outline"
                    className={cn(className, "flex-1 justify-between")}
                  >
                    Search customers
                    <SearchIcon className="text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
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
                onClick={openAddCustomer}
              >
                <Plus size={4} />
                Add new customer
              </Button>
            </div>
          )}
        </div>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
          align="start"
          side="bottom"
        >
          <Command shouldFilter={false}>
            <div className="border-b border-border p-2">
              <InputGroup>
                <InputGroupInput
                  autoFocus
                  placeholder="Search by name or email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  {isFetching ? (
                    <Spinner className="size-4" />
                  ) : (
                    <SearchIcon className="size-4" />
                  )}
                </InputGroupAddon>
              </InputGroup>
            </div>

            <CommandList className="max-h-64">
              {isFetching && !customers.length ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : error || !data?.success ? (
                <Empty className="border-0 py-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleSlash />
                    </EmptyMedia>
                    <EmptyTitle>Could not load customers</EmptyTitle>
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
                      Try again
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : customers.length === 0 ? (
                <Empty className="border-0 py-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleDashed />
                    </EmptyMedia>
                    <EmptyTitle>No customers found</EmptyTitle>
                    <EmptyDescription>
                      {debounced
                        ? `No match for "${debounced}".`
                        : "No customers in your catalog yet."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <CommandGroup>
                  {customers.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.id}
                      onSelect={() => selectCustomer(c)}
                      className="cursor-pointer gap-2 py-2"
                    >
                      <Avatar className="size-8 shrink-0">
                        <BoringFallback name={c.name ?? c.id} />
                      </Avatar>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {c.email || c.phone_number || "—"}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandEmpty>No customers found.</CommandEmpty>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  className="cursor-pointer"
                  onSelect={openAddCustomer}
                >
                  <PlusCircle className="size-4" />
                  Add new customer
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>

        <AddNewDialog {...{ setClient, setD, client }} />
      </Dialog>
    </Popover>
  );
}

export function AddNewDialog({
  setClient,
  setD,
  client,
}: {
  setClient: Dispatch<SetStateAction<ClientUpdateParams | undefined>>;
  setD: Dispatch<SetStateAction<boolean>>;
  client?: ClientUpdateParams;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ⛔ stop navigation

    const formData = new FormData(e.currentTarget);

    const customer_type = formData.get("type") as Customer;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | undefined;
    const address = formData.get("address") as string | undefined;
    const phone_number = formData.get("phone") as string | undefined;

    setClient({ customer_type, name, address, email, phone_number });
    setD(false);
  };

  return (
    <DialogContent className="!max-w-sm p-0">
      <form onSubmit={handleSubmit}>
        <DialogHeader className="p-6 py-4 border-b border-border">
          <DialogTitle className="text-base">Add new customer</DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <div className="flex flex-col gap-6 p-6 py-4">
            <Field className="gap-4">
              <Label htmlFor="type" defaultValue={client?.customer_type}>
                Customer type
              </Label>
              <Select name="type" defaultValue="regular" required>
                <SelectTrigger className="w-full">
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
                defaultValue={client?.email}
                placeholder="member@acme.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
              <Input
                id="addr"
                type="text"
                name="address"
                defaultValue={client?.address}
                placeholder="123 Market Street, San Francisco, CA"
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
        </div>
        <DialogFooter className="p-6 py-3 border-t border-border">
          <DialogClose asChild>
            <Button variant="outline" size={"sm"}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size={"sm"}>
            Add customer
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
