import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import type { Role } from "types";
import { capitalizeFirstChar } from "utils";

const roles: {
  id: Role;
  label: string;
  desc?: string;
}[] = [
  { id: "cashier", label: "Cashier", desc: "Can view and comment." },
  {
    id: "stock_keeper",
    label: "Stock Keeper",
    desc: "Can view, comment and edit.",
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Can view, comment and manage billing.",
  },
  //   { id: "owner", label: "Owner", desc: "Admin-level access to all resources." },
];

export default function RoleSelector({
  value,
  disabled,
  className,
}: {
  value?: Role;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<(typeof roles)[0]>();
  const isOwner = value === "owner";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name="role" value={role?.id} />

      <PopoverTrigger disabled={disabled} asChild>
        <Button variant="outline" className={cn(className, "bg-card")}>
          {capitalizeFirstChar(role?.label || "Select role...")}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command>
          <CommandInput placeholder="Select new role..." />
          <CommandList>
            <CommandEmpty>No roles found.</CommandEmpty>
            <CommandGroup>
              {roles.map((r) => (
                <CommandItem
                  key={r.id}
                  id={r.id}
                  onSelect={() => {
                    (setRole(r), setOpen(false));
                  }}
                  disabled={isOwner}
                  // value={r.id}
                  className={"teamaspace-y-1 px-4 py-2"}
                >
                  <div className="flex flex-col items-start ">
                    <p>{r.label}</p>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      r?.id === role?.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
              <CommandItem
                disabled={!isOwner}
                className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
              >
                <p>Owner</p>
                <p className="text-sm text-muted-foreground">
                  Admin-level access to all resources.
                </p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
