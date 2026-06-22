import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { ProductFormFields } from "@/components/products/product-form-fields";
import { ProductFormActionAlert } from "@/components/products/product-form-action-alert";
import { useCloseDrawerOnActionSuccess } from "@/hooks/use-close-drawer-on-action-success";
import type { Product, ServerActionState } from "types";
import { cn } from "@/lib/utils";

type AddProductDrawerProps = {
  triggerClassName?: string;
};

export function AddProductDrawer({ triggerClassName }: AddProductDrawerProps) {
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();
  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-product";
  const [open, setOpen] = useState(false);

  useCloseDrawerOnActionSuccess(open, setOpen, "add-product");

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerTrigger asChild>
        <Button
          size="sm"
          disabled={isAdding}
          className={cn("auth-submit-btn gap-2 border-0", triggerClassName)}
        >
          {isAdding ? (
            <Spinner className="size-4" />
          ) : (
            <PackagePlus className="size-4" />
          )}
          New product
          </Button>
        </DrawerTrigger>

      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl">
          <Form
            method="POST"
            encType="multipart/form-data"
          className="flex h-full flex-col"
          key={open ? "add-product-open" : "add-product-closed"}
        >
              <input type="hidden" name="intent" value="add-product" />

          <DrawerHeader className="border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent px-6 py-5">
            <div className="flex items-center gap-2 text-violet-600">
              <PackagePlus className="size-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Catalog
              </span>
            </div>
            <DrawerTitle className="text-lg">Add a new product</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details below. Required fields are marked.
            </p>
          </DrawerHeader>

          <div className="relative flex-1 overflow-y-auto bg-muted/10">
            <ProductFormActionAlert actionData={actionData} />
            <ProductFormFields mode="add" errors={errors} />
          </div>

          <DrawerFooter className="border-t border-border bg-background/95 px-6 py-4">
              <DrawerClose asChild>
              <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
            <Button
              type="submit"
              disabled={isAdding}
              className="auth-submit-btn border-0"
            >
              {isAdding && <Spinner className="size-4" />}
              Save product
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>
  );
}
