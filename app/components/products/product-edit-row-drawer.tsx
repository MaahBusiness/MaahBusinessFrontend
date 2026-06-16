import { useState } from "react";
import { Pencil } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { ProductFormFields } from "@/components/products/product-form-fields";
import { ProductFormActionAlert } from "@/components/products/product-form-action-alert";
import { useCloseDrawerOnActionSuccess } from "@/hooks/use-close-drawer-on-action-success";
import type { Product, ServerActionState } from "types";

export function EditProductDrawer({
  data,
  open,
  onOpenChange,
}: {
  data: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();
  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isUpdating = isSubmitting && intent === "update-product";

  useCloseDrawerOnActionSuccess(open, onOpenChange, "update-product");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <Form
          method="POST"
          encType="multipart/form-data"
          className="flex h-full flex-col"
          key={open ? `edit-${data.id}` : "edit-closed"}
        >
          <input type="hidden" name="intent" value="update-product" />
          <input type="hidden" name="id" value={data.id} />

          <DrawerHeader className="border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-violet-500/5 to-transparent px-6 py-5">
            <div className="flex items-center gap-2 text-blue-600">
              <Pencil className="size-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Edit product
              </span>
            </div>
            <DrawerTitle className="truncate text-lg">{data.name}</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Update pricing, stock, or classification.
            </p>
          </DrawerHeader>

          <div className="relative flex-1 overflow-y-auto bg-muted/10">
            <ProductFormActionAlert actionData={actionData} />
            <ProductFormFields mode="edit" data={data} errors={errors} />
          </div>

          <DrawerFooter className="border-t border-border bg-background/95 px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              disabled={isUpdating}
              className="auth-submit-btn border-0"
            >
              {isUpdating && <Spinner className="size-4" />}
              Save changes
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

/** @deprecated Use EditProductDrawer with controlled open state */
export function EditProductDrawerLegacy({ data }: { data: Product }) {
  const [open, setOpen] = useState(true);
  return (
    <EditProductDrawer data={data} open={open} onOpenChange={setOpen} />
  );
}
