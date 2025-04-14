"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import {
  X,
  Edit,
  Trash,
  Save,
  User,
  Search,
  Loader,
  Plus,
  Eye,
  EyeOff,
  Users,
  Calendar,
} from "lucide-react";
import "./dashboard.css";

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  // State for API data
  const [inventoryData, setInventoryData] = useState({
    stockStatus: [],
    stockData: [],
    alerts: { low_stock: 0, out_of_stock: 0, overstocked: 0 },
  });
  const [productPerformanceData, setProductPerformanceData] = useState({
    topProducts: [],
    productPerformance: [],
  });
  const [salesDataState, setSalesData] = useState({
    salesOverTime: [],
    recentSales: [],
    salesByCategory: [],
    monthlyRevenue: [],
  });
  const [dashboardStats, setDashboardStats] = useState({
    revenue: { value: "0", change: "0", change_percent: "0" },
    orders: { value: "0", change: "0", change_percent: "0" },
    averageOrderValue: { value: "0", change: "0", change_percent: "0" },
    customers: { value: "0", change: "0", change_percent: "0" },
  });
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [profitData, setProfitData] = useState([]);

  // User management state
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    role: "cashier",
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Available roles
  const availableRoles = [
    "manager",
    "cashier",
    "stock_keeper",
    "wholesale_client",
    "sales_agent",
  ];

  // Check authentication and get current user role on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (token) {
      getCurrentUserRole();
    } else {
      setError("Please log in to manage users");
    }
  }, []);

  // Create axios instance with authentication headers
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // Get current user role
  const getCurrentUserRole = async () => {
    try {
      const authAxios = getAuthAxios();

      // Try to get the user info from localStorage first
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.role) {
            setCurrentUserRole(parsedUser.role);
            console.log(
              "Current user role set from localStorage:",
              parsedUser.role,
            );
            return;
          }
        }
      } catch (localStorageError) {
        console.error(
          "Error getting user from localStorage:",
          localStorageError,
        );
      }

      // Try the user-info endpoint as a fallback
      try {
        const userInfoResponse = await authAxios.get(
          "http://localhost:8000/api/v1/user-info/",
        );
        console.log("User info data:", userInfoResponse.data);

        if (userInfoResponse.data && userInfoResponse.data.role) {
          setCurrentUserRole(userInfoResponse.data.role);
          console.log("Current user role set to:", userInfoResponse.data.role);
          return;
        }
      } catch (userInfoError) {
        console.error(
          "Error fetching from /user-info/ endpoint:",
          userInfoError,
        );
      }

      // If we couldn't determine the role, set a default
      console.warn(
        "Could not determine user role from any source, defaulting to non-manager",
      );
      setCurrentUserRole("cashier"); // Default to non-manager role
    } catch (err) {
      console.error("Error fetching current user:", err);
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    }
  };

  // Check if user has manager permissions
  const hasManagerPermission = () => {
    return currentUserRole === "manager";
  };

  // Add this function to check if the user has permission to view report data
  const hasReportViewPermission = () => {
    return currentUserRole === "manager" || currentUserRole === "cashier";
  };

  // Fetch users when modal is opened
  useEffect(() => {
    if (showUserModal) {
      fetchUsers();
    }
  }, [showUserModal]);

  // Function to fetch users
  const fetchUsers = async () => {
    if (!isAuthenticated) {
      setError("Please log in to view users");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        "http://localhost:8000/api/v1/users/",
      );

      console.log("Users data:", response.data);

      // Process users to ensure we don't expose sensitive data
      const processedUsers = response.data.map((user) => ({
        ...user,
        // Don't include password in the frontend state
        password: undefined,
      }));

      setUsers(processedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        setError("Authentication expired. Please log in again.");
      } else {
        setError("Failed to load users. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a new user
  const createUser = async () => {
    if (!isAuthenticated) {
      setError("Please log in to create users");
      return;
    }

    // Validate form
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("Username, email, and password are required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const authAxios = getAuthAxios();

      const response = await authAxios.post(
        "http://localhost:8000/api/v1/users/",
        newUser,
      );
      console.log("User created:", response.data);

      // Refresh user list
      fetchUsers();

      // Reset form and close modal
      setNewUser({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        role: "cashier",
        is_active: true,
      });
      setShowCreateUserModal(false);
      setShowPassword(false);
    } catch (err) {
      console.error("Error creating user:", err);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        setError("Authentication expired. Please log in again.");
      } else if (err.response && err.response.data) {
        setError(`Failed to create user: ${JSON.stringify(err.response.data)}`);
      } else {
        setError("Failed to create user. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update user
  const updateUser = async (user) => {
    if (!isAuthenticated) {
      setError("Please log in to update users");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const authAxios = getAuthAxios();

      // If role has changed, use the assign-role API
      if (editingUser.originalRole !== user.role) {
        console.log(
          "Updating role from",
          editingUser.originalRole,
          "to",
          user.role,
        );
        const roleResponse = await authAxios.post(
          "http://localhost:8000/api/v1/users/assign-role/",
          {
            user_id: user.id,
            role: user.role,
          },
        );
        console.log("Role update response:", roleResponse.data);
      }

      // Update other user fields
      const userToUpdate = {
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        is_active: user.is_active,
      };

      const updateResponse = await authAxios.put(
        `http://localhost:8000/api/v1/users/${user.id}/`,
        userToUpdate,
      );
      console.log("User update response:", updateResponse.data);

      // Update users list
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, ...userToUpdate, role: user.role } : u,
        ),
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        setError("Authentication expired. Please log in again.");
      } else {
        setError("Failed to update user. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete user
  const deleteUser = async (userId) => {
    if (!isAuthenticated) {
      setError("Please log in to delete users");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const authAxios = getAuthAxios();
      const response = await authAxios.delete(
        `http://localhost:8000/api/v1/users/${userId}/`,
      );
      console.log("User delete response:", response.data);

      // Remove user from list
      setUsers(users.filter((u) => u.id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        setError("Authentication expired. Please log in again.");
      } else {
        setError("Failed to delete user. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change for editing user
  const handleInputChange = (field, value) => {
    setEditingUser({
      ...editingUser,
      [field]: value,
    });
  };

  // Handle input change for new user
  const handleNewUserInputChange = (field, value) => {
    setNewUser({
      ...newUser,
      [field]: value,
    });
  };

  // Handle login redirect
  const handleLogin = () => {
    window.location.href = "/login";
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditingUser({
      ...user,
      originalRole: user.role, // Store original role to check if it changed
    });
  };

  // Filter users based on search term and hide manager users if not a manager
  const filteredUsers = users.filter((user) => {
    // First check if we should hide manager users
    if (user.role === "manager" && currentUserRole !== "manager") {
      return false;
    }

    // Then apply search filter
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Functions to fetch data from the APIs
  const fetchInventoryData = async () => {
    if (!hasManagerPermission()) {
      // Return empty data for non-managers
      setInventoryData({
        stockStatus: [],
        stockData: [],
        alerts: { low_stock: 0, out_of_stock: 0, overstocked: 0 },
      });
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        "http://localhost:8000/api/v1/dashboard/inventory/",
      );
      setInventoryData(response.data);
      console.log("Inventory data:", response.data);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      // Set empty data on error
      setInventoryData({
        stockStatus: [],
        stockData: [],
        alerts: { low_stock: 0, out_of_stock: 0, overstocked: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsData = async () => {
    if (!hasManagerPermission()) {
      // Return empty data for non-managers
      setProductPerformanceData({
        topProducts: [],
        productPerformance: [],
      });
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/products/?period=${timePeriod}`,
      );
      setProductPerformanceData(response.data);
      console.log("Product performance data:", response.data);
    } catch (err) {
      console.error("Error fetching product performance data:", err);
      setProductPerformanceData({
        topProducts: [],
        productPerformance: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the fetchSalesData function to use pending_payment as profit
  const fetchSalesData = async () => {
    if (!hasManagerPermission()) {
      // Return empty data for non-managers
      setSalesData({
        salesOverTime: [],
        recentSales: [],
        salesByCategory: [],
        monthlyRevenue: [],
      });
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/sales/?period=${timePeriod}`,
      );
      setSalesData(response.data);
      console.log("Sales data:", response.data);

      // Calculate profit data from sales data
      if (
        response.data.salesOverTime &&
        response.data.salesOverTime.length > 0
      ) {
        const profitChartData = response.data.salesOverTime.map((item) => ({
          name: item.period,
          // Use pending_payment as profit value
          profit: Number(item.pending_payment || 0),
          sales: Number(item.sales || 0),
          pending: Number(item.pending_payment || 0),
        }));
        setProfitData(profitChartData);
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setSalesData({
        salesOverTime: [],
        recentSales: [],
        salesByCategory: [],
        monthlyRevenue: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!hasManagerPermission()) {
      // Return zero values for non-managers
      setDashboardStats({
        revenue: { value: "0", change: "0", change_percent: "0" },
        orders: { value: "0", change: "0", change_percent: "0" },
        averageOrderValue: { value: "0", change: "0", change_percent: "0" },
        customers: { value: "0", change: "0", change_percent: "0" },
      });
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/stats/?period=${timePeriod}`,
      );
      setDashboardStats(response.data);
      console.log("Dashboard stats:", response.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setDashboardStats({
        revenue: { value: "0", change: "0", change_percent: "0" },
        orders: { value: "0", change: "0", change_percent: "0" },
        averageOrderValue: { value: "0", change: "0", change_percent: "0" },
        customers: { value: "0", change: "0", change_percent: "0" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch top selling products from invoices
  const fetchTopSellingProducts = async () => {
    if (!hasManagerPermission()) {
      // Return empty data for non-managers
      setTopSellingProducts([]);
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();

      // Get invoices with line items
      const response = await authAxios.get(
        "http://localhost:8000/api/v1/invoice/invoices/",
      );

      // Extract all line items from invoices
      let allLineItems = [];
      if (response.data && response.data.results) {
        response.data.results.forEach((invoice) => {
          if (invoice.lines && Array.isArray(invoice.lines)) {
            allLineItems = [...allLineItems, ...invoice.lines];
          }
        });
      }

      // Count product occurrences and total quantities
      const productCounts = {};
      const productRevenue = {};

      allLineItems.forEach((line) => {
        const productId = line.product_id;
        const productName = line.product_name || "Unknown Product";
        const quantity = Number.parseInt(line.quantity) || 0;
        const price = Number.parseFloat(line.unit_price || line.price || 0);
        const lineTotal =
          quantity * price * (1 - Number.parseFloat(line.discount || 0) / 100);

        if (!productCounts[productId]) {
          productCounts[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        productCounts[productId].quantity += quantity;
        productCounts[productId].revenue += lineTotal;
      });

      // Convert to array and sort by quantity
      const topProducts = Object.values(productCounts)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map((product, index) => ({
          ...product,
          color: ["#FF6384", "#FFCE56", "#4BC0C0", "#36A2EB", "#9966FF"][
            index % 5
          ],
        }));

      setTopSellingProducts(topProducts);
      console.log("Top selling products:", topProducts);
    } catch (err) {
      console.error("Error fetching top selling products:", err);
      setTopSellingProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a useEffect to fetch data when the component mounts or when timePeriod changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventoryData();
      fetchProductsData();
      fetchSalesData();
      fetchDashboardStats();
      fetchTopSellingProducts();
    }
  }, [isAuthenticated, timePeriod, currentUserRole]);

  // Prepare chart data from API responses
  const stockStatus =
    inventoryData.stockStatus && inventoryData.stockStatus.length > 0
      ? inventoryData.stockStatus.map((item) => ({
          name: item.name,
          value: Number(item.value),
          fill: item.name.toLowerCase().includes("in stock")
            ? "#4CAF50"
            : item.name.toLowerCase().includes("low stock")
              ? "#FFC107"
              : "#F44336",
        }))
      : [];

  const productPerformance =
    productPerformanceData.productPerformance &&
    productPerformanceData.productPerformance.length > 0
      ? productPerformanceData.productPerformance
          .map((item, index) => ({
            name: item.name,
            value: Number(item.value),
            fill: ["#FF6384", "#FFCE56", "#4BC0C0", "#36A2EB", "#9966FF"][
              index % 5
            ],
          }))
          .sort((a, b) => b.value - a.value)
      : [];

  const salesChartData =
    salesDataState.salesOverTime && salesDataState.salesOverTime.length > 0
      ? salesDataState.salesOverTime.map((item) => ({
          name: item.period,
          sales: Number(item.sales),
          profit: Number(item.profit || 0),
          pending_payment: Number(item.pending_payment || 0),
        }))
      : [];

  const recentSalesData =
    salesDataState.recentSales && salesDataState.recentSales.length > 0
      ? salesDataState.recentSales.map((sale) => ({
          id: sale.id,
          name: sale.customerName,
          amount: sale.amount,
          date: sale.date,
        }))
      : [];

  const salesByCategoryData =
    salesDataState.salesByCategory && salesDataState.salesByCategory.length > 0
      ? salesDataState.salesByCategory
          .map((category, index) => ({
            name: category.name,
            value: Number(category.value),
            fill: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"][
              index % 5
            ],
          }))
          .sort((a, b) => b.value - a.value)
      : [];

  const monthlyRevenueData =
    salesDataState.monthlyRevenue && salesDataState.monthlyRevenue.length > 0
      ? salesDataState.monthlyRevenue.map((item) => ({
          month: item.month,
          revenue: Number(item.revenue),
        }))
      : [];

  // Add this function before the return statement in the Dashboard component
  const calculateGradientOffset = (dataArray, key) => {
    if (!dataArray || dataArray.length === 0) return 0.5;

    const dataMax = Math.max(...dataArray.map((i) => i[key] || 0));
    const dataMin = Math.min(...dataArray.map((i) => i[key] || 0));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="title-section">
          <h2>Dashboard</h2>
          <div className="period-filter">
            <Calendar size={16} />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="period-selector"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div className="dashboard-actions">
          {currentUserRole && (
            <div className="role-indicator">
              <User size={16} />
              <span>Role: {currentUserRole}</span>
            </div>
          )}
          {isAuthenticated && hasManagerPermission() && (
            <button
              className="manage-users-btn"
              onClick={() => setShowUserModal(true)}
            >
              <Users size={18} /> Manage Users
            </button>
          )}
          {!isAuthenticated && (
            <button className="login-button" onClick={handleLogin}>
              <User size={18} /> Login
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <Loader size={40} className="spin" />
          <p>Loading dashboard data...</p>
        </div>
      )}

      {!hasManagerPermission() && (
        <div className="non-manager-notice">
          <p>
            Limited dashboard view. Manager access required to view complete
            data.
          </p>
        </div>
      )}

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="card-value">
            {hasReportViewPermission()
              ? `XFA ${Number(dashboardStats.revenue.value).toLocaleString()}`
              : "XFA NaN"}
          </p>
          <div className="stat-change">
            <span
              className={
                Number(dashboardStats.revenue.change) >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {hasReportViewPermission()
                ? `${Number(dashboardStats.revenue.change) >= 0 ? "+" : ""}${Number(dashboardStats.revenue.change).toFixed(1)}`
                : "NaN"}
            </span>
            <span className="period">from last {timePeriod}</span>
          </div>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p className="card-value">
            {hasReportViewPermission()
              ? Number(dashboardStats.orders.value).toLocaleString()
              : "NaN"}
          </p>
          <div className="stat-change">
            <span
              className={
                Number(dashboardStats.orders.change) >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {hasReportViewPermission()
                ? `${Number(dashboardStats.orders.change) >= 0 ? "+" : ""}${Number(dashboardStats.orders.change).toFixed(1)}`
                : "NaN"}
            </span>
            <span className="period">from last {timePeriod}</span>
          </div>
        </div>
        <div className="card">
          <h3>Average Order Value</h3>
          <p className="card-value">
            {hasReportViewPermission()
              ? `XFA ${Number(dashboardStats.averageOrderValue.value).toLocaleString()}`
              : "XFA NaN"}
          </p>
          <div className="stat-change">
            <span
              className={
                Number(dashboardStats.averageOrderValue.change) >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {hasReportViewPermission()
                ? `${Number(dashboardStats.averageOrderValue.change) >= 0 ? "+" : ""}${Number(dashboardStats.averageOrderValue.change).toFixed(1)}`
                : "NaN"}
            </span>
            <span className="period">from last {timePeriod}</span>
          </div>
        </div>
        <div className="card">
          <h3>Customers</h3>
          <p className="card-value">
            {hasReportViewPermission()
              ? Number(dashboardStats.customers.value).toLocaleString()
              : "NaN"}
          </p>
          <div className="stat-change">
            <span
              className={
                Number(dashboardStats.customers.change) >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {hasReportViewPermission()
                ? `${Number(dashboardStats.customers.change) >= 0 ? "+" : ""}${Number(dashboardStats.customers.change).toFixed(1)}`
                : "NaN"}
            </span>
            <span className="period">from last {timePeriod}</span>
          </div>
        </div>
      </div>

      {/* New Profit Analysis Chart */}
      <div className="chart profit-chart">
        <h3>Profit Analysis</h3>
        {profitData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              width={500}
              height={300}
              data={profitData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
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
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="profit"
                name="Profit"
                fill="url(#profitGradient)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sales"
                name="Sales"
                fill="url(#salesGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            {hasManagerPermission()
              ? "No profit data available for this period"
              : "Manager access required to view profit data"}
          </div>
        )}
      </div>

      {/* New Profit Line Chart */}
      {/*<div className="chart profit-chart">
        <h3>Pending Payments Analysis</h3>
        {profitData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              width={500}
              height={300}
              data={profitData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
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
              <defs>
                <linearGradient id="splitProfitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={calculateGradientOffset(profitData, "profit")} stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset={calculateGradientOffset(profitData, "profit")} stopColor="#ef4444" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="splitSalesColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="splitPendingColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFCE56" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#FFCE56" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="profit"
                name="Pending Payments"
                stroke="#8884d8"
                fill="url(#splitProfitColor)"
                activeDot={{ r: 8 }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#82ca9d"
                fill="url(#splitSalesColor)"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="pending"
                name="Pending Payment"
                stroke="#FFCE56"
                fill="url(#splitPendingColor)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            {hasManagerPermission()
              ? "No pending payments data available for this period"
              : "Manager access required to view pending payments data"}
          </div>
        )}
      </div>*/}

      <div className="charts-container">
        <div className="chart">
          <h3>Sales Performance</h3>
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6384" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF6384" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4BC0C0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4BC0C0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFCE56" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FFCE56" stopOpacity={0} />
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
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#4BC0C0"
                  fillOpacity={0.3}
                  fill="url(#colorProfit)"
                  name="Profit"
                />
                <Area
                  type="monotone"
                  dataKey="pending_payment"
                  stroke="#FFCE56"
                  fillOpacity={0.3}
                  fill="url(#colorPending)"
                  name="Pending Payment"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No sales data available for this period"
                : "Manager access required to view sales data"}
            </div>
          )}
        </div>

        <div className="chart">
          <h3>Product Performance</h3>
          {productPerformance.length > 0 ? (
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
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No product performance data available for this period"
                : "Manager access required to view product data"}
            </div>
          )}
        </div>
      </div>

      <div className="secondary-charts">
        <div className="chart">
          <h3>Stock Status</h3>
          {stockStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stockStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stockStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "4px",
                  }}
                  itemStyle={{ color: "#D1D5DB" }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#D1D5DB" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No stock status data available"
                : "Manager access required to view stock status"}
            </div>
          )}
        </div>

        <div className="chart">
          <h3>Recent Sales</h3>
          {recentSalesData.length > 0 ? (
            <div className="recent-sales">
              {recentSalesData.slice(0, 3).map((sale, index) => (
                <div key={sale.id || index} className="sale-item">
                  <div className="sale-info">
                    <p className="sale-name">{sale.name}</p>
                    <p className="sale-date">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                  <p className="sale-amount">
                    XFA {Number(sale.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No recent sales data available"
                : "Manager access required to view recent sales"}
            </div>
          )}
        </div>

        <div className="chart">
          <h3>Top Selling Products</h3>
          {productPerformanceData.topProducts &&
          productPerformanceData.topProducts.length > 0 ? (
            <div className="top-products">
              {productPerformanceData.topProducts
                .slice(0, 3)
                .map((product, index) => (
                  <div key={index} className="product-item">
                    <div
                      className="product-color"
                      style={{
                        backgroundColor: [
                          "#FF6384",
                          "#FFCE56",
                          "#4BC0C0",
                          "#36A2EB",
                          "#9966FF",
                        ][index % 5],
                      }}
                    ></div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-sold">
                        {product.sold} units sold
                      </div>
                    </div>
                    <div
                      className="product-revenue"
                      style={{
                        color: [
                          "#FF6384",
                          "#FFCE56",
                          "#4BC0C0",
                          "#36A2EB",
                          "#9966FF",
                        ][index % 5],
                      }}
                    >
                      XFA {Number(product.revenue).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No top selling products data available"
                : "Manager access required to view top products"}
            </div>
          )}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="additional-charts">
        <div className="chart">
          <h3>Monthly Revenue Trend</h3>
          {monthlyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenueData}>
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
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No monthly revenue data available"
                : "Manager access required to view revenue trends"}
            </div>
          )}
        </div>

        <div className="chart">
          <h3>Sales by Category</h3>
          {salesByCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="80%"
                barSize={10}
                data={salesByCategoryData}
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
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No sales by category data available"
                : "Manager access required to view category data"}
            </div>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content user-modal">
            <div className="modal-header">
              <h3>Customer Management</h3>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setConfirmDelete(null);
                  setError(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="error-message">
                  {error}
                  {!isAuthenticated && (
                    <button
                      className="login-button-small"
                      onClick={handleLogin}
                    >
                      Login
                    </button>
                  )}
                </div>
              )}

              {/* Debug info panel */}
              {debugInfo && (
                <div className="debug-panel">
                  <h4>Debug Information</h4>
                  <p>Current Role: {currentUserRole || "Not set"}</p>
                </div>
              )}

              <div className="user-management-header">
                <div className="search-container">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search users by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                {isAuthenticated && hasManagerPermission() && (
                  <button
                    className="create-user-btn"
                    onClick={() => setShowCreateUserModal(true)}
                  >
                    <Plus size={16} /> Add User
                  </button>
                )}
              </div>

              {isLoading && !users.length ? (
                <div className="loading-state">
                  <Loader size={40} className="spin" />
                  <p>Loading users...</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="auth-required">
                  <User size={48} />
                  <p>Please log in to view and manage users</p>
                  <button className="login-button-modal" onClick={handleLogin}>
                    Login
                  </button>
                </div>
              ) : users.length === 0 && !isLoading ? (
                <div className="no-users">No users found</div>
              ) : (
                <div className="users-list">
                  <div className="user-item header">
                    <div className="user-info">
                      <div className="user-name">Username</div>
                      <div className="user-email">Email</div>
                      <div className="user-phone">Phone</div>
                      <div className="user-role">Role</div>
                      <div className="user-status">Status</div>
                    </div>
                    {hasManagerPermission() && (
                      <div className="user-actions">Actions</div>
                    )}
                  </div>

                  {filteredUsers.map((user) => (
                    <div key={user.id} className="user-item">
                      {editingUser && editingUser.id === user.id ? (
                        // Edit mode - only shown for managers
                        <div className="user-edit">
                          <div className="user-edit-fields">
                            <input
                              type="text"
                              value={editingUser.username}
                              onChange={(e) =>
                                handleInputChange("username", e.target.value)
                              }
                              placeholder="Username"
                            />
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              placeholder="Email"
                            />
                            <input
                              type="text"
                              value={editingUser.phone_number || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "phone_number",
                                  e.target.value,
                                )
                              }
                              placeholder="Phone"
                            />
                            <select
                              value={editingUser.role}
                              onChange={(e) =>
                                handleInputChange("role", e.target.value)
                              }
                            >
                              {availableRoles.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <select
                              value={editingUser.is_active.toString()}
                              onChange={(e) =>
                                handleInputChange(
                                  "is_active",
                                  e.target.value === "true",
                                )
                              }
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </div>
                          <div className="user-edit-actions">
                            <button
                              className="save-btn"
                              onClick={() => updateUser(editingUser)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader size={16} className="spin" />
                              ) : (
                                <Save size={16} />
                              )}
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => setEditingUser(null)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode - shown for all users, but actions only for managers
                        <>
                          <div className="user-info">
                            <div className="user-name">{user.username}</div>
                            <div className="user-email">{user.email}</div>
                            <div className="user-phone">
                              {user.phone_number || "N/A"}
                            </div>
                            <div className="user-role">{user.role}</div>
                            <div
                              className={`user-status ${user.is_active ? "active" : "inactive"}`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </div>
                          </div>
                          {hasManagerPermission() && (
                            <div className="user-actions">
                              <button
                                className="edit-btn"
                                onClick={() => startEditing(user)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => setConfirmDelete(user.id)}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay">
          <div className="modal-content create-user-modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setShowCreateUserModal(false);
                  setError(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    handleNewUserInputChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    handleNewUserInputChange("email", e.target.value)
                  }
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  id="phone_number"
                  type="text"
                  value={newUser.phone_number}
                  onChange={(e) =>
                    handleNewUserInputChange("phone_number", e.target.value)
                  }
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) =>
                      handleNewUserInputChange("password", e.target.value)
                    }
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    handleNewUserInputChange("role", e.target.value)
                  }
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="is_active">Status</label>
                <select
                  id="is_active"
                  value={newUser.is_active.toString()}
                  onChange={(e) =>
                    handleNewUserInputChange(
                      "is_active",
                      e.target.value === "true",
                    )
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateUserModal(false)}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                onClick={createUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="close-modal-btn"
                onClick={() => setConfirmDelete(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteUser(confirmDelete)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
