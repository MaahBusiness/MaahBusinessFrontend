import { apiClient } from "@/lib/api-client";
import type { OrganisationCustomers } from "types";
import { CUSTOMERS_URL } from "utils/endpoints";

export type CustomerCreateParams = {
  business_id: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  customer_type?: "REGULAR" | "WHOLESALER";
};

export const customersApi = {
  list: (token: string, businessId: string) =>
    apiClient.get<OrganisationCustomers[]>(
      `${CUSTOMERS_URL}?business_id=${businessId}`,
      token,
    ),
  create: (token: string, payload: CustomerCreateParams) =>
    apiClient.post<OrganisationCustomers>(CUSTOMERS_URL, token, payload),
};
