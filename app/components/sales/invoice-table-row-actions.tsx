import { type Row } from "@tanstack/react-table";
import {
  Archive,
  Copy,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Trash2Icon,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { InvoiceReceiptDialog } from "@/components/sales/invoice-receipt-dialog";
import { useNavigation } from "react-router";

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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Invoice } from "types";
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
import {
  canArchiveInvoice,
  canRecordInvoicePayment,
  invoiceHasOutstandingBalance,
} from "utils/permissions";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/useClipboard";
import { Spinner } from "@/components/ui/spinner";
import { EditInvoiceDrawer } from "@/components/sales/invoice-edit-drawer";
import { InvoicePaymentFormContent } from "@/components/sales/single-invoice-actions";

interface InvoiceTableRowActionsProps {
  row: Row<Invoice>;
}

export function InvoiceTableRowActions({ row }: InvoiceTableRowActionsProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const { businessMember, isLoading, archiveInvoice, isArchivingInvoice } =
    useOrganisation();
  const navigation = useNavigation();
  const invoice = row.original;
  const isCashier = businessMember?.role === "cashier";
  const canPay =
    canRecordInvoicePayment(businessMember?.role) &&
    invoiceHasOutstandingBalance(invoice);
  const canArchive = canArchiveInvoice(businessMember?.role);
  const canEdit = hasPermission(businessMember?.role, "invoice:create");

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isPaying =
    isSubmitting &&
    intent === "credit-invoice" &&
    navigation.formData?.get("invId") === invoice.id;

  if (isLoading || !businessMember) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        className="mr-4 h-7 w-6 rounded-sm p-0"
        disabled
        aria-hidden
      />
    );
  }

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(invoice));
  };

  const handleArchiveInvoice = () => archiveInvoice(invoice.id);

  return (
    <div className="flex items-center justify-end gap-1 pr-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="h-7 w-7 shrink-0"
        title="View invoice"
        onClick={() => setViewOpen(true)}
      >
        <Eye className="size-3.5" />
        <span className="sr-only">View</span>
      </Button>

      <InvoiceReceiptDialog
        invoiceId={invoice.id}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      {canPay && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="h-7 w-7 shrink-0"
              title="Record payment"
            >
              <Wallet className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span className="sr-only">Record payment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-sm p-0">
            <InvoicePaymentFormContent
              id={invoice.id}
              number={invoice.number}
              max={invoice.remaining_amount}
              isLoading={!!isPaying}
            />
          </DialogContent>
        </Dialog>
      )}

      {canArchive && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="h-7 w-7 shrink-0"
              title={isCashier ? "Remove invoice" : "Archive invoice"}
            >
              {isCashier ? (
                <Trash2 className="size-3.5 text-destructive" />
              ) : (
                <Archive className="size-3.5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {isCashier ? "Remove invoice" : "Archive invoice"}
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                {isCashier ? <Trash2Icon /> : <Archive />}
              </AlertDialogMedia>
              <AlertDialogTitle>
                {isCashier ? "Remove" : "Archive"} Invoice #{invoice.number}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This invoice will be moved to archives and hidden from active
                lists.
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
                }}
              >
                {isArchivingInvoice && <Spinner />}
                {isCashier ? "Remove" : "Archive"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Drawer direction="right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="flex h-7 w-6 rounded-sm p-0 data-[state=open]:bg-muted"
            >
              <MoreVertical className="size-3" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy row
                <DropdownMenuShortcut>
                  <Copy className="size-3" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DrawerTrigger asChild>
                    <DropdownMenuItem className="text-xs px-1.5 py-1">
                      Edit invoice
                      <DropdownMenuShortcut>
                        <Edit className="size-3" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DrawerTrigger>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <EditInvoiceDrawer data={invoice} />
      </Drawer>
    </div>
  );
}
