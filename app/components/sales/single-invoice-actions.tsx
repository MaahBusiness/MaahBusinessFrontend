import {
  Archive,
  ArchiveRestore,
  BadgePlus,
  CircleSlash,
  Copy,
  Download,
  Edit3,
  MoreVertical,
  RotateCcw,
  Trash2,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Invoice, ServerActionState } from "types";
import { useOrganisation } from "@/hooks/use-organisation";
import {
  AlertDialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { hasPermission } from "utils/permissions";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/useClipboard";
import { EditInvoiceDrawer } from "@/components/sales/invoice-edit-drawer";
import { Spinner } from "@/components/ui/spinner";
import { formatDisplayAmount, genericErrorState } from "utils";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldTitle,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { methods } from "@/routes/dashboard/sales/data";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DialogTrigger } from "@radix-ui/react-dialog";

export function SingleInvoiceActions({ data }: { data: Invoice }) {
  const {
    businessMember,
    removeinvoice,
    archiveInvoice,
    cancelInvoice,
    isRemovinginvoice,
    isArchivingInvoice,
    isCancellingInvoice,
    generateReceipt,
  } = useOrganisation();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();

  if (!businessMember) redirect("/dashboard/organisations/");

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const { refetch, isFetching } = generateReceipt(data.id);
  const [open, setOpen] = useState<
    "delete" | "archive" | "cancel" | "refund" | "credit"
  >();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isCrediting = isSubmitting && intent === "credit-invoice";
  const isRefunding = isSubmitting && intent === "refund";

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(data));
  };

  const handlePrintInvoice = async () => {
    const { data, error } = await refetch();

    if (error) {
      toast.error(genericErrorState().message);
      return;
    }

    if (!data?.blob) {
      toast.error(data?.message);
      return;
    }

    console.log(data.data);

    // const blob = await data.blob;
    const url = URL.createObjectURL(data.blob);
    window.open(url);
    toast.success("Receipt has been generated successfully", {
      description: "Your receipt is ready for download",
      action: {
        label: "Download",
        onClick: () => redirect(url),
      },
    });
    // win?.addEventListener("load", () => {
    //   win.print();
    // });
  };
  const handleDeleteInvoice = () => removeinvoice(data.id);
  const handleArchiveInvoice = () => archiveInvoice(data.id);
  const handleCancelInvoice = () => cancelInvoice(data.id);

  return (
    <Dialog>
      <div className="flex items-center gap-2">
        <Button onClick={handlePrintInvoice} disabled={isFetching}>
          {isFetching ? <Spinner /> : <Download className="size-4" />}
          Generate Receipt
        </Button>

        {hasPermission(businessMember?.role, "invoice:create") ? (
          data.remaining_amount > 0 ? (
            <DialogTrigger asChild>
              <Button variant={"outline"} onClick={() => setOpen("credit")}>
                <BadgePlus className="size-4" />
                Credit
              </Button>
            </DialogTrigger>
          ) : data.refund_amount > 0 ? (
            <DialogTrigger asChild disabled>
              <Button
                variant={"outline"}
                onClick={() => setOpen("refund")}
                disabled
              >
                <RotateCcw className="size-4" />
                Refund
              </Button>
            </DialogTrigger>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}

        <Drawer direction="right">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size={"icon"}
                  className="flex rounded-sm p-0 data-[state=open]:bg-muted mr-4"
                >
                  <MoreVertical className="size-3" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              {/* Dropdown Content */}
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-xs px-1.5 py-1"
                    onClick={handleCopyRow}
                  >
                    Copy data
                    <DropdownMenuShortcut>
                      <Copy className="size-3" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  {hasPermission(businessMember?.role, "invoice:create") && (
                    <DrawerTrigger asChild>
                      <DropdownMenuItem className="text-xs px-1.5 py-1">
                        Update invoice
                        <DropdownMenuShortcut>
                          <Edit3 className="size-3" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DrawerTrigger>
                  )}
                </DropdownMenuGroup>

                {hasPermission(businessMember?.role, "invoice:delete") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-xs px-1.5 py-1"
                          variant="destructive"
                          onClick={() => setOpen("cancel")}
                        >
                          Cancel invoice
                          <DropdownMenuShortcut>
                            <CircleSlash className="size-3 text-destructive" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>

                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-xs px-1.5 py-1"
                          variant="destructive"
                          onClick={() => setOpen("archive")}
                        >
                          Archive invoice
                          <DropdownMenuShortcut>
                            <Archive className="size-3 text-destructive" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>

                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-xs px-1.5 py-1"
                          variant="destructive"
                          onClick={() => setOpen("delete")}
                        >
                          Delete invoice
                          <DropdownMenuShortcut>
                            <Trash2 className="size-3 text-destructive" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <EditInvoiceDrawer data={data} />

            <AlertDialogContent size="sm">
              {open === "delete" && (
                <DeleteDialogContent
                  number={data.number}
                  {...{ handleDeleteInvoice, isRemovinginvoice }}
                />
              )}
              {open === "archive" && (
                <ArchiveDialogContent
                  number={data.number}
                  {...{ handleArchiveInvoice, isArchivingInvoice }}
                />
              )}
              {open === "cancel" && (
                <CancelDialogContent
                  number={data.number}
                  {...{ handleCancelInvoice, isCancellingInvoice }}
                />
              )}
            </AlertDialogContent>
          </AlertDialog>
        </Drawer>

        <DialogContent id="dial" className="!max-w-sm p-0">
          {open === "credit" && (
            <CreditContent
              number={data.number}
              id={data.id}
              max={data.remaining_amount}
              isLoading={isCrediting}
            />
          )}
          {open === "refund" && (
            <RefundContent
              number={data.number}
              id={data.id}
              max={data.refund_amount}
              isLoading={isRefunding}
            />
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
}

export function SingleArchivedActions({ data }: { data: Invoice }) {
  const {
    businessMember,
    removeinvoice,
    isRemovinginvoice,
    generateReceipt,
    unArchiveInvoice,
    isunArchivingInvoice,
  } = useOrganisation();

  if (!businessMember) redirect("/dashboard/organisations/");

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const { refetch, isFetching } = generateReceipt(data.id);
  const [open, setOpen] = useState<"delete" | "unarchive">();

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(data));
  };

  const handlePrintInvoice = async () => {
    const { data, error } = await refetch();

    if (error) {
      toast.error(genericErrorState().message);
      return;
    }

    if (!data?.blob) {
      toast.error(data?.message);
      return;
    }

    const blob = await data.blob;
    const url = URL.createObjectURL(blob);
    window.open(url);
    toast.error("Receipt has been generated successfully");
    // win?.addEventListener("load", () => {
    //   win.print();
    // });
  };
  const handleDeleteInvoice = () => removeinvoice(data.id);
  const handleUnarchiveInvoice = () => unArchiveInvoice(data.id);

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handlePrintInvoice} disabled={isFetching}>
        {isFetching ? <Spinner /> : <Download className="size-4" />}
        Generate Receipt
      </Button>

      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={"icon"}
              className="flex rounded-sm p-0 data-[state=open]:bg-muted mr-4"
            >
              <MoreVertical className="size-3" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          {/* Dropdown Content */}
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy data
                <DropdownMenuShortcut>
                  <Copy className="size-3" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {hasPermission(businessMember?.role, "invoice:delete") && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-xs px-1.5 py-1"
                      onClick={() => setOpen("unarchive")}
                    >
                      Unarchive invoice
                      <DropdownMenuShortcut>
                        <ArchiveRestore className="size-3" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-xs px-1.5 py-1"
                      variant="destructive"
                      onClick={() => setOpen("delete")}
                    >
                      Delete invoice
                      <DropdownMenuShortcut>
                        <Trash2 className="size-3 text-destructive" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent size="sm">
          {open === "delete" && (
            <DeleteDialogContent
              number={data.number}
              {...{ handleDeleteInvoice, isRemovinginvoice }}
            />
          )}
          {open === "unarchive" && (
            <UnArchiveDialogContent
              isUnarchiving={isunArchivingInvoice}
              number={data.number}
              {...{ handleUnarchiveInvoice }}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeleteDialogContent({
  handleDeleteInvoice,
  number,
  isRemovinginvoice,
}: {
  number: number;
  isRemovinginvoice: boolean;
  handleDeleteInvoice: () => void;
}) {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="text-destructive">
          <Trash2Icon />
        </AlertDialogMedia>
        <AlertDialogTitle>Remove {number} permanently?</AlertDialogTitle>
        <AlertDialogDescription className="py-2">
          This invoice will be permanently deleted and cannot be recovered. All
          related payments will be lost.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={isRemovinginvoice}
          onClick={(e) => {
            e.preventDefault();
            handleDeleteInvoice();
            // return true;
          }}
        >
          {isRemovinginvoice && <Spinner />}
          Remove
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

function ArchiveDialogContent({
  handleArchiveInvoice,
  number,
  isArchivingInvoice,
}: {
  number: number;
  isArchivingInvoice: boolean;
  handleArchiveInvoice: () => void;
}) {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="text-destructive">
          <Archive />
        </AlertDialogMedia>
        <AlertDialogTitle>Archive Invoice #{number}?</AlertDialogTitle>
        <AlertDialogDescription className="py-2">
          This invoice will be moved to archives and hidden from active lists.
          You can restore it later.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={isArchivingInvoice}
          onClick={(e) => {
            e.preventDefault();
            handleArchiveInvoice();
            // return true;
          }}
        >
          {isArchivingInvoice && <Spinner />}
          Archive
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

function UnArchiveDialogContent({
  number,
  handleUnarchiveInvoice,
  isUnarchiving,
}: {
  number: number;
  handleUnarchiveInvoice: () => void;
  isUnarchiving: boolean;
}) {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <Archive />
        </AlertDialogMedia>
        <AlertDialogTitle>Unarchive Invoice #{number}?</AlertDialogTitle>
        <AlertDialogDescription className="py-2">
          This invoice will be removed from archives back to active lists.{" "}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          disabled={isUnarchiving}
          onClick={(e) => {
            e.preventDefault();
            handleUnarchiveInvoice();
            // return true;
          }}
        >
          {isUnarchiving && <Spinner />}
          Unarchive
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

function CancelDialogContent({
  handleCancelInvoice,
  number,
  isCancellingInvoice,
}: {
  number: number;
  isCancellingInvoice: boolean;
  handleCancelInvoice: () => void;
}) {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="text-destructive">
          <CircleSlash />
        </AlertDialogMedia>
        <AlertDialogTitle>Cancel Invoice #{number}?</AlertDialogTitle>
        <AlertDialogDescription className="py-2">
          This will cancel the invoice and stop any further payments. This
          action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={isCancellingInvoice}
          onClick={(e) => {
            e.preventDefault();
            handleCancelInvoice();
            // return true;
          }}
        >
          {isCancellingInvoice && <Spinner />}
          Cancel
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

function CreditContent({
  id,
  number,
  max,
  isLoading,
}: {
  id: string;
  number: number;
  max: number;
  isLoading: boolean;
}) {
  const [amt, setAmt] = useState<string>();

  const handleAmtInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: typeof setAmt,
  ) => {
    const rawInput = e.target.value; // What the user typed
    setter(rawInput); // Update the input display value
  };

  return (
    <>
      <Form method="POST" action="">
        <input type="hidden" name="intent" value="credit-invoice" />
        <input type="hidden" name="invId" value={id} />

        <DialogHeader className="p-6 py-4 border-b border-border">
          <DialogTitle className="text-base">
            Apply credit to Invoice #{number}
          </DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <div className="flex flex-col gap-6 p-6 py-4">
            <Field>
              <FieldLabel htmlFor="method">Payment Method</FieldLabel>
              <div className="flex flex-col ">
                <Select name="method" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value={" "}>Select payment method</SelectItem> */}
                    {methods.map((m, i) => (
                      <SelectItem key={i} value={m.value}>
                        <span className="flex items-center gap-1">
                          <m.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {m.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Field>

            <Field>
              <div className="flex flex-col ">
                <FieldLabel htmlFor="Amount">Amount</FieldLabel>
                <FieldDescription className="text-xs">
                  Amount Due: {formatDisplayAmount(max)}
                </FieldDescription>
              </div>
              <div className="flex flex-col ">
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  // max={max}
                  value={amt}
                  onChange={(e) => handleAmtInputChange(e, setAmt)}
                  placeholder="e.g. 1,200"
                  required
                />
              </div>
            </Field>
          </div>
        </div>
        <DialogFooter className="p-6 py-3 border-t border-border">
          <DialogClose asChild>
            <Button variant="outline" size={"sm"}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size={"sm"} disabled={isLoading}>
            {isLoading && <Spinner className="size-4" />}
            Apply Credit
          </Button>
        </DialogFooter>
      </Form>
    </>
  );
}

function RefundContent({
  id,
  number,
  max,
  isLoading,
}: {
  id: string;
  max: number;
  number: number;
  isLoading: boolean;
}) {
  const [amt, setAmt] = useState<string>();

  const handleAmtInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: typeof setAmt,
  ) => {
    const rawInput = e.target.value; // What the user typed
    setter(rawInput); // Update the input display value
  };

  return (
    <>
      <Form method="POST">
        <input type="hidden" name="intent" value="refund" />
        <input type="hidden" name="invId" value={id} />

        <DialogHeader className="p-6 py-4 border-b border-border">
          <DialogTitle className="text-base">
            Process Refund for invoice #{number}
          </DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <div className="flex flex-col gap-6 p-6 py-4">
            <Field>
              <div className="flex flex-col ">
                <FieldLabel htmlFor="Amount">Amount</FieldLabel>
                <FieldDescription className="text-xs">
                  Refund Amount: {formatDisplayAmount(max)}
                </FieldDescription>
              </div>
              <div className="flex flex-col ">
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  max={max}
                  value={amt}
                  onChange={(e) => handleAmtInputChange(e, setAmt)}
                  placeholder="e.g. 1,200"
                  required
                />
              </div>
            </Field>

            <Field>
              <div className="flex flex-col ">
                <FieldLabel htmlFor="reason">Reason</FieldLabel>
              </div>
              <div className="flex flex-col ">
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Reason for the refund"
                  required
                />
                {/* <FieldError errors={[{ message: errors?.reason }]} /> */}
              </div>
            </Field>

            <FieldLabel htmlFor="switch-restock" className="p-4 ">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Restore stock?</FieldTitle>
                  <FieldDescription className="text-xs">
                    Enable this when the refund was due to an error and all
                    items were recovered.
                  </FieldDescription>
                </FieldContent>
                <Switch id="switch-restock" name="restock" />
              </Field>
            </FieldLabel>
          </div>
        </div>
        <DialogFooter className="p-6 py-3 border-t border-border">
          <DialogClose asChild>
            <Button variant="outline" size={"sm"}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size={"sm"} disabled={isLoading}>
            {isLoading && <Spinner className="size-4" />}
            Process Refund
          </Button>
        </DialogFooter>
      </Form>
    </>
  );
}
