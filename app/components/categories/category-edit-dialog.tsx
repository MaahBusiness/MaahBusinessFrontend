import { Form, redirect, useActionData, useNavigation } from "react-router";
import { FolderTree, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { Category, ServerActionState, Subcategory } from "types";
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
import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";
import { cn } from "@/lib/utils";

export function CategoryEditDialog({
  data,
  open,
  onOpenChange,
}: {
  data: Category | Subcategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const { organisation: res } = useOrganisation();
  const errors = actionData?.errors;
  const isSub = "category_id" in data;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isUpdating = isSubmitting && intent === "update-category";

  useCloseOnActionSuccess(open, () => onOpenChange(false), "update-category");

  if (!res?.data) throw redirect("/dashboard/organisations");

  const parentName = isSub
    ? res.data.categories?.find((c) => c.id === data.category_id)?.name
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-h-[90dvh] w-[calc(100%-2rem)] gap-0 overflow-y-auto p-0 sm:mx-auto sm:max-w-md">
        <Form method="POST" key={open ? `edit-${data.id}` : "closed"}>
          <input type="hidden" name="intent" value="update-category" />
          <input type="hidden" name="cat_id" value={data.id} />
          {isSub && (
            <input type="hidden" name="parent" value={data.category_id} />
          )}

          <DialogHeader
            className={cn(
              "border-b px-6 py-4",
              isSub
                ? "border-teal-500/20 bg-teal-500/5"
                : "border-violet-500/20 bg-violet-500/5",
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              {isSub ? (
                <Layers className="size-4 text-teal-600" />
              ) : (
                <FolderTree className="size-4 text-violet-600" />
              )}
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  isSub ? "text-teal-600" : "text-violet-600",
                )}
              >
                {isSub ? "Subcategory" : "Category"}
              </span>
            </div>
            <DialogTitle>
              {isSub ? "Edit subcategory" : "Edit category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            {isSub && (
              <Field>
                <FieldLabel htmlFor={`parent-${data.id}`}>
                  Parent category
                </FieldLabel>
                <Select defaultValue={data.category_id} disabled>
                  <SelectTrigger id={`parent-${data.id}`} className="w-full">
                    <SelectValue placeholder={parentName} />
                  </SelectTrigger>
                  <SelectContent>
                    {res.data.categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Cannot be changed after creation
                </FieldDescription>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor={`edit-name-${data.id}`}>Name</FieldLabel>
              <Input
                id={`edit-name-${data.id}`}
                name="name"
                defaultValue={data.name}
                required
              />
              <FieldError errors={[{ message: errors?.name }]} />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-desc-${data.id}`}>
                Description
              </FieldLabel>
              <Textarea
                id={`edit-desc-${data.id}`}
                name="desc"
                defaultValue={data.description ?? ""}
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
            <Button
              type="submit"
              disabled={isUpdating}
              className="auth-submit-btn border-0"
            >
              {isUpdating && <Spinner className="size-4" />}
              Save changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use CategoryEditDialog with controlled open state */
export default function EditDialog({ data }: { data: Category | Subcategory }) {
  return (
    <CategoryEditDialog data={data} open={true} onOpenChange={() => {}} />
  );
}
