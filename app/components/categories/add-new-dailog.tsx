import * as React from "react";
import { Plus } from "lucide-react";

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
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { Category, ServerActionState } from "types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganisation } from "@/hooks/use-organisation";
import { catData } from "@/routes/dashboard/products/data";

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

export default function AddNewDialog() {
  // const { addMember, isAddingCat, addMemberState } = useOrganisation();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const { organisation: res } = useOrganisation();

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAddingCat = isSubmitting && intent === "add-category";

  React.useEffect(() => {
    if (intent === "add-category" && actionData?.success)
      toast.success(`New category has been added succesfully!`);
  }, [actionData]);

  if (!res?.data) throw redirect("/dashboard/organisations");

  return (
    <Dialog>
      <DialogTrigger disabled={isAddingCat} asChild>
        <Button size={"sm"} className="h-8 px-2 lg:px-3 text-xs">
          {isAddingCat ? <Spinner className="size-4" /> : <Plus size={4} />}
          Add new
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-sm p-0">
        <Form method="POST">
          <input type="hidden" name="intent" value="add-category" />

          <DialogHeader className="p-6 py-4 border-b border-border">
            <DialogTitle className="text-base">
              Create a new product category
            </DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="space-y-4 p-6 py-4">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>{" "}
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="E.g, 'Clothes'"
                  required
                />
                <FieldError errors={[{ message: errors?.name }]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Description</FieldLabel>{" "}
                <Textarea
                  id="desc"
                  name="desc"
                  placeholder="Something about this category"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="parent">Parent (optional)</FieldLabel>{" "}
                <Select name="parent">
                  <SelectTrigger className="ml-auto w-[110px]">
                    <SelectValue placeholder="Select parent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {res.data.categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {/* <Field>
                <FieldLabel htmlFor="name">Parent (optional)</FieldLabel>{" "}
                <CategorySelector className="w-full justify-between" />
              </Field> */}
            </div>
          </div>
          <DialogFooter className="p-6 py-3 border-t border-border ">
            <DialogClose asChild>
              <Button variant="outline" size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size={"sm"} disabled={isAddingCat}>
              {isAddingCat && <Spinner className="size-4" />}
              Create new
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CategorySelector({
  value,
  disabled,
  className,
}: {
  value?: Category;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<Category>();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name="category" value={cat?.id} />

      <PopoverTrigger disabled={disabled} asChild>
        <Button variant="outline" className={cn(className, "bg-card ")}>
          {cat?.name || "Select category..."}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command>
          <CommandInput placeholder="Select parent category..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup className="overflow-y-auto">
              {catData.map((r) => (
                <CommandItem
                  key={r.id}
                  id={r.id}
                  onSelect={() => {
                    (setCat(r), setOpen(false));
                  }}
                  value={r.name}
                  className={"teamaspace-y-1 px-4 py-2"}
                >
                  <div className="flex flex-col items-start ">
                    <p>{r.name}</p>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      r?.id === cat?.id ? "opacity-100" : "opacity-0",
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
