import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
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
import type { ServerActionState } from "types";
import { cn } from "@/lib/utils";
import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";

type CategoryFormDialogProps = {
  triggerClassName?: string;
  variant?: "default" | "outline";
};

export function CategoryFormDialog({
  triggerClassName,
  variant = "default",
}: CategoryFormDialogProps) {
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-category";
  const [open, setOpen] = useState(false);

  useCloseOnActionSuccess(open, () => setOpen(false), "add-category");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={variant}
          disabled={isAdding}
          className={cn("gap-2", triggerClassName)}
        >
          {isAdding ? (
            <Spinner className="size-4" />
          ) : (
            <FolderPlus className="size-4" />
          )}
          <span className="hidden sm:inline">New category</span>
          <span className="sm:hidden">Category</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-4 max-h-[90dvh] w-[calc(100%-2rem)] gap-0 overflow-y-auto p-0 sm:mx-auto sm:max-w-md">
        <Form method="POST" key={open ? "open" : "closed"}>
          <input type="hidden" name="intent" value="add-category" />

          <DialogHeader className="border-b border-violet-500/20 bg-violet-500/5 px-6 py-4">
            <div className="mb-1 flex items-center gap-2">
              <FolderPlus className="size-4 text-violet-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                Category
              </span>
            </div>
            <DialogTitle>Create category</DialogTitle>
            <DialogDescription>
              A category groups your products (e.g. Clothes, Electronics).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <Field>
              <FieldLabel htmlFor="cat-name">Name</FieldLabel>
              <Input
                id="cat-name"
                name="name"
                placeholder="e.g. Beverages"
                required
                autoFocus
              />
              <FieldError errors={[{ message: errors?.name }]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-desc">Description</FieldLabel>
              <Textarea
                id="cat-desc"
                name="desc"
                placeholder="What does this category include?"
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
            <Button type="submit" disabled={isAdding} className="auth-submit-btn border-0">
              {isAdding && <Spinner className="size-4" />}
              Create category
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
