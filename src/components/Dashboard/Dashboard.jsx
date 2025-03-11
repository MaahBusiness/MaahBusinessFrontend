import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./dashboard.css";

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sample data for charts
  const revenueData = [
    { name: "Jan", revenue: 50000 },
    { name: "Feb", revenue: 70000 },
    { name: "Mar", revenue: 65000 },
    { name: "Apr", revenue: 80000 },
  ];

  const productData = [
    { name: "Electronics", value: 100 },
    { name: "Clothing", value: 300 },
    { name: "Home Appliances", value: 300 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p>XAF {totalAmount.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Total Invoices</h3>
          <p>{totalInvoices}</p>
        </div>
        <div className="card">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart">
          <h3>Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Product Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={productData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;