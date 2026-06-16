import { apiClient } from "@/lib/api-client";
import { REPORTS_URL } from "utils/endpoints";

export type ReportType = "sales" | "inventory" | "stock";
export type ReportFormat = "pdf" | "word";

export const reportsApi = {
  list: (token: string, businessId: string) =>
    apiClient.get(`${REPORTS_URL}?business_id=${businessId}`, token),
  generate: (
    token: string,
    params: {
      business_id: string;
      report_type: ReportType;
      output_format: ReportFormat;
      start_date?: string;
      end_date?: string;
    },
  ) => {
    const search = new URLSearchParams({
      business_id: params.business_id,
      report_type: params.report_type,
      output_format: params.output_format,
    });
    if (params.start_date) search.set("start_date", params.start_date);
    if (params.end_date) search.set("end_date", params.end_date);
    return apiClient.get(`${REPORTS_URL}generate/?${search.toString()}`, token);
  },
  getStatus: (token: string, reportId: string) =>
    apiClient.get(`${REPORTS_URL}${reportId}/status/`, token),
};
