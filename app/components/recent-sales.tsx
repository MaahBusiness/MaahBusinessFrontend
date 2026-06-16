import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Invoice } from "types";

export function RecentSales({ sales }: { sales: Invoice[] }) {
  if (!sales.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No recent sales for the selected period.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sales.slice(0, 6).map((sale) => (
        <div className="flex items-center" key={sale.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt={sale.customer_name || "Client"} />
            <AvatarFallback>
              {(sale.customer_name || "NA")
                .split(" ")
                .map((item) => item[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.customer_name || "Walk-in customer"}
            </p>
            <p className="text-sm text-muted-foreground">
              Invoice #{sale.number}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +${Number(sale.total).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
