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
  InputGroupButton,
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
  Slash,
} from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import type { Client, ClientUpdateParams, Customer } from "types";
import { CUSTOMER_TYPES } from "types/consts";
import { capitalizeFirstChar, genericErrorState } from "utils";

export default function ClientSelector({
  value,
  disabled,
  className,
}: {
  value?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { fetchClients } = useOrganisation();

  const [open, setOpen] = useState(false);
  const [d, setD] = useState(false);
  const [client, setClient] = useState<Client | ClientUpdateParams>();
  const [query, setQuery] = useState<string>();

  const { data, error, refetch, isFetching } = fetchClients({ search: query });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ⛔ stop navigation
    if (!query) return;

    const { data, error } = await refetch();

    if (error) {
      toast.error(genericErrorState().message);
      return;
    }

    if (!data?.data) {
      toast.error(data?.message);
      return;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Dialog open={d} onOpenChange={setD}>
        <input
          type="hidden"
          name="client-id"
          value={(client as Client)?.id ?? ""}
          required
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
            <div className="flex flex-col gap-4">
              <PopoverTrigger disabled={disabled} asChild>
                <Button
                  variant="outline"
                  className={cn(className, " justify-between w-auto flex-1")}
                >
                  Search clients...
                  <SearchIcon className="text-muted-foreground" />
                </Button>
              </PopoverTrigger>

              <DialogTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                  className="w-fit text-xs font-normal"
                >
                  <Plus size={4} />
                  Add new client
                </Button>
              </DialogTrigger>
            </div>
          )}
        </div>
        <PopoverContent
          className="p-0 w-[--radix-popper-anchor-width]"
          align="center"
        >
          <Command>
            {/* <CommandInput placeholder="Search client..." /> */}
            <form onSubmit={handleSubmit}>
              <InputGroup className="h-full  border-0 border-b rounded-none">
                <InputGroupInput
                  placeholder="Type to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  // onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  // className="p-0"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant="secondary"
                    type="submit"
                    disabled={isFetching}
                  >
                    {isFetching ? <Spinner /> : "Search"}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>

            <CommandList>
              <CommandEmpty>No roles found.</CommandEmpty>
              {/* {isLoading && <TeamSwitcherSkeleton />} */}

              <CommandGroup>
                {!data && !error && (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {isFetching ? <Spinner /> : <SearchIcon />}
                      </EmptyMedia>
                      <EmptyTitle>Search clients</EmptyTitle>
                      <EmptyDescription>
                        Search by name or email from the database.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <form onSubmit={handleSubmit}>
                        <InputGroup>
                          <InputGroupInput
                            placeholder="Type to search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                          <InputGroupAddon>
                            <SearchIcon />
                          </InputGroupAddon>
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="secondary"
                              type="submit"
                              size={"icon-xs"}
                              disabled={isFetching}
                            >
                              {isFetching ? (
                                <Spinner className="size-3" />
                              ) : (
                                <Slash className="size-3" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </form>
                    </EmptyContent>
                  </Empty>
                )}

                {(error || !data?.success) && (
                  <Empty className="bg-muted/30 h-full">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {isFetching ? <Spinner /> : <CircleSlash />}
                      </EmptyMedia>
                      <EmptyTitle>Oops!</EmptyTitle>
                      <EmptyDescription className="max-w-xs text-pretty">
                        {genericErrorState().message}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        variant="secondary"
                        onClick={async () => await refetch()}
                        disabled={isFetching}
                      >
                        {isFetching ? <Spinner /> : <RefreshCcwIcon />}
                        Try again
                      </Button>
                    </EmptyContent>
                  </Empty>
                )}

                {data?.data && !data.data?.length && (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {isFetching ? <Spinner /> : <CircleDashed />}
                      </EmptyMedia>
                      <EmptyTitle>No results</EmptyTitle>
                      <EmptyDescription>
                        We couldn't find any client matching '{query}'. Try a
                        different query.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <form onSubmit={handleSubmit}>
                        <InputGroup>
                          <InputGroupInput
                            placeholder="Type to search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                          <InputGroupAddon>
                            <SearchIcon />
                          </InputGroupAddon>
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="secondary"
                              type="submit"
                              size={"icon-xs"}
                            >
                              {isFetching ? (
                                <Spinner className="size-3" />
                              ) : (
                                <Slash className="size-3" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </form>
                    </EmptyContent>
                  </Empty>
                )}

                {data?.data?.length &&
                  data.data.map((c) => (
                    <CommandItem
                      onSelect={() => setClient(c)}
                      key={c.id}
                      className="text-xs"
                    >
                      <Avatar className="mr-1 size-8">
                        <BoringFallback name={c.name ?? c.id} />
                      </Avatar>

                      <span className="flex flex-col">
                        {c.name}
                        <span>{c.email}</span>
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem>
                    <PlusCircle className="h-5 w-5" />
                    Add new client
                  </CommandItem>
                </DialogTrigger>
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
          <DialogTitle className="text-base">Add new client</DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <div className="flex flex-col gap-6 p-6 py-4">
            <Field className="gap-4">
              <Label htmlFor="type" defaultValue={client?.customer_type}>
                Client type
              </Label>
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
            Add client
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
