import { Circle, HelpCircle } from "lucide-react";
import type { Role } from "types";

export const statuses = [
  {
    value: "true",
    label: "Active",
    icon: HelpCircle,
  },
  {
    value: "false",
    label: "Inactive",
    icon: Circle,
  },
];

export const roles: {
  value: Role;
  label: string;
  desc?: string;
}[] = [
  { value: "cashier", label: "Cashier" },
  { value: "stock_keeper", label: "Stock Keeper" },
  { value: "manager", label: "Manager" },
  { value: "owner", label: "Owner" },
];
