export {
  requireAuthLoader,
  requireManagerLoader,
  guestOnlyLoader,
  getCachedUser,
  isAuthenticated,
} from "./authLoader";
export type { AuthLoaderData } from "./authLoader";

export { productsLoader } from "./productLoader";
export type { ProductsLoaderData } from "./productLoader";

export { categoryLoader } from "./categoryLoader";
export type { CategoryLoaderData } from "./categoryLoader";

export { invoiceLoader, archivedInvoicesLoader } from "./invoiceLoader";
export type {
  InvoiceLoaderData,
  ArchivedInvoicesLoaderData,
} from "./invoiceLoader";

export { dashboardLoader } from "./dashboardLoader";
export type { DashboardLoaderData } from "./dashboardLoader";
