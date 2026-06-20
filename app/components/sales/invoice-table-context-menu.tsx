import { useState } from "react";
import { EditInvoiceDrawer } from "@/components/sales/invoice-edit-drawer";
import { InvoicePaymentFormContent } from "@/components/sales/single-invoice-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import type { Cell } from "@tanstack/react-table";
import { Archive, Copy, Edit, Eye, Trash2, Trash2Icon, Wallet } from "lucide-react";
import { useNavigation } from "react-router";
import { toast } from "sonner";
import type { Invoice, TableContextMenuProps } from "types";
import { hasPermission } from "utils/permissions";
import {
  canArchiveInvoice,
  canRecordInvoicePayment,
  invoiceHasOutstandingBalance,
} from "utils/permissions";

export function InvoiceTableContextMenu({
  cell: c,
  className,
  children,
  title,
}: TableContextMenuProps<Invoice>) {
  const { businessMember, archiveInvoice, isArchivingInvoice } =
    useOrganisation();
  const navigation = useNavigation();
  const [payOpen, setPayOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const cell = c as Cell<Invoice, unknown>;
  const invoice = cell.row.original;
  const val = cell.getValue() as string | number | undefined;
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

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => toast.success("Copied successfully!"),
    onError: () => toast.error("Copy was unsuccessful"),
  });

  const handleCopyCell = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(`${val}`);
  };
  const handleCopyRow = () => {
    if (clipboard.isCopying) return;
    clipboard.copy(JSON.stringify(invoice));
  };

  const handleArchiveInvoice = () => archiveInvoice(invoice.id);

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='checkbox'], input, label")) return;
    setViewOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <Drawer direction="right">
          <AlertDialog>
            <ContextMenuTrigger
              title={title}
              className={cn(
                "flex h-full w-full max-w-xs cursor-pointer items-center justify-start gap-2 px-4",
                className,
              )}
              onClick={handleRowClick}
            >
              {children}
            </ContextMenuTrigger>

            <ContextMenuContent>
              <ContextMenuGroup>
                <ContextMenuItem
                  className="px-1.5 py-1 text-xs"
                  onClick={() => setViewOpen(true)}
                >
                  View invoice
                  <ContextMenuShortcut>
                    <Eye className="size-3" />
                  </ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  className="px-1.5 py-1 text-xs"
                  onClick={handleCopyCell}
                >
                  Copy cell
                  <ContextMenuShortcut>
                    <Copy className="size-3" />
                  </ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  className="px-1.5 py-1 text-xs"
                  onClick={handleCopyRow}
                >
                  Copy row
                  <ContextMenuShortcut>
                    <Copy className="size-3" />
                  </ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuGroup>
              {canEdit && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <DrawerTrigger asChild>
                      <ContextMenuItem className="px-1.5 py-1 text-xs">
                        Edit invoice
                        <ContextMenuShortcut>
                          <Edit className="size-3" />
                        </ContextMenuShortcut>
                      </ContextMenuItem>
                    </DrawerTrigger>
                  </ContextMenuGroup>
                </>
              )}
              {canPay && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <ContextMenuItem
                      className="px-1.5 py-1 text-xs"
                      onClick={() => setPayOpen(true)}
                    >
                      Record payment
                      <ContextMenuShortcut>
                        <Wallet className="size-3 text-amber-600" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </>
              )}
              {canArchive && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <AlertDialogTrigger asChild>
                      <ContextMenuItem
                        className="px-1.5 py-1 text-xs"
                        variant="destructive"
                      >
                        {isCashier ? "Remove invoice" : "Archive invoice"}
                        <ContextMenuShortcut>
                          {isCashier ? (
                            <Trash2 className="size-3 text-destructive" />
                          ) : (
                            <Archive className="size-3 text-destructive" />
                          )}
                        </ContextMenuShortcut>
                      </ContextMenuItem>
                    </AlertDialogTrigger>
                  </ContextMenuGroup>
                </>
              )}
            </ContextMenuContent>

            <EditInvoiceDrawer data={invoice} />

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
        </Drawer>
      </ContextMenu>

      <InvoiceReceiptDialog
        invoiceId={invoice.id}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="!max-w-sm p-0">
          <InvoicePaymentFormContent
            id={invoice.id}
            number={invoice.number}
            max={invoice.remaining_amount}
            isLoading={!!isPaying}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
