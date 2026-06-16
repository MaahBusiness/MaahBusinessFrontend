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

export const rolesMini: {
  value: string;
  label: string;
}[] = [
  { value: "cashier", label: "Cashier" },
  {
    value: "stock_keeper",
    label: "Stock Keeper",
  },
  {
    value: "manager",
    label: "Manager",
  },
  { value: "owner", label: "Owner" },
];

export const roles: {
  id: Role;
  label: string;
  desc?: string;
}[] = [
  { id: "cashier", label: "Cashier", desc: "Can view and comment." },
  {
    id: "stock_keeper",
    label: "Stock Keeper",
    desc: "Can view, comment and edit.",
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Can view, comment and manage billing.",
  },
  { id: "owner", label: "Owner", desc: "Admin-level access to all resources." },
];

export const visibles = [
  { value: "id", label: "ID" },
  { value: "joined", label: "Date Joined" },
  { value: "left", label: "Date Left" },
];
