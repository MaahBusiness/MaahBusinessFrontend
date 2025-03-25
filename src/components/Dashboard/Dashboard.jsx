"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";
import "./dashboard.css";

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(45231.89);
  const [totalInvoices, setTotalInvoices] = useState(573);
  const [totalProducts, setTotalProducts] = useState(1234);
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [totalCustomers, setTotalCustomers] = useState(2543);

  // Update the salesData array to have more realistic values that match the monthly revenue
  const salesData = [
    { name: "Jan", sales: 4000, target: 5000 },
    { name: "Feb", sales: 3000, target: 5000 },
    { name: "Mar", sales: 5000, target: 5000 },
    { name: "Apr", sales: 4500, target: 5000 },
    { name: "May", sales: 6000, target: 5000 },
    { name: "Jun", sales: 5500, target: 5000 },
    { name: "Jul", sales: 7000, target: 5000 },
  ];

  const productPerformance = [
    { name: "Product A", value: 2346, fill: "#FF6384" },
    { name: "Product C", value: 2050, fill: "#FFCE56" },
    { name: "Product D", value: 1500, fill: "#4BC0C0" },
    { name: "Product B", value: 1360, fill: "#36A2EB" },
    { name: "Product E", value: 1200, fill: "#9966FF" },
  ].sort((a, b) => b.value - a.value);

  const stockStatus = [
    { name: "In Stock", value: 65, fill: "#4CAF50" },
    { name: "Low Stock", value: 25, fill: "#FFC107" },
    { name: "Out of Stock", value: 10, fill: "#F44336" },
  ].sort((a, b) => b.value - a.value);

  // Update the recentSales array to use XFA currency to match the rest of the dashboard
  const recentSales = [
    {
      name: "John Doe",
      amount: "250.00",
      date: "2 hours ago",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Jane Smith",
      amount: "12,050.00",
      date: "5 hours ago",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Bob Johnson",
      amount: "7,520.00",
      date: "1 day ago",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  // Update the topProducts array to use XFA currency and format numbers properly
  const topProducts = [
    { name: "Product A", sold: 123, revenue: "2,460.00", color: "#FF6384" },
    { name: "Product C", sold: 98, revenue: "1,950.00", color: "#FFCE56" },
    { name: "Product B", sold: 75, revenue: "1,360.00", color: "#36A2EB" },
  ].sort((a, b) => b.sold - a.sold);

  const monthlyRevenue = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5500 },
    { month: "Jul", revenue: 7000 },
  ].sort((a, b) => b.revenue - a.revenue);

  const salesByCategory = [
    { name: "Electronics", value: 70, fill: "#FF6384" },
    { name: "Clothing", value: 50, fill: "#36A2EB" },
    { name: "Home", value: 40, fill: "#FFCE56" },
    { name: "Sports", value: 30, fill: "#4BC0C0" },
    { name: "Books", value: 20, fill: "#9966FF" },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="card-value">XFA {totalAmount.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Products in Stock</h3>
          <p className="card-value">{totalProducts.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Sales</h3>
          <p className="card-value">+{totalInvoices.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Total Customers</h3>
          <p className="card-value">{totalCustomers.toLocaleString()}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Sales Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6384" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF6384" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36A2EB" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#36A2EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#D1D5DB" }}
              />
              <Legend wrapperStyle={{ color: "#D1D5DB" }} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#FF6384"
                fillOpacity={1}
                fill="url(#colorSales)"
                name="Actual Sales"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#36A2EB"
                fillOpacity={0.3}
                fill="url(#colorTarget)"
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Product Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={productPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#D1D5DB" />
              <YAxis dataKey="name" type="category" stroke="#D1D5DB" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#D1D5DB" }}
              />
              <Bar dataKey="value" name="Sales">
                {productPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="secondary-charts">
        <div className="chart">
          <h3>Stock Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stockStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {stockStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#D1D5DB" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Recent Sales</h3>
          <div className="recent-sales">
            {recentSales.map((sale, index) => (
              <div key={index} className="sale-item">
                <div className="sale-info">
                  <p className="sale-name">{sale.name}</p>
                  <p className="sale-date">{sale.date}</p>
                </div>
                {/* Update the sale amount display to use XFA instead of $ */}
                <p className="sale-amount">XFA {sale.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="chart">
          <h3>Top Selling Products</h3>
          <div className="top-products">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div
                  className="product-color"
                  style={{ backgroundColor: product.color }}
                ></div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-sold">{product.sold} units sold</div>
                </div>
                {/* Update the product revenue display to use XFA instead of $ */}
                <div
                  className="product-revenue"
                  style={{ color: product.color }}
                >
                  XFA {product.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="additional-charts">
        <div className="chart">
          <h3>Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#D1D5DB" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4BC0C0"
                strokeWidth={2}
                dot={{ r: 4, fill: "#4BC0C0" }}
                activeDot={{ r: 6, fill: "#4BC0C0" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="10%"
              outerRadius="80%"
              barSize={10}
              data={salesByCategory}
            >
              <RadialBar
                label={{ fill: "#D1D5DB", position: "insideStart" }}
                background
                dataKey="value"
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ color: "#D1D5DB" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#D1D5DB" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
