import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { Category, ServerActionState, Subcategory } from "types";
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

export default function EditDialog({ data }: { data: Category | Subcategory }) {
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const { organisation: res } = useOrganisation();

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const idUpdating = isSubmitting && intent === "update-category";

  React.useEffect(() => {
    if (intent === "update-category" && actionData?.success)
      toast.success(data.name + " " + " has been updated succesfully!");
  }, [actionData]);

  if (!res?.data) throw redirect("/dashboard/organisations");

  return (
    <>
      <DialogContent className="!max-w-sm p-0">
        <Form method="POST">
          <input type="hidden" name="intent" value="update-category" />
          <input type="hidden" name="cat_id" value={data.id} />

          <DialogHeader className="p-6 py-4 border-b border-border">
            <DialogTitle className="text-base">
              Update '{data.name}'
            </DialogTitle>
          </DialogHeader>
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="space-y-4 p-6 py-4">
              {"category_id" in data && (
                <Field>
                  <input type="hidden" name="parent" value={data.category_id} />
                  <FieldLabel htmlFor="parent">Parent</FieldLabel>{" "}
                  {/* <Input
                    id="name"
                    type="text"
                    name="name"
                    value={data.category_id}
                    disabled
                  /> */}
                  <Select
                    defaultValue={data.category_id}
                    name="parent"
                    disabled
                  >
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
                  <FieldDescription>This cannot be changed</FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>{" "}
                <Input id="name" type="text" name="name" value={data.name} />
                <FieldError errors={[{ message: errors?.name }]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Description</FieldLabel>{" "}
                <Textarea id="desc" name="desc" value={data.description} />
              </Field>
            </div>
          </div>
          <DialogFooter className="p-6 py-3 border-t border-border ">
            <DialogClose asChild>
              <Button variant="outline" size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size={"sm"} disabled={idUpdating}>
              {idUpdating && <Spinner className="size-4" />}
              Update
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </>
  );
}
