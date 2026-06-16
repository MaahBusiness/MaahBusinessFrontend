import { Bar, BarChart, Line, LineChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  subscription: {
    label: "Subscriptions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type RevenuePoint = { revenue: number; subscription: number };

export function CardsStats({
  totalRevenue,
  totalOrders,
  chartData,
}: {
  totalRevenue: number;
  totalOrders: number;
  chartData: RevenuePoint[];
}) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Current period revenue</p>
          <ChartContainer config={chartConfig} className="h-[80px] w-full">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="revenue"
                stroke="var(--color-revenue)"
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Current period orders</p>
          <ChartContainer config={chartConfig} className="mt-2 h-[80px] w-full">
            <BarChart data={chartData}>
              <Bar
                dataKey="subscription"
                fill="var(--color-subscription)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
