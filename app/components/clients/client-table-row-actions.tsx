import { type Row } from "@tanstack/react-table";
import type { Client } from "types";
import { ClientItemActions } from "@/components/clients/client-item-actions";

interface ClientTableRowActionsProps {
  row: Row<Client>;
}

export function ClientTableRowActions({ row }: ClientTableRowActionsProps) {
  return (
    <div className="flex h-9 items-center px-1">
      <ClientItemActions client={row.original} compact />
    </div>
  );
}
