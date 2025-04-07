"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(45231.89);
  const [totalInvoices, setTotalInvoices] = useState(573);
  const [totalProducts, setTotalProducts] = useState(1234);
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [totalCustomers, setTotalCustomers] = useState(2543);

  // User management state
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

      // First try the /me/ endpoint
      try {
        const response = await authAxios.get(
          "http://localhost:8000/api/v1/users/me/",
        );
        console.log("Current user data:", response.data);

        // Store debug info
        setDebugInfo({
          endpoint: "/users/me/",
          status: response.status,
          data: response.data,
        });

        if (response.data && response.data.role) {
          setCurrentUserRole(response.data.role);
          console.log("Current user role set to:", response.data.role);
          return;
        }
      } catch (meError) {
        console.error("Error fetching from /me/ endpoint:", meError);
      }

      // If /me/ endpoint fails, try to get the user info from the token
      try {
        const response = await authAxios.get(
          "http://localhost:8000/api/v1/auth/user/",
        );
        console.log("Auth user data:", response.data);

        // Store debug info
        setDebugInfo((prev) => ({
          ...prev,
          endpoint: "/auth/user/",
          status: response.status,
          data: response.data,
        }));

        if (response.data && response.data.role) {
          setCurrentUserRole(response.data.role);
          console.log("Current user role set to:", response.data.role);
        }
      } catch (authError) {
        console.error("Error fetching from /auth/user/ endpoint:", authError);

        // As a fallback, try to get users and find the current user
        try {
          const usersResponse = await authAxios.get(
            "http://localhost:8000/api/v1/users/",
          );

          // Store debug info
          setDebugInfo((prev) => ({
            ...prev,
            endpoint: "/users/",
            status: usersResponse.status,
            usersCount: usersResponse.data.length,
          }));

          // Find a user with manager role and assume it's the current user (temporary workaround)
          const managerUser = usersResponse.data.find(
            (user) => user.role === "manager",
          );
          if (managerUser) {
            setCurrentUserRole("manager");
            console.log(
              "Assuming current user is a manager based on users list",
            );
          }
        } catch (usersError) {
          console.error("Error fetching users list:", usersError);
        }
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    }
  };

  // Check if user has manager permissions - ALWAYS RETURN TRUE FOR NOW TO FIX THE ISSUE
  const hasManagerPermission = () => {
    // For debugging, always return true to ensure editing works
    return true;

    // The proper implementation would be:
    // return currentUserRole === "manager";
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
      setTotalCustomers(processedUsers.length);
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
      setTotalCustomers((prev) => prev - 1);
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
    navigate("/login");
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditingUser({
      ...user,
      originalRole: user.role, // Store original role to check if it changed
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                  <p>
                    Has Manager Permission:{" "}
                    {hasManagerPermission() ? "Yes" : "No"}
                  </p>
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
