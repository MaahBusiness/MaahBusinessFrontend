export type DashboardDateFilters = {
  start_date?: string;
  end_date?: string;
};

export type DashboardSummary = {
  business_id: string;
  period: { start_date: string; end_date: string };
  revenue: {
    total_revenue: string;
    revenue_today: string;
    revenue_this_week: string;
    revenue_this_month: string;
    average_order_value: string;
    total_orders: number;
    orders_today: number;
    orders_this_week: number;
    orders_this_month: number;
  };
  expenses: {
    total_expenses: string;
    expenses_this_month: string;
    salary_expenses: string;
    other_expenses: string;
  };
  profit: {
    total_profit: string;
    profit_this_month: string;
    profit_margin_percentage: string;
  };
  inventory: {
    total_products: number;
    low_stock_products: number;
    expired_products: number;
    total_inventory_value: string;
    products_on_promotion: number;
  };
  customers: {
    total_customers: number;
    new_customers_this_month: number;
    active_customers: number;
    total_credit_amount: string;
    overdue_credit_amount: string;
  };
  top_products: Array<{
    product_id: string;
    product_name: string;
    total_sold: number;
    total_revenue: string;
    quantity_available: number;
  }>;
  overview: {
    total_customers: number;
    total_invoices: number;
    total_invoices_completed: number;
    total_invoices_credit: number;
    lifetime_revenue: string;
    lifetime_profit: string;
    total_members: number;
    active_members: number;
    total_products: number;
    total_categories: number;
  };
  generated_at: string;
};

export type DashboardInsights = {
  business_id: string;
  period: { start_date: string; end_date: string };
  totals: {
    total_revenue: string;
    total_sales: number;
    credit_outstanding: string;
    total_expenses: string;
    gross_profit: string;
    net_profit: string;
  };
  daily_data: Array<{
    date: string;
    complete_revenue: string;
    credit_revenue: string;
    total_revenue: string;
    profit: string;
    gross_profit: string;
    net_profit: string;
    total_sales: number;
    total_expenses: string;
  }>;
  sales_performance: {
    credit_revenue: string;
    total_revenue: string;
    complete_revenue: string;
    profit: string;
  };
  top_products: DashboardSummary["top_products"];
  top_categories: Array<{
    category_id: string;
    category_name: string;
    total_revenue: string;
    total_quantity_sold: number;
    number_of_sales: number;
  }>;
  recent_sales: Array<{
    invoice_id: string;
    invoice_number: number;
    customer_name: string | null;
    total: string;
    status: string;
    created_at: string;
  }>;
  product_margins: Array<{
    product_id: string;
    product_name: string;
    total_quantity_sold: number;
    total_revenue: string;
    total_profit: string;
    margin_percentage: string;
  }>;
  generated_at: string;
};
