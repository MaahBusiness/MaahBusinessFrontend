import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportsApi, type ReportFormat, type ReportType } from "@/lib/api/reports";
import type { DashboardDateFilters } from "@/lib/dashboard-types";
import { toast } from "sonner";

const REPORT_TYPES: { id: ReportType; label: string; desc: string }[] = [
  { id: "sales", label: "Sales report", desc: "Revenue, invoices & payments" },
  { id: "inventory", label: "Inventory report", desc: "Stock levels & valuation" },
  { id: "stock", label: "Stock movements", desc: "Entries, exits & adjustments" },
];

export function DashboardReportsPanel({
  orgId,
  accessToken,
  filters,
}: {
  orgId: string;
  accessToken: string;
  filters: DashboardDateFilters;
}) {
  const [loading, setLoading] = useState<ReportType | null>(null);

  const generate = async (reportType: ReportType, format: ReportFormat) => {
    setLoading(reportType);
    try {
      const res = await reportsApi.generate(accessToken, {
        business_id: orgId,
        report_type: reportType,
        output_format: format,
        ...filters,
      });
      if (res.success) {
        toast.success(`${reportType} report generation started.`);
      } else {
        toast.error(res.message || "Could not generate report.");
      }
    } catch {
      toast.error("Report generation failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {REPORT_TYPES.map((report) => (
        <Card
          key={report.id}
          className="border-violet-500/15 bg-card/80 backdrop-blur-sm"
        >
          <CardHeader>
            <CardTitle className="text-base">{report.label}</CardTitle>
            <CardDescription>{report.desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={loading === report.id}
              onClick={() => generate(report.id, "pdf")}
            >
              {loading === report.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4 text-rose-600" />
              )}
              Download PDF
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-muted-foreground"
              disabled={loading === report.id}
              onClick={() => generate(report.id, "word")}
            >
              <FileDown className="size-4" />
              Download Word
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
