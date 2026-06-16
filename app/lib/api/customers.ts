import { apiClient } from "@/lib/api-client";
import type {
  Client,
  ClientCreateParams,
  ClientFilters,
  ClientUpdateParams,
  Credit,
  CreditCreateParams,
  Payment,
  PaymentMethod,
} from "types";
import { buildQueryParams, cleanPayload } from "utils";
import { CLIENT_URL, CUSTOMERS_URL } from "utils/endpoints";

export type CustomerCreateParams = ClientCreateParams;

export const customersApi = {
  list: (token: string, businessId: string, filters?: ClientFilters) => {
    const query = buildQueryParams({ business_id: businessId, ...filters });
    return apiClient.get<Client[]>(`${CLIENT_URL}${query}`, token);
  },
  getById: (token: string, id: string) =>
    apiClient.get<Client>(CLIENT_URL + id, token),
  create: (token: string, data: ClientCreateParams) =>
    apiClient.post<Client>(CLIENT_URL, token, cleanPayload(data)),
  update: (token: string, id: string, data: ClientUpdateParams) =>
    apiClient.put<Client>(CLIENT_URL + id, token, cleanPayload(data)),
  remove: (token: string, id: string) =>
    apiClient.delete<undefined>(CLIENT_URL + id, token),
  credit: (token: string, id: string, data: CreditCreateParams) =>
    apiClient.post<Credit>(CLIENT_URL + id + "credit", token, cleanPayload(data)),
  payCredit: (
    token: string,
    id: string,
    data: {
      amount: number;
      payment_method: PaymentMethod;
      notes?: string;
      payment_date?: string;
    },
  ) => apiClient.post<Payment[]>("/customers/credit/" + id + "/pay/", token, data),
  getCreditPayments: (token: string, id: string) =>
    apiClient.get<Payment[]>("/customers/credit/" + id + "/payments/", token),
  // Legacy alias
  listLegacy: (token: string, businessId: string) =>
    apiClient.get<Client[]>(`${CUSTOMERS_URL}?business_id=${businessId}`, token),
};
