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
import { roles } from "@/routes/dashboard/team/data";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import type { Role } from "types";
import { capitalizeFirstChar } from "utils";

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
                  disabled={isOwner || r.id == "owner"}
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
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
