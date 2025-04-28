"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  Calendar,
  User,
  Users,
  Loader,
  X,
  Search,
  Plus,
  Save,
  Edit,
  Trash,
} from "lucide-react";
import "./dashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    // Default to 30 days ago
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split("T")[0];
  });
  const [searchDate, setSearchDate] = useState("");

  // State for API data
  const [inventoryData, setInventoryData] = useState({
    stockStatus: [],
    stockData: [],
    alerts: {
      lowStock: 0,
      outOfStock: 0,
      overstocked: 0,
      total_products: 0,
      critical: 0,
    },
  });

  const [productPerformanceData, setProductPerformanceData] = useState({
    top_products: [],
    top_categories: [],
  });

  const [salesData, setSalesData] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    revenue: {
      total: 0,
      completed: 0,
      credit: { total: 0, advance_paid: 0, to_collect: 0, count: 0 },
      advance_paid: 0,
      outstanding: 0,
      trend: { status: "up", percentage: 0, direction: "up" },
    },
    profit: {
      total: 0,
      completed: 0,
      credit: 0,
      trend: { status: "up", percentage: 0, direction: "up" },
    },
    orders: {
      total: 0,
      completed: 0,
      credit: 0,
      trend: { status: "up", percentage: 0, direction: "up" },
    },
    averageOrderValue: {
      value: 0,
      change: 0,
      change_percent: 0,
    },
  });

  const [recentSales, setRecentSales] = useState([]);
  const [topSales, setTopSales] = useState([]);

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

  // Time period for top sales

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

  // Add this function after getAuthAxios
  const handleAuthError = (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setCurrentUserRole(null);
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  // Functions to fetch data from the APIs
  const fetchInventoryData = async () => {
    if (!hasManagerPermission()) {
      setInventoryData({
        stockStatus: [],
        stockData: [],
        alerts: {
          lowStock: 0,
          outOfStock: 0,
          overstocked: 0,
          total_products: 0,
          critical: 0,
        },
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
      handleAuthError(err);
      setInventoryData({
        stockStatus: [],
        stockData: [],
        alerts: {
          lowStock: 0,
          outOfStock: 0,
          overstocked: 0,
          total_products: 0,
          critical: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsData = async () => {
    if (!hasManagerPermission()) {
      setProductPerformanceData({
        top_products: [],
        top_categories: [],
      });
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/top-sales-products/?start_date=${startDate}&end_date=${endDate}`,
      );
      setProductPerformanceData(response.data);
      console.log(`Product performance data:`, response.data);
    } catch (err) {
      console.error("Error fetching product performance data:", err);
      handleAuthError(err);
      setProductPerformanceData({
        top_products: [],
        top_categories: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesData = async () => {
    if (!hasManagerPermission()) {
      setSalesData([]);
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/sales/?start_date=${startDate}&end_date=${endDate}`,
      );

      // Log the raw response to see what we're getting
      console.log(`Raw sales data response:`, response.data);

      // Process the sales data
      setSalesData(response.data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      handleAuthError(err);
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!hasManagerPermission()) {
      // Return zero values for non-managers
      setDashboardStats({
        revenue: {
          total: 0,
          completed: 0,
          credit: { total: 0, advance_paid: 0, to_collect: 0, count: 0 },
          advance_paid: 0,
          outstanding: 0,
          trend: { status: "up", percentage: 0, direction: "up" },
        },
        profit: {
          total: 0,
          completed: 0,
          credit: 0,
          trend: { status: "up", percentage: 0, direction: "up" },
        },
        orders: {
          total: 0,
          completed: 0,
          credit: 0,
          trend: { status: "up", percentage: 0, direction: "up" },
        },
        averageOrderValue: {
          value: 0,
          change: 0,
          change_percent: 0,
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/stats/?start_date=${startDate}&end_date=${endDate}`,
      );

      // Process the stats data on the frontend
      const processedStats = processStatsData(response.data);
      setDashboardStats(processedStats);
      console.log(`Dashboard stats:`, processedStats);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setDashboardStats({
        revenue: {
          total: 0,
          completed: 0,
          credit: { total: 0, advance_paid: 0, to_collect: 0, count: 0 },
          advance_paid: 0,
          outstanding: 0,
          trend: { status: "up", percentage: 0, direction: "up" },
        },
        profit: {
          total: 0,
          completed: 0,
          credit: 0,
          trend: { status: "up", percentage: 0, direction: "up" },
        },
        orders: {
          total: 0,
          completed: 0,
          credit: 0,
          trend: { status: "up", percentage: 0, direction: "up" },
        },
        averageOrderValue: {
          value: 0,
          change: 0,
          change_percent: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process stats data on the frontend
  const processStatsData = (rawData) => {
    // This is where we would process the raw stats data
    // For now, we'll just return a placeholder structure
    // In a real implementation, you would calculate totals, trends, etc. here

    // Example processing logic (replace with actual logic based on your API response)
    const processedData = {
      revenue: {
        total: calculateTotal(rawData, "revenue"),
        completed: calculateCompleted(rawData, "revenue"),
        credit: {
          total: calculateCreditTotal(rawData, "revenue"),
          advance_paid: calculateAdvancePaid(rawData),
          to_collect: calculateToCollect(rawData),
          count: calculateCreditCount(rawData),
        },
        advance_paid: calculateAdvancePaid(rawData),
        outstanding: calculateOutstanding(rawData),
        trend: calculateTrend(rawData, "revenue"),
      },
      profit: {
        total: calculateTotal(rawData, "profit"),
        completed: calculateCompleted(rawData, "profit"),
        credit: calculateCreditTotal(rawData, "profit"),
        trend: calculateTrend(rawData, "profit"),
      },
      orders: {
        total: calculateTotal(rawData, "orders"),
        completed: calculateCompleted(rawData, "orders"),
        credit: calculateCreditTotal(rawData, "orders"),
        trend: calculateTrend(rawData, "orders"),
      },
      averageOrderValue: {
        value: calculateAverageOrderValue(rawData),
        change: calculateAverageOrderValueChange(rawData),
        change_percent: calculateAverageOrderValueChangePercent(rawData),
      },
    };

    return processedData;
  };

  // Helper functions for data processing
  const calculateTotal = (data, metric) => {
    // Example calculation - replace with actual logic
    return data.reduce((sum, item) => sum + (item[metric] || 0), 0);
  };

  const calculateCompleted = (data, metric) => {
    // Example calculation - replace with actual logic
    return data.reduce(
      (sum, item) =>
        sum + (item.status === "completed" ? item[metric] || 0 : 0),
      0,
    );
  };

  const calculateCreditTotal = (data, metric) => {
    // Example calculation - replace with actual logic
    return data.reduce(
      (sum, item) => sum + (item.status === "credit" ? item[metric] || 0 : 0),
      0,
    );
  };

  const calculateAdvancePaid = (data) => {
    // Example calculation - replace with actual logic
    return data.reduce((sum, item) => sum + (item.advance_paid || 0), 0);
  };

  const calculateToCollect = (data) => {
    // Example calculation - replace with actual logic
    return data.reduce((sum, item) => {
      if (item.status === "credit") {
        return sum + ((item.revenue || 0) - (item.advance_paid || 0));
      }
      return sum;
    }, 0);
  };

  const calculateOutstanding = (data) => {
    // Example calculation - replace with actual logic
    return calculateToCollect(data);
  };

  const calculateCreditCount = (data) => {
    // Example calculation - replace with actual logic
    return data.filter((item) => item.status === "credit").length;
  };

  const calculateTrend = (data, metric) => {
    // Use the trend data directly from the API if available
    const lastDataPoint = data.length > 0 ? data[data.length - 1] : null;

    if (lastDataPoint && lastDataPoint.trends && lastDataPoint.trends[metric]) {
      return {
        status: lastDataPoint.trends[metric].status,
        percentage: lastDataPoint.trends[metric].percentage,
        direction: lastDataPoint.trends[metric].direction,
      };
    }

    // Fallback calculation if trend data is not available
    const total = calculateTotal(data, metric);
    const previousTotal = total * 0.9; // Placeholder - replace with actual previous period data

    const percentage =
      previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;
    const status = percentage >= 0 ? "up" : "down";

    return {
      status,
      percentage: Math.abs(percentage),
      direction: status,
    };
  };

  const calculateAverageOrderValue = (data) => {
    // Example calculation - replace with actual logic
    const totalRevenue = calculateTotal(data, "revenue");
    const totalOrders = calculateTotal(data, "orders");
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  const calculateAverageOrderValueChange = (data) => {
    // Example calculation - replace with actual logic
    const currentAOV = calculateAverageOrderValue(data);
    const previousAOV = currentAOV * 0.95; // Placeholder - replace with actual previous period data
    return currentAOV - previousAOV;
  };

  const calculateAverageOrderValueChangePercent = (data) => {
    // Example calculation - replace with actual logic
    const currentAOV = calculateAverageOrderValue(data);
    const previousAOV = currentAOV * 0.95; // Placeholder - replace with actual previous period data
    return previousAOV > 0
      ? ((currentAOV - previousAOV) / previousAOV) * 100
      : 0;
  };

  const fetchRecentSales = async () => {
    if (!hasManagerPermission()) {
      setRecentSales([]);
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/dashboard/recent-sales/?limit=10`,
      );
      setRecentSales(
        Array.isArray(response.data) ? response.data : [response.data],
      );
      console.log(`Recent sales:`, response.data);
    } catch (err) {
      console.error("Error fetching recent sales:", err);
      handleAuthError(err);
      setRecentSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove this function entirely

  // Function to refresh all dashboard data
  const refreshDashboardData = async () => {
    if (!isAuthenticated) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchInventoryData(),
        fetchProductsData(),
        fetchSalesData(),
        fetchDashboardStats(),
        fetchRecentSales(),
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Handle time period change

  // Add a useEffect to fetch data when the component mounts or when date range changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventoryData();
      fetchProductsData();
      fetchSalesData();
      fetchDashboardStats();
      fetchRecentSales();
    }
  }, [isAuthenticated, startDate, endDate, currentUserRole]);

  // Update the tooltip styles for better visibility
  const tooltipStyle = {
    backgroundColor: "#252525",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
  };

  // Process sales data for charts
  const salesChartData = salesData.map((period) => ({
    name: period.date,
    completed_revenue: period.completed?.revenue || 0,
    completed_profit: period.completed?.profit || 0,
    credit_revenue: period.credit?.revenue || 0,
    credit_profit: period.credit?.profit || 0,
    total_revenue:
      (period.completed?.revenue || 0) + (period.credit?.revenue || 0),
    total_profit:
      (period.completed?.profit || 0) + (period.credit?.profit || 0),
  }));

  // Process sales by category data
  const salesByCategoryData = productPerformanceData.top_categories.map(
    (category, index) => ({
      name: category.name,
      value: category.revenue,
      fill: ["#6366f1", "#ec4899", "#10b981", "#3b82f6", "#f59e0b"][index % 5],
    }),
  );

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Update the card icons array to use the new data structure
  const cardIcons = [
    {
      id: "revenue",
      icon: <FaMoneyBillWave className="card-icon" />,
      label: "Total Revenue",
      value: hasReportViewPermission()
        ? `XFA ${Math.round(Number(dashboardStats.revenue.total)).toLocaleString()}`
        : "XFA 0",
      change:
        dashboardStats.revenue.trend?.status === "up"
          ? Math.abs(Math.round(dashboardStats.revenue.trend.percentage))
          : dashboardStats.revenue.trend?.status === "down"
            ? -Math.abs(Math.round(dashboardStats.revenue.trend.percentage))
            : 0,
      period: `vs previous period`,
    },
    {
      id: "orders",
      icon: <FaShoppingCart className="card-icon" />,
      label: "Total Orders",
      value: hasReportViewPermission()
        ? Math.round(Number(dashboardStats.orders.total)).toLocaleString()
        : "0",
      change:
        dashboardStats.orders.trend?.status === "up"
          ? Math.abs(Math.round(dashboardStats.orders.trend.percentage))
          : dashboardStats.orders.trend?.status === "down"
            ? -Math.abs(Math.round(dashboardStats.orders.trend.percentage))
            : 0,
      period: `vs previous period`,
    },
    {
      id: "profit",
      icon: <FaChartLine className="card-icon" />,
      label: "Total Profit",
      value: hasReportViewPermission()
        ? `XFA ${Math.round(Number(dashboardStats.profit.total)).toLocaleString()}`
        : "XFA 0",
      change:
        dashboardStats.profit.trend?.status === "up"
          ? Math.abs(Math.round(dashboardStats.profit.trend.percentage))
          : dashboardStats.profit.trend?.status === "down"
            ? -Math.abs(Math.round(dashboardStats.profit.trend.percentage))
            : 0,
      period: `vs previous period`,
    },
  ];

  // Add a new card for outstanding payments
  const outstandingPaymentCard = {
    id: "outstanding",
    icon: <FaMoneyBillWave className="card-icon" />,
    label: "Outstanding Payments",
    value: hasReportViewPermission()
      ? `XFA ${Math.round(Number(dashboardStats.revenue.outstanding || 0)).toLocaleString()}`
      : "XFA 0",
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="title-section">
          <h2>Dashboard</h2>
          <div className="date-range-filter">
            <div className="date-input-container">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="date-input"
              />
            </div>
            <div className="date-input-container">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="date-input"
              />
            </div>
            <button
              className="refresh-btn"
              onClick={refreshDashboardData}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader size={16} className="spin" /> : "Refresh"}
            </button>
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

      <div className="time-period-info">
        <div className="time-period-label">
          <Calendar size={16} />
          <span>
            Viewing data from:{" "}
            <strong>{new Date(startDate).toLocaleDateString()}</strong> to{" "}
            <strong>{new Date(endDate).toLocaleDateString()}</strong>
          </span>
        </div>
      </div>

      <div className="dashboard-cards">
        {cardIcons.map((card) => (
          <div key={card.id} className={`card ${card.id}-card`}>
            <div className="card-icon-wrapper">{card.icon}</div>
            <div className="card-content">
              <h3>{card.label}</h3>
              <div className="card-value">{card.value}</div>
              {card.change !== undefined && (
                <div
                  className={`card-change ${Number(card.change) >= 0 ? "positive" : "negative"}`}
                >
                  <div className="change-indicator">
                    {Number(card.change) >= 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="trend-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 20a1 1 0 01-1-1V9.414l-2.293 2.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 9.414V19a1 1 0 01-1 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="trend-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 4a1 1 0 011 1v9.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L11 14.586V5a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>
                      {Number(card.change) >= 0 ? "+" : ""}
                      {card.id === "revenue" || card.id === "profit"
                        ? `${Math.abs(Number(card.change)).toFixed(1)}%`
                        : card.id === "credit"
                          ? Math.abs(Number(card.change)).toLocaleString()
                          : `${Math.abs(Number(card.change)).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="change-period">{card.period}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add a dedicated card for outstanding payments */}
      </div>

      {/* Sales Performance Chart */}
      <div className="chart sales-chart">
        <h3>Sales Performance</h3>
        {salesChartData.length > 0 && hasReportViewPermission() ? (
          <div style={{ height: "300px" }}>
            <Line
              data={{
                labels: salesChartData.map((item) =>
                  new Date(item.name).toLocaleDateString(),
                ),
                datasets: [
                  {
                    label: "Completed Revenue",
                    data: salesChartData.map((item) => item.completed_revenue),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    fill: true,
                  },
                  {
                    label: "Credit Revenue",
                    data: salesChartData.map((item) => item.credit_revenue),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    fill: true,
                  },
                  {
                    label: "Total Revenue",
                    data: salesChartData.map((item) => item.total_revenue),
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    fill: true,
                    borderWidth: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      color: "#ffffff",
                    },
                  },
                  tooltip: {
                    backgroundColor: tooltipStyle.backgroundColor,
                    titleColor: tooltipStyle.color,
                    bodyColor: tooltipStyle.color,
                    callbacks: {
                      label: (context) => {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                        }
                        return label;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#ffffff",
                    },
                  },
                  y: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#ffffff",
                      callback: (value) => formatCurrency(value),
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="no-data">
            {!hasReportViewPermission()
              ? "Manager or cashier access required to view sales data"
              : "No sales data available for this period"}
          </div>
        )}
      </div>

      {/* Profit Analysis Chart */}
      <div className="chart profit-chart">
        <h3>Profit Analysis</h3>
        {salesChartData.length > 0 && hasReportViewPermission() ? (
          <div style={{ height: "300px" }}>
            <Line
              data={{
                labels: salesChartData.map((item) =>
                  new Date(item.name).toLocaleDateString(),
                ),
                datasets: [
                  {
                    label: "Completed Profit",
                    data: salesChartData.map((item) => item.completed_profit),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    fill: true,
                  },
                  {
                    label: "Credit Profit",
                    data: salesChartData.map((item) => item.credit_profit),
                    borderColor: "#ec4899",
                    backgroundColor: "rgba(236, 72, 153, 0.1)",
                    fill: true,
                  },
                  {
                    label: "Total Profit",
                    data: salesChartData.map((item) => item.total_profit),
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    fill: true,
                    borderWidth: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      color: "#ffffff",
                    },
                  },
                  tooltip: {
                    backgroundColor: tooltipStyle.backgroundColor,
                    titleColor: tooltipStyle.color,
                    bodyColor: tooltipStyle.color,
                    callbacks: {
                      label: (context) => {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                        }
                        return label;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#ffffff",
                    },
                  },
                  y: {
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      color: "#ffffff",
                      callback: (value) => formatCurrency(value),
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="no-data">
            {!hasReportViewPermission()
              ? "Manager or cashier access required to view profit data"
              : "No profit data available for this period"}
          </div>
        )}
      </div>

      <div className="charts-container">
        {/* Top Products Chart */}
        <div className="chart">
          <h3>Top Products</h3>
          {productPerformanceData.top_products.length > 0 ? (
            <div style={{ height: "300px" }}>
              <Bar
                data={{
                  labels: productPerformanceData.top_products.map(
                    (item) => item.name,
                  ),
                  datasets: [
                    {
                      label: "Revenue",
                      data: productPerformanceData.top_products.map(
                        (item) => item.revenue,
                      ),
                      backgroundColor: productPerformanceData.top_products.map(
                        (_, index) =>
                          [
                            "#6366f1",
                            "#ec4899",
                            "#10b981",
                            "#3b82f6",
                            "#f59e0b",
                          ][index % 5],
                      ),
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: tooltipStyle.backgroundColor,
                      titleColor: tooltipStyle.color,
                      bodyColor: tooltipStyle.color,
                      callbacks: {
                        label: (context) => {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.x !== null) {
                            label += formatCurrency(context.parsed.x);
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#ffffff",
                        callback: (value) => formatCurrency(value),
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#ffffff",
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No product performance data available"
                : "Manager access required to view product performance"}
            </div>
          )}
        </div>

        {/* Top Categories Chart */}
        <div className="chart">
          <h3>Top Categories</h3>
          {productPerformanceData.top_categories.length > 0 ? (
            <div style={{ height: "300px" }}>
              <Bar
                data={{
                  labels: productPerformanceData.top_categories.map(
                    (item) => item.name,
                  ),
                  datasets: [
                    {
                      label: "Revenue",
                      data: productPerformanceData.top_categories.map(
                        (item) => item.revenue,
                      ),
                      backgroundColor:
                        productPerformanceData.top_categories.map(
                          (_, index) =>
                            [
                              "#6366f1",
                              "#ec4899",
                              "#10b981",
                              "#3b82f6",
                              "#f59e0b",
                            ][index % 5],
                        ),
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: tooltipStyle.backgroundColor,
                      titleColor: tooltipStyle.color,
                      bodyColor: tooltipStyle.color,
                      callbacks: {
                        label: (context) => {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.x !== null) {
                            label += formatCurrency(context.parsed.x);
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#ffffff",
                        callback: (value) => formatCurrency(value),
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#ffffff",
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No category performance data available"
                : "Manager access required to view category performance"}
            </div>
          )}
        </div>
      </div>

      <div className="secondary-charts">
        {/* Stock Status Chart */}
        <div className="chart">
          <h3>Stock Status</h3>
          {inventoryData.stockStatus.length > 0 ? (
            <div style={{ height: "200px" }}>
              <Doughnut
                data={{
                  labels: inventoryData.stockStatus.map((item) => item.name),
                  datasets: [
                    {
                      data: inventoryData.stockStatus.map((item) => item.value),
                      backgroundColor: inventoryData.stockStatus.map(
                        (item) => item.color,
                      ),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        color: "#ffffff",
                      },
                    },
                    tooltip: {
                      backgroundColor: tooltipStyle.backgroundColor,
                      titleColor: tooltipStyle.color,
                      bodyColor: tooltipStyle.color,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No stock status data available"
                : "Manager access required to view stock status"}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="chart">
          <h3>Recent Sales</h3>
          {recentSales.length > 0 ? (
            <div className="recent-sales">
              {recentSales.slice(0, 10).map((sale, index) => (
                <div key={sale.invoice_id || index} className="sale-item">
                  <div className="sale-info">
                    <p className="sale-name">{sale.customer}</p>
                    <p className="sale-date">
                      {sale.formatted_date ||
                        new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="sale-details">
                    <p
                      className={`sale-status ${sale.margin > 0 ? "completed" : "credit"}`}
                    >
                      {sale.items} items
                    </p>
                    <p className="sale-amount">
                      XFA {Math.round(sale.total).toLocaleString()}
                    </p>
                  </div>
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

        {/* Inventory Alerts */}
        <div className="chart">
          <h3>Inventory Alerts</h3>
          {inventoryData.alerts ? (
            <div className="inventory-alerts">
              <div className="alert-item">
                <div className="alert-icon low-stock">
                  <span>{inventoryData.alerts.lowStock || 0}</span>
                </div>
                <div className="alert-info">
                  <p className="alert-title">Low Stock</p>
                  <p className="alert-desc">Products below minimum quantity</p>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-icon out-of-stock">
                  <span>{inventoryData.alerts.outOfStock || 0}</span>
                </div>
                <div className="alert-info">
                  <p className="alert-title">Out of Stock</p>
                  <p className="alert-desc">Products with zero quantity</p>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-icon overstocked">
                  <span>{inventoryData.alerts.overstocked || 0}</span>
                </div>
                <div className="alert-info">
                  <p className="alert-title">Overstocked</p>
                  <p className="alert-desc">Products with excess inventory</p>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-icon critical">
                  <span>{inventoryData.alerts.critical || 0}</span>
                </div>
                <div className="alert-info">
                  <p className="alert-title">Critical</p>
                  <p className="alert-desc">
                    Products requiring immediate attention
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No inventory alerts available"
                : "Manager access required to view inventory alerts"}
            </div>
          )}
        </div>
      </div>

      {/* Sales by Category Chart */}
      <div className="additional-charts">
        <div className="chart">
          <h3>Sales by Category</h3>
          {salesByCategoryData.length > 0 ? (
            <div style={{ height: "250px" }}>
              <Doughnut
                data={{
                  labels: salesByCategoryData.map((item) => item.name),
                  datasets: [
                    {
                      data: salesByCategoryData.map((item) => item.value),
                      backgroundColor: salesByCategoryData.map(
                        (item) => item.fill,
                      ),
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        color: "#ffffff",
                        padding: 15,
                        font: {
                          size: 12,
                        },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        title: (context) => context[0].label,
                        label: (context) => {
                          const label = context.label || "";
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce(
                            (a, b) => a + b,
                            0,
                          );
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        },
                      },
                      backgroundColor: tooltipStyle.backgroundColor,
                      titleColor: tooltipStyle.color,
                      bodyColor: tooltipStyle.color,
                    },
                  },
                  cutout: "60%",
                }}
              />
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No sales by category data available"
                : "Manager access required to view category data"}
            </div>
          )}
        </div>

        {/* Product Margin Analysis */}
        <div className="chart">
          <h3>Product Margin Analysis</h3>
          {productPerformanceData.top_products.length > 0 ? (
            <div style={{ height: "250px" }}>
              <Bar
                data={{
                  labels: productPerformanceData.top_products.map(
                    (item) => item.name,
                  ),
                  datasets: [
                    {
                      label: "Margin %",
                      data: productPerformanceData.top_products.map(
                        (item) => item.margin,
                      ),
                      backgroundColor: productPerformanceData.top_products.map(
                        (item) => (item.margin >= 0 ? "#10b981" : "#ef4444"),
                      ),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: tooltipStyle.backgroundColor,
                      titleColor: tooltipStyle.color,
                      bodyColor: tooltipStyle.color,
                      callbacks: {
                        label: (context) => {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += `${context.parsed.y.toFixed(1)}%`;
                          }
                          label += `${context.parsed.y.toFixed(1)}%`;
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#ffffff",
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#ffffff",
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="no-data">
              {hasManagerPermission()
                ? "No product margin data available"
                : "Manager access required to view margin data"}
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
                    {showPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
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
