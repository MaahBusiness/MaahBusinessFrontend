import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDisplayAmount } from "utils";
import type { DashboardInsights } from "@/lib/dashboard-types";
import { format, parseISO } from "date-fns";

const revenueChartConfig = {
  total_revenue: { label: "Revenue", color: "hsl(262 83% 58%)" },
  profit: { label: "Profit", color: "hsl(142 71% 45%)" },
  total_expenses: { label: "Expenses", color: "hsl(25 95% 53%)" },
} satisfies ChartConfig;

const salesMixConfig = {
  complete: { label: "Paid", color: "hsl(217 91% 60%)" },
  credit: { label: "Credit", color: "hsl(280 67% 58%)" },
} satisfies ChartConfig;

const categoryChartConfig = {
  revenue: { label: "Revenue", color: "hsl(262 83% 58%)" },
} satisfies ChartConfig;

const salesPerformanceConfig = {
  paid: { label: "Paid sales", color: "hsl(217 91% 60%)" },
  credit: { label: "Credit sales", color: "hsl(280 67% 58%)" },
} satisfies ChartConfig;

const volumeConfig = {
  sales: { label: "Orders", color: "hsl(217 91% 60%)" },
} satisfies ChartConfig;

const profitAreaConfig = {
  gross: { label: "Gross profit", color: "hsl(142 71% 45%)" },
  net: { label: "Net profit", color: "hsl(189 94% 43%)" },
  expenses: { label: "Expenses", color: "hsl(25 95% 53%)" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "hsl(262 83% 58%)",
  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)",
  "hsl(25 95% 53%)",
  "hsl(330 81% 60%)",
  "hsl(189 94% 43%)",
];

function formatDayLabel(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d");
  } catch {
    return dateStr.slice(5, 10);
  }
}

export function RevenueTrendChart({
  dailyData,
}: {
  dailyData: DashboardInsights["daily_data"];
}) {
  const chartId = useId().replace(/:/g, "");
  const data = dailyData.map((d) => ({
    date: formatDayLabel(d.date),
    total_revenue: Number(d.total_revenue),
    profit: Number(d.net_profit || d.profit),
    total_expenses: Number(d.total_expenses),
    total_sales: d.total_sales,
  }));

  return (
    <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Revenue & profit trend</CardTitle>
        <CardDescription>Daily performance over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${chartId}-revenue`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id={`${chartId}-profit`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id={`${chartId}-expenses`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25 95% 53%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(25 95% 53%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatDisplayAmount(Number(value)),
                    revenueChartConfig[name as keyof typeof revenueChartConfig]?.label,
                  ]}
                />
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total_revenue"
              stroke="var(--color-total_revenue)"
              fill={`url(#${chartId}-revenue)`}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              fill={`url(#${chartId}-profit)`}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="total_expenses"
              stroke="var(--color-total_expenses)"
              fill={`url(#${chartId}-expenses)`}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function SalesVolumeChart({
  dailyData,
}: {
  dailyData: DashboardInsights["daily_data"];
}) {
  const chartId = useId().replace(/:/g, "");
  const data = dailyData.map((d) => ({
    date: formatDayLabel(d.date),
    sales: d.total_sales,
  }));

  return (
    <Card className="border-blue-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily orders</CardTitle>
        <CardDescription>Invoice count per day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={volumeConfig} className="h-[160px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${chartId}-volume`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} allowDecimals={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [String(value), "Orders"]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--color-sales)"
              fill={`url(#${chartId}-volume)`}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function SalesPerformanceAreaChart({
  dailyData,
}: {
  dailyData: DashboardInsights["daily_data"];
}) {
  const chartId = useId().replace(/:/g, "");
  const data = dailyData.map((d) => ({
    date: formatDayLabel(d.date),
    paid: Number(d.complete_revenue),
    credit: Number(d.credit_revenue),
  }));

  const hasData = data.some((d) => d.paid > 0 || d.credit > 0);

  return (
    <Card className="border-indigo-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Paid vs credit</CardTitle>
        <CardDescription>Daily revenue split by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No sales data for this period.
          </p>
        ) : (
          <ChartContainer config={salesPerformanceConfig} className="h-[260px] w-full">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`${chartId}-paid`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id={`${chartId}-credit`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(280 67% 58%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(280 67% 58%)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatDisplayAmount(Number(value)),
                      salesPerformanceConfig[name as keyof typeof salesPerformanceConfig]?.label,
                    ]}
                  />
                }
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="paid"
                stackId="1"
                stroke="var(--color-paid)"
                fill={`url(#${chartId}-paid)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="credit"
                stackId="1"
                stroke="var(--color-credit)"
                fill={`url(#${chartId}-credit)`}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SalesMixChart({
  performance,
}: {
  performance: DashboardInsights["sales_performance"];
}) {
  const complete = Number(performance.complete_revenue);
  const credit = Number(performance.credit_revenue);
  const data = [
    { name: "complete", value: complete, fill: "var(--color-complete)" },
    { name: "credit", value: credit, fill: "var(--color-credit)" },
  ].filter((d) => d.value > 0);

  return (
    <Card className="border-indigo-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Sales mix</CardTitle>
        <CardDescription>Paid vs credit revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No sales data for this period.
          </p>
        ) : (
          <ChartContainer config={salesMixConfig} className="mx-auto h-[220px] w-full max-w-[240px]">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatDisplayAmount(Number(value))}
                  />
                }
              />
              <Legend />
            </PieChart>
          </ChartContainer>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <p className="text-muted-foreground">Paid</p>
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              {formatDisplayAmount(complete)}
            </p>
          </div>
          <div className="rounded-lg bg-violet-500/10 p-2">
            <p className="text-muted-foreground">Credit</p>
            <p className="font-semibold text-violet-700 dark:text-violet-300">
              {formatDisplayAmount(credit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopProductsChart({
  products,
}: {
  products: DashboardInsights["top_products"];
}) {
  const data = products.slice(0, 6).map((p) => ({
    name: p.product_name.length > 18 ? `${p.product_name.slice(0, 16)}…` : p.product_name,
    revenue: Number(p.total_revenue),
    sold: p.total_sold,
  }));

  return (
    <Card className="border-emerald-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Top products</CardTitle>
        <CardDescription>Best sellers by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No product sales for this period. Try a wider date range.
          </p>
        ) : (
          <ChartContainer config={categoryChartConfig} className="h-[260px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatDisplayAmount(Number(value))}
                  />
                }
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TopCategoriesChart({
  categories,
}: {
  categories: DashboardInsights["top_categories"];
}) {
  const data = categories.slice(0, 5).map((c, i) => ({
    name: c.category_name,
    value: Number(c.total_revenue),
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <Card className="border-orange-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Revenue by category</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No category sales for this period. Try a wider date range.
          </p>
        ) : (
          <ChartContainer config={categoryChartConfig} className="h-[260px] w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatDisplayAmount(Number(value))}
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfitAnalyticsChart({
  dailyData,
}: {
  dailyData: DashboardInsights["daily_data"];
}) {
  const chartId = useId().replace(/:/g, "");
  const data = dailyData.map((d) => ({
    date: formatDayLabel(d.date),
    gross: Number(d.gross_profit),
    net: Number(d.net_profit),
    expenses: Number(d.total_expenses),
  }));

  return (
    <Card className="border-cyan-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Profit analytics</CardTitle>
        <CardDescription>Gross vs net profit and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={profitAreaConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${chartId}-gross`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id={`${chartId}-net`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(189 94% 43%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(189 94% 43%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id={`${chartId}-expenses`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25 95% 53%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(25 95% 53%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatDisplayAmount(Number(value)),
                    profitAreaConfig[name as keyof typeof profitAreaConfig]?.label,
                  ]}
                />
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="gross"
              stroke="var(--color-gross)"
              fill={`url(#${chartId}-gross)`}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="var(--color-net)"
              fill={`url(#${chartId}-net)`}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses)"
              fill={`url(#${chartId}-expenses)`}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
