import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react";
import type { Role } from "types";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

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

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
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
