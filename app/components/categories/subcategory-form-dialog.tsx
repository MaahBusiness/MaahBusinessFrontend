import { useState } from "react";
import { Layers } from "lucide-react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganisation } from "@/hooks/use-organisation";
import type { ServerActionState } from "types";
import { cn } from "@/lib/utils";
import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";

type SubcategoryFormDialogProps = {
  triggerClassName?: string;
  defaultCategoryId?: string;
  triggerLabel?: string;
};

export function SubcategoryFormDialog({
  triggerClassName,
  defaultCategoryId,
  triggerLabel,
}: SubcategoryFormDialogProps) {
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const { organisation: res } = useOrganisation();
  const errors = actionData?.errors;

  const categories = res?.data?.categories ?? [];
  const hasCategories = categories.length > 0;
  const [parentId, setParentId] = useState(defaultCategoryId ?? "");

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-subcategory";
  const [open, setOpen] = useState(false);

  useCloseOnActionSuccess(open, () => setOpen(false), "add-subcategory", () =>
    setParentId(defaultCategoryId ?? ""),
  );

  if (!res?.data) throw redirect("/dashboard/organisations");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={!hasCategories || isAdding}
          className={cn("gap-2", triggerClassName)}
          title={!hasCategories ? "Create a category first" : undefined}
        >
          {isAdding ? (
            <Spinner className="size-4" />
          ) : (
            <Layers className="size-4" />
          )}
          <span className={cn(!triggerLabel && "hidden sm:inline")}>
            {triggerLabel ?? "New subcategory"}
          </span>
          {!triggerLabel && <span className="sm:hidden">Subcategory</span>}
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-4 max-h-[90dvh] w-[calc(100%-2rem)] gap-0 overflow-y-auto p-0 sm:mx-auto sm:max-w-md">
        <Form method="POST" key={open ? "open" : "closed"}>
          <input type="hidden" name="intent" value="add-subcategory" />
          <input type="hidden" name="parent" value={parentId} />

          <DialogHeader className="border-b border-teal-500/20 bg-teal-500/5 px-6 py-4">
            <div className="mb-1 flex items-center gap-2">
              <Layers className="size-4 text-teal-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">
                Subcategory
              </span>
            </div>
            <DialogTitle>Create subcategory</DialogTitle>
            <DialogDescription>
              Pick a parent category, then name and describe the subcategory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <Field>
              <FieldLabel htmlFor="parent">Parent category</FieldLabel>
              <Select
                value={parentId}
                onValueChange={setParentId}
                required
              >
                <SelectTrigger id="parent" className="w-full">
                  <SelectValue placeholder="Select a category…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[{ message: errors?.parent }]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="sub-name">Name</FieldLabel>
              <Input
                id="sub-name"
                name="name"
                placeholder="e.g. Soft drinks"
                required
              />
              <FieldError errors={[{ message: errors?.name }]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="sub-desc">Description</FieldLabel>
              <Textarea
                id="sub-desc"
                name="desc"
                placeholder="What products belong here?"
                rows={3}
                required
              />
            </Field>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isAdding || !parentId} className="auth-submit-btn border-0">
              {isAdding && <Spinner className="size-4" />}
              Create subcategory
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
