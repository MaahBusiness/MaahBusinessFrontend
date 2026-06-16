import { EditInvoiceDrawer } from "@/components/sales/invoice-edit-drawer";
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
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";
import type { Cell } from "@tanstack/react-table";
import { Copy, Edit, Trash2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Invoice, TableContextMenuProps } from "types";
import { hasPermission } from "utils/permissions";

export function InvoiceTableContextMenu({
  cell: c,
  className,
  children,
  title,
}: TableContextMenuProps<Invoice>) {
  const { businessMember, archiveInvoice, isArchivingInvoice } =
    useOrganisation();

  const cell = c as Cell<Invoice, any>;

  const val = cell.getValue() as string | number | undefined;

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
    clipboard.copy(JSON.stringify(cell.row.original));
  };

  const handleArchiveInvoice = () => archiveInvoice(cell.row.original.id);

  return (
    <ContextMenu>
      <Drawer direction="right">
        <AlertDialog>
          <ContextMenuTrigger
            title={title}
            className={cn(
              "flex h-full w-full max-w-xs items-center justify-start gap-2 px-4",
              className,
            )}
          >
            {children}
          </ContextMenuTrigger>

          {/* Context Menu */}
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyCell}
              >
                Copy cell
                <ContextMenuShortcut>
                  <Copy className="size-3" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                className="text-xs px-1.5 py-1"
                onClick={handleCopyRow}
              >
                Copy row
                <ContextMenuShortcut>
                  <Copy className="size-3" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
            {hasPermission(businessMember?.role, "products:crud") && (
              <>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <DrawerTrigger asChild>
                    <ContextMenuItem className="text-xs px-1.5 py-1">
                      Edit row
                      <ContextMenuShortcut>
                        <Edit className="size-3" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                  </DrawerTrigger>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuItem
                    className="text-xs px-1.5 py-1"
                    variant="destructive"
                  >
                    Archive row
                    <ContextMenuShortcut>
                      <Trash2 className="size-3 text-destructive" />
                    </ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuGroup>
              </>
            )}
          </ContextMenuContent>

          {/* Drawer Content */}
          <EditInvoiceDrawer data={cell.row.original} />

          {/* Alert Dialog */}
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                Archive Invoice #{cell.row.original.number}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This invoice will be moved to archives and hidden from active
                lists. You can restore it later.
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
          </AlertDialogContent>
        </AlertDialog>
      </Drawer>
    </ContextMenu>
  );
}
