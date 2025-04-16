"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  FileText,
  Package,
  BarChart,
  RefreshCw,
  AlertCircle,
  Info,
  X,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CreditCard,
  Clock,
  CheckCircle,
  Users,
  Percent,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ChevronsUp,
  ChevronsDown,
  Zap,
  Shield,
} from "lucide-react";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();

  // Basic state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Report generation state
  const [reportType, setReportType] = useState("inventory");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Report data state
  const [report, setReport] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");

  // Inventory specific state
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Authentication check on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Get current user role
    getCurrentUserRole();

    // Check if user has permission to view reports
    const userRole = localStorage.getItem("userRole") || "";
    const userData = localStorage.getItem("user");
    let role = "";

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.role) {
          role = parsedUser.role;
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    if (
      role !== "manager" &&
      role !== "cashier" &&
      userRole !== "manager" &&
      userRole !== "cashier"
    ) {
      setError(
        "You don't have permission to view reports. Only managers and cashiers can access this page.",
      );
    }

    // Load saved reports from localStorage
    try {
      const storedReports = localStorage.getItem("savedReports");
      if (storedReports) {
        setSavedReports(JSON.parse(storedReports));
      }
    } catch (err) {
      console.error("Error loading saved reports:", err);
      localStorage.removeItem("savedReports");
    }
  }, [navigate, token]);

  // Get current user role
  const getCurrentUserRole = async () => {
    try {
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
        const authAxios = getAuthAxios();
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
    }
  };

  // Check if user has permission to access reports
  const hasReportAccess = () => {
    return currentUserRole === "manager" || currentUserRole === "cashier";
  };

  // Create axios instance with authentication headers
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // Tab switching effect
  useEffect(() => {
    if (!report) return;

    const tabTriggers = document.querySelectorAll(".tab-trigger");
    const tabContents = document.querySelectorAll(".tab-content");

    const handleTabClick = (e) => {
      const tabId = e.currentTarget.getAttribute("data-tab");

      // Update active classes
      tabTriggers.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      e.currentTarget.classList.add("active");
      document.getElementById(tabId)?.classList.add("active");
    };

    // Add event listeners
    tabTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleTabClick);
    });

    // Cleanup
    return () => {
      tabTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleTabClick);
      });
    };
  }, [report]);

  // Modify the saveReport function to create a completely independent copy of the report data
  const saveReport = (newReport) => {
    if (!newReport) return;

    // Create a completely new, independent copy of the report
    const reportToSave = JSON.parse(JSON.stringify(newReport));

    // Ensure dates are in ISO format
    if (
      !reportToSave.date_generated ||
      !reportToSave.date_generated.includes("T")
    ) {
      reportToSave.date_generated = new Date().toISOString();
    }

    if (reportToSave.date_range) {
      if (
        reportToSave.date_range.start &&
        !reportToSave.date_range.start.includes("T")
      ) {
        reportToSave.date_range.start = new Date(
          reportToSave.date_range.start,
        ).toISOString();
      }
      if (
        reportToSave.date_range.end &&
        !reportToSave.date_range.end.includes("T")
      ) {
        reportToSave.date_range.end = new Date(
          reportToSave.date_range.end,
        ).toISOString();
      }
    }

    // Update or add the report
    const existingIndex = savedReports.findIndex(
      (r) => r.id === reportToSave.id,
    );
    let updatedReports;

    if (existingIndex >= 0) {
      updatedReports = [...savedReports];
      updatedReports[existingIndex] = reportToSave;
    } else {
      updatedReports = [...savedReports, reportToSave];
    }

    try {
      setSavedReports(updatedReports);
      localStorage.setItem("savedReports", JSON.stringify(updatedReports));
    } catch (err) {
      console.error("Error saving reports:", err);
      setError("Failed to save report to local storage");
    }
  };

  // Delete a saved report
  const deleteReport = (reportId, e) => {
    // Stop event propagation to prevent loading the report when clicking delete
    if (e) {
      e.stopPropagation();
    }

    // Filter out the report to delete
    const updatedReports = savedReports.filter(
      (report) => report.id !== reportId,
    );

    // Update state and localStorage
    setSavedReports(updatedReports);
    localStorage.setItem("savedReports", JSON.stringify(updatedReports));

    // If the current report is the one being deleted, clear it
    if (report && report.id === reportId) {
      setReport(null);
    }
  };

  // Modify the loadReport function to ensure it properly displays the complete API response
  const loadReport = (reportId) => {
    const reportToLoad = savedReports.find((r) => r.id === reportId);
    if (!reportToLoad) return;

    // Create a completely new, independent copy of the report
    const freshReport = JSON.parse(JSON.stringify(reportToLoad));

    // Reset all state variables to prevent data from previous reports affecting the new one
    setInventoryData([]);
    setCurrentPage(1);
    setError(null);
    setInventoryError(null);
    setDebugInfo(null);

    // Now set the new report
    setReport(freshReport);
    setReportType(freshReport.report_type);

    // Set date filters from the saved report
    if (freshReport.date_range) {
      if (freshReport.date_range.start) {
        const startDateObj = new Date(freshReport.date_range.start);
        setStartDate(startDateObj.toISOString().split("T")[0]);
      } else {
        setStartDate("");
      }

      if (freshReport.date_range.end) {
        const endDateObj = new Date(freshReport.date_range.end);
        setEndDate(endDateObj.toISOString().split("T")[0]);
      } else {
        setEndDate("");
      }
    } else {
      // Ensure dates are cleared if no date range exists
      setStartDate("");
      setEndDate("");
    }

    console.log("Loaded report data:", freshReport.report_data);

    // For inventory reports, try to fetch fresh data
    if (freshReport.report_type === "inventory") {
      fetchInventoryData(
        freshReport.date_range?.start
          ? new Date(freshReport.date_range.start).toISOString().split("T")[0]
          : "",
        freshReport.date_range?.end
          ? new Date(freshReport.date_range.end).toISOString().split("T")[0]
          : "",
      ).catch((err) => {
        console.error("Error fetching inventory data for saved report:", err);

        // If API returns "No inventory report found", use saved data
        if (err.response?.data?.error === "No inventory report found.") {
          console.log("Using saved inventory data");
          if (freshReport.report_data?.products) {
            setInventoryData([...freshReport.report_data.products]);
          }
        }
      });
    }
  };

  // Add this function to check if the user has permission to view report data
  const hasReportViewPermission = () => {
    const userRole = localStorage.getItem("userRole") || "";
    const userData = localStorage.getItem("user");
    let role = "";

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.role) {
          role = parsedUser.role;
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    return (
      role === "manager" ||
      role === "cashier" ||
      userRole === "manager" ||
      userRole === "cashier"
    );
  };

  // Modify the handleGenerateReport function to properly save the complete API response
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setCurrentPage(1);
    // Reset inventory data to prevent data from previous reports affecting the new one
    setInventoryData([]);
    // Reset the report to null to clear any previous report data
    setReport(null);
    closeReportModal();

    if (!token) {
      setError("Authentication required. Please log in again.");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    // Check if user has permission to generate reports
    if (!hasReportViewPermission()) {
      setError(
        "You don't have permission to generate reports. Only managers and cashiers can generate reports.",
      );
      setIsLoading(false);
      return;
    }

    try {
      // Create query parameters
      const params = new URLSearchParams({
        report_type: reportType,
      });

      // Format dates for API - only add if they are not empty
      if (startDate && startDate.trim() !== "") {
        const formattedStartDate = new Date(startDate);
        formattedStartDate.setUTCHours(0, 0, 0, 0);
        params.append("start_date", formattedStartDate.toISOString());
      }

      if (endDate && endDate.trim() !== "") {
        const formattedEndDate = new Date(endDate);
        formattedEndDate.setUTCHours(23, 59, 59, 999);
        params.append("end_date", formattedEndDate.toISOString());
      }

      console.log("Generating report with params:", params.toString());

      // For inventory reports, fetch inventory data first with the same date parameters
      let inventoryItems = [];
      if (reportType === "inventory") {
        inventoryItems = await fetchInventoryData(startDate, endDate);
      }

      // Generate the report using the API for all report types
      const response = await axios.get(
        `http://localhost:8000/api/v1/report/generate/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Report generation response:", response.data);

      // Process the response
      const responseData = response.data;

      if (!responseData.success && !responseData.data?.report_data) {
        throw new Error(responseData.message || "Failed to generate report");
      }

      // Create a new report object with a unique ID
      const reportData = {
        id: `report-${Date.now()}`, // Always generate a new ID for each report
        report_type: responseData.data?.report_data?.report_type || reportType,
        date_generated: new Date().toISOString(),
        generated_by: responseData.data?.report_data?.generated_by || "System",
        date_range: {
          start:
            startDate && startDate.trim() !== ""
              ? new Date(startDate).toISOString()
              : null,
          end:
            endDate && endDate.trim() !== ""
              ? new Date(endDate).toISOString()
              : null,
        },
        report_data:
          responseData.data?.report_data || createEmptyReportData(reportType),
        // Store the complete API response for reference
        api_response: responseData,
      };

      // For inventory reports, add the inventory data
      if (reportType === "inventory" && inventoryItems.length > 0) {
        reportData.report_data.products = [...inventoryItems]; // Create a new array
        reportData.report_data.total_products = inventoryItems.length;
        reportData.report_data.expired_count = inventoryItems.filter(
          (item) => item.is_expired,
        ).length;
        reportData.report_data.low_stock_count = inventoryItems.filter(
          (item) => item.is_critical,
        ).length;
        reportData.report_data.near_expiry_count = inventoryItems.filter(
          (item) => item.is_near_expiry,
        ).length;
      }

      // Save and set the report
      saveReport(reportData);
      setReport(JSON.parse(JSON.stringify(reportData))); // Set a fresh copy
    } catch (err) {
      console.error("Error generating report:", err);

      handleApiError(err, "report generation");

      // Create empty report for "No inventory report found" error
      if (err.response?.data?.error === "No inventory report found.") {
        const emptyReport = {
          id: `report-${Date.now()}`, // Always generate a new ID
          report_type: reportType,
          date_generated: new Date().toISOString(),
          generated_by: "System",
          date_range: {
            start:
              startDate && startDate.trim() !== ""
                ? new Date(startDate).toISOString()
                : null,
            end:
              endDate && endDate.trim() !== ""
                ? new Date(endDate).toISOString()
                : null,
          },
          report_data: createEmptyReportData(reportType),
        };

        saveReport(emptyReport);
        setReport(JSON.parse(JSON.stringify(emptyReport))); // Set a fresh copy
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the fetchInventoryData function to use the token
  const fetchInventoryData = async (
    useStartDate = startDate,
    useEndDate = endDate,
  ) => {
    setIsLoadingInventory(true);
    setInventoryError(null);

    if (!token) {
      setInventoryError("Authentication required. Please log in again.");
      setIsLoadingInventory(false);
      return [];
    }

    try {
      // Build URL with query parameters
      let url = "http://localhost:8000/api/v1/report/inventory-data/";
      const params = new URLSearchParams();

      // Only add date parameters if they are not empty strings
      if (useStartDate && useStartDate.trim() !== "") {
        params.append("start_date", useStartDate);
      }

      if (useEndDate && useEndDate.trim() !== "") {
        params.append("end_date", useEndDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Fetching inventory data from:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Inventory API response:", response.data);

      // Process the response data
      let inventoryItems = [];

      if (Array.isArray(response.data)) {
        inventoryItems = [...response.data]; // Create a new array
      } else if (
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        inventoryItems = [...response.data.results]; // Create a new array
      } else if (response.data) {
        // Handle case where a single item is returned
        inventoryItems = [{ ...response.data }]; // Create a new object
      }

      // Remove duplicates using product name and category as key
      const uniqueItems = Array.from(
        new Map(
          inventoryItems.map((item) => [
            `${item.product_name || item.name}-${item.category}`,
            { ...item }, // Create a new object for each item
          ]),
        ).values(),
      );

      setInventoryData(uniqueItems);
      return uniqueItems;
    } catch (err) {
      console.error("Error fetching inventory data:", err);

      // Handle different error scenarios
      if (!err.response) {
        setInventoryError("Network error. Please check your connection.");
        return [];
      }

      if (err.response.status === 401) {
        setInventoryError("Authentication expired. Please log in again.");
        localStorage.removeItem("token");
        setToken(null);
        setTimeout(() => navigate("/login"), 2000);
        return [];
      }

      // Special handling for "No inventory report found"
      if (err.response.data?.error === "No inventory report found.") {
        console.log("No inventory data found for the selected date range");
        setInventoryData([]);
        return [];
      }

      // Handle other errors
      setInventoryError(
        err.response.data?.detail ||
          err.response.data?.message ||
          err.response.data?.error ||
          "Failed to fetch inventory data",
      );
      return [];
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Create empty report data structure based on report type
  const createEmptyReportData = (type) => {
    switch (type) {
      case "inventory":
        return {
          report_type: type,
          total_products: 0,
          expired_count: 0,
          low_stock_count: 0,
          near_expiry_count: 0,
          products: [],
        };
      case "sales":
        return {
          report_type: type,
          total_completed_sales: 0,
          total_completed_revenue: 0,
          total_credit_sales: 0,
          total_credit_amount: 0,
          total_advance_paid: 0,
          total_remaining_amount: 0,
          cash_in_hand: 0,
          products_sold: [],
        };
      default:
        return { report_type: type };
    }
  };

  // Handle API errors
  const handleApiError = (err, context) => {
    if (!err.response) {
      setError(
        `Network error during ${context}. Please check your connection.`,
      );
      return;
    }

    if (err.response.status === 401) {
      setError("Authentication expired. Please log in again.");
      localStorage.removeItem("token");
      setToken(null);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Set detailed error message
    let errorMessage = `Error during ${context}: `;

    if (err.response.status === 400) {
      errorMessage +=
        err.response.data?.detail ||
        err.response.data?.message ||
        err.response.data?.error ||
        "Invalid request parameters";
    } else if (err.response.status === 500) {
      errorMessage +=
        err.response.data?.detail ||
        err.response.data?.message ||
        "Internal server error";
    } else {
      errorMessage +=
        err.response.data?.detail ||
        err.response.data?.message ||
        err.response.data?.error ||
        "Unknown error";
    }

    setError(errorMessage);

    // Save debug info
    setDebugInfo({
      status: err.response.status,
      data: err.response.data,
      headers: err.response.headers,
    });
  };

  // Format currency - preserve exact decimal values
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";

    if (!hasReportViewPermission()) {
      return "NaN";
    }

    // Return the exact value with XAF prefix, preserving decimals
    return `XAF ${amount}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return format(new Date(dateString), "PPP");
    } catch (err) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
  };

  // Handle report type selection
  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setError(null);

    // Clear inventory data when switching report types to prevent data leakage
    if (type !== "inventory") {
      setInventoryData([]);
      setInventoryError(null);
    } else {
      // Only fetch inventory data if we're switching to inventory report type
      fetchInventoryData("", "");
    }
  };

  // Modal controls
  const openReportModal = () => {
    // Reset form fields when opening the modal
    setReportType("inventory");
    setStartDate("");
    setEndDate("");
    setError(null);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  // Render inventory data table with pagination
  const renderInventoryDataTable = () => {
    // Determine which data to use - prioritize fresh inventory data
    const dataToUse =
      inventoryData.length > 0
        ? inventoryData
        : report?.report_data?.products || [];

    if (!dataToUse || dataToUse.length === 0) {
      return (
        <div className="empty-inventory-message">
          <Package size={48} />
          <p>No inventory data found for the selected date range</p>
          <button
            className="refresh-inventory-btn"
            onClick={() =>
              fetchInventoryData(
                report?.date_range?.start
                  ? new Date(report.date_range.start)
                      .toISOString()
                      .split("T")[0]
                  : "",
                report?.date_range?.end
                  ? new Date(report.date_range.end).toISOString().split("T")[0]
                  : "",
              )
            }
          >
            <RefreshCw size={16} />
            Refresh Inventory Data
          </button>
        </div>
      );
    }

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataToUse.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataToUse.length / itemsPerPage);

    return (
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th className="text-right">Price</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Min Qty</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={index}
                  className={
                    item.is_expired
                      ? "expired-row"
                      : item.is_critical
                        ? "critical-row"
                        : ""
                  }
                >
                  <td>{item.product_name || item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.subcategory}</td>
                  <td className="text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{item.min_quantity}</td>
                  <td>{formatDate(item.expiry_date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        {renderPaginationControls(dataToUse.length, totalPages)}
      </div>
    );
  };

  // Render paginated table for any data type
  const renderPaginatedTable = (items, columns) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length}>No data available</td>
          </tr>
        </tbody>
      );
    }

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
      <>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`${column.align === "right" ? "text-right" : ""} ${column.className || ""}`}
                >
                  {column.format
                    ? column.format(item[column.key])
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {/* Pagination controls */}
        {items.length > itemsPerPage && (
          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                {renderPaginationControls(items.length, totalPages)}
              </td>
            </tr>
          </tfoot>
        )}
      </>
    );
  };

  // Reusable pagination controls
  const renderPaginationControls = (totalItems, totalPages) => {
    if (totalItems <= itemsPerPage) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  // Get inventory stats
  const getInventoryStats = () => {
    const dataToUse =
      inventoryData.length > 0
        ? inventoryData
        : report?.report_data?.products || [];

    return {
      totalProducts: dataToUse.length,
      expiredCount: dataToUse.filter((item) => item.is_expired).length,
      lowStockCount: dataToUse.filter((item) => item.is_critical).length,
      nearExpiryCount: dataToUse.filter((item) => item.is_near_expiry).length,
    };
  };

  // Add a function to refresh a report from the API
  const refreshReport = async () => {
    if (!report) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create query parameters
      const params = new URLSearchParams({
        report_type: report.report_type,
      });

      // Add date parameters if they exist
      if (report.date_range?.start) {
        params.append(
          "start_date",
          new Date(report.date_range.start).toISOString(),
        );
      }

      if (report.date_range?.end) {
        params.append(
          "end_date",
          new Date(report.date_range.end).toISOString(),
        );
      }

      // Generate the report using the API
      const response = await axios.get(
        `http://localhost:8000/api/v1/report/generate/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Refreshed report response:", response.data);

      // Process the response
      const responseData = response.data;

      if (!responseData.success && !responseData.data?.report_data) {
        throw new Error(responseData.message || "Failed to refresh report");
      }

      // Update the report with fresh data
      const updatedReport = {
        ...report,
        date_generated: new Date().toISOString(),
        report_data:
          responseData.data?.report_data ||
          createEmptyReportData(report.report_type),
        api_response: responseData,
      };

      // For inventory reports, refresh inventory data
      if (report.report_type === "inventory") {
        const inventoryItems = await fetchInventoryData(
          report.date_range?.start
            ? new Date(report.date_range.start).toISOString().split("T")[0]
            : "",
          report.date_range?.end
            ? new Date(report.date_range.end).toISOString().split("T")[0]
            : "",
        );

        if (inventoryItems.length > 0) {
          updatedReport.report_data.products = [...inventoryItems];
          updatedReport.report_data.total_products = inventoryItems.length;
          updatedReport.report_data.expired_count = inventoryItems.filter(
            (item) => item.is_expired,
          ).length;
          updatedReport.report_data.low_stock_count = inventoryItems.filter(
            (item) => item.is_critical,
          ).length;
          updatedReport.report_data.near_expiry_count = inventoryItems.filter(
            (item) => item.is_near_expiry,
          ).length;
        }
      }

      // Save and set the updated report
      saveReport(updatedReport);
      setReport(JSON.parse(JSON.stringify(updatedReport)));
    } catch (err) {
      console.error("Error refreshing report:", err);
      handleApiError(err, "report refresh");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has access to the reports page
  if (!hasReportAccess()) {
    return (
      <div className="report-container">
        <div className="report-wrapper">
          <div className="error-message">
            <AlertCircle size={20} className="error-icon" />
            <span>
              Access denied. Only managers and cashiers can access reports.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-wrapper">
        <div className="report-header-bar">
          <h1 className="report-title">
            <FileText className="title-icon" />
            Report Generator
          </h1>
        </div>

        <div className="report-grid">
          {/* Report Generator Section */}
          <div className="report-form-card">
            <div className="report-form-header">
              <h2 className="form-title">
                <BarChart className="form-title-icon" />
                Generate Report
              </h2>
              <p className="form-description">
                Create and view detailed reports
              </p>
            </div>
            <div className="form-content">
              {/* Generate Report Button */}
              <button onClick={openReportModal} className="generate-report-btn">
                <Plus size={18} />
                <span>Generate New Report</span>
              </button>

              {/* Debug Info */}
              {debugInfo && (
                <div className="debug-section">
                  <h3 className="debug-title">
                    <Info size={16} className="debug-icon" />
                    Debug Information
                  </h3>
                  <div className="debug-content">
                    <p>Status: {debugInfo.status}</p>
                    <p>Error: {JSON.stringify(debugInfo.data)}</p>
                  </div>
                </div>
              )}

              {/* Saved Reports Section */}
              {savedReports.length > 0 && (
                <div className="saved-reports-section">
                  <h3 className="saved-reports-title">
                    <Database size={16} className="section-icon" />
                    Saved Reports
                  </h3>
                  <div className="saved-reports-list">
                    {savedReports.map((savedReport) => (
                      <div
                        key={savedReport.id}
                        className="saved-report-item"
                        onClick={() => loadReport(savedReport.id)}
                      >
                        <div className="saved-report-info">
                          <div className="saved-report-type">
                            {savedReport.report_type === "inventory" ? (
                              <Package size={14} className="report-type-icon" />
                            ) : (
                              <BarChart
                                size={14}
                                className="report-type-icon"
                              />
                            )}
                            {savedReport.report_type?.toUpperCase() ||
                              "UNKNOWN"}
                          </div>
                          <div className="saved-report-date">
                            <Calendar size={12} className="date-icon" />
                            {formatDate(savedReport.date_generated)}
                          </div>
                        </div>
                        <button
                          className="delete-report-btn"
                          onClick={(e) => deleteReport(savedReport.id, e)}
                          title="Delete report"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Display */}
          <div className="report-results-card">
            <div className="report-results-header">
              <h2 className="results-title">
                <FileText className="results-title-icon" />
                Report Results
              </h2>
              <p className="results-description">
                {report
                  ? `Generated on ${formatDate(report.date_generated)}`
                  : "No report generated yet"}
              </p>
            </div>
            <div className="results-content">
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} className="error-icon" />
                  <span>{error}</span>
                </div>
              )}
              {inventoryError && (
                <div className="error-message">
                  <AlertCircle size={18} className="error-icon" />
                  <span>{inventoryError}</span>
                </div>
              )}

              {!report && !error && !isLoading && !isLoadingInventory && (
                <div className="empty-state">
                  <FileText className="empty-icon" />
                  <p className="empty-text">
                    Click "Generate New Report" to create a report
                  </p>
                </div>
              )}

              {(isLoading || isLoadingInventory) && (
                <div className="loading-state">
                  <Loader2 className="loading-icon spin" />
                  <p className="loading-text">Generating your report...</p>
                </div>
              )}

              {report && (
                <div className="report-data">
                  {/* Report Header with Date Range */}
                  <div className="report-header-section">
                    <div className="report-type-badge">
                      {report.report_type === "inventory" ? (
                        <Package size={14} className="badge-icon" />
                      ) : (
                        <BarChart size={14} className="badge-icon" />
                      )}
                      {report.report_type?.toUpperCase() || "UNKNOWN"}
                    </div>
                    {(startDate || endDate) && (
                      <div className="date-filter-info">
                        <Calendar size={14} className="filter-icon" />
                        <span className="date-filter-label">Date Range:</span>
                        <span className="date-filter-value">
                          {startDate ? formatDate(startDate) : "All time"} -
                          {endDate ? formatDate(endDate) : "Present"}
                        </span>
                      </div>
                    )}
                    <button
                      className="refresh-report-btn"
                      onClick={refreshReport}
                      title="Refresh report data from API"
                    >
                      <RefreshCw size={16} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="report-content-section">
                    {/* Sales Report */}
                    {report.report_type === "sales" && report.report_data && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon">
                              <ShoppingCart size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Completed Sales</p>
                              <p className="stat-value">
                                {report.report_data.total_completed_sales || 0}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon revenue">
                              <DollarSign size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Completed Revenue</p>
                              <p className="stat-value primary">
                                {formatCurrency(
                                  report.report_data.total_completed_revenue ||
                                    0,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon credit">
                              <CreditCard size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Credit Sales</p>
                              <p className="stat-value">
                                {report.report_data.total_credit_sales || 0}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon warning">
                              <AlertCircle size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Credit Amount</p>
                              <p className="stat-value warning">
                                {formatCurrency(
                                  report.report_data.total_credit_amount || 0,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon advance">
                              <Wallet size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Advance Paid</p>
                              <p className="stat-value">
                                {formatCurrency(
                                  report.report_data.total_advance_paid || 0,
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon danger">
                              <TrendingDown size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Remaining Amount</p>
                              <p className="stat-value danger">
                                {formatCurrency(
                                  report.report_data.total_remaining_amount ||
                                    0,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon cash">
                              <DollarSign size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Cash in Hand</p>
                              <p className="stat-value primary">
                                {formatCurrency(
                                  report.report_data.cash_in_hand || 0,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-table-section">
                          <h4 className="table-title">
                            <ShoppingCart size={16} className="table-icon" />
                            Products Sold
                          </h4>
                          <div className="table-container">
                            <table className="report-table">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th className="text-right">Quantity</th>
                                  <th className="text-right">Revenue</th>
                                </tr>
                              </thead>
                              {Array.isArray(
                                report.report_data.products_sold,
                              ) ? (
                                renderPaginatedTable(
                                  report.report_data.products_sold,
                                  [
                                    { key: "product__name", label: "Product" },
                                    {
                                      key: "total_quantity",
                                      label: "Quantity",
                                      align: "right",
                                    },
                                    {
                                      key: "total_revenue",
                                      label: "Revenue",
                                      align: "right",
                                      format: formatCurrency,
                                      className: "primary",
                                    },
                                  ],
                                )
                              ) : (
                                <tbody>
                                  <tr>
                                    <td colSpan="3">
                                      No product data available
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Inventory Report */}
                    {report.report_type === "inventory" && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon inventory">
                              <Package size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Total Products</p>
                              <p className="stat-value">
                                {getInventoryStats().totalProducts}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon danger">
                              <AlertCircle size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Expired Products</p>
                              <p className="stat-value danger">
                                {getInventoryStats().expiredCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon warning">
                              <Clock size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Near Expiry</p>
                              <p className="stat-value warning">
                                {getInventoryStats().nearExpiryCount}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon warning">
                              <ChevronsDown size={20} className="stat-icon" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Low Stock</p>
                              <p className="stat-value warning">
                                {getInventoryStats().lowStockCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Inventory Data Table */}
                        <div className="report-table-section">
                          <h4 className="table-title">
                            <Database size={16} className="table-icon" />
                            Detailed Inventory
                          </h4>
                          {renderInventoryDataTable()}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="report-footer">
                    <p className="generated-by">
                      <Users size={14} className="user-icon" />
                      Generated by:{" "}
                      <span className="user-name">
                        {report.generated_by || "System"}
                      </span>
                    </p>
                    <div className="report-timestamp">
                      <Clock size={14} className="timestamp-icon" />
                      <span>{formatDate(report.date_generated)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Dashboard */}
        {report && (
          <div className="dashboard-card">
            <div className="dashboard-header">
              <h2 className="dashboard-title">
                <BarChart size={18} className="dashboard-icon" />
                Report Dashboard
              </h2>
              <p className="dashboard-description"></p>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-tabs">
                <div className="tabs-list">
                  <button
                    className="tab-trigger active"
                    data-tab="summary"
                    onClick={() => setActiveTab("summary")}
                  >
                    <Zap size={16} className="tab-icon" />
                    Summary
                  </button>
                  {report.report_type === "inventory" && (
                    <button
                      className="tab-trigger"
                      data-tab="inventory-details"
                      onClick={() => setActiveTab("inventory-details")}
                    >
                      <Package size={16} className="tab-icon" />
                      Inventory Details
                    </button>
                  )}
                </div>

                <div className="tab-content active" id="summary">
                  <div className="summary-cards">
                    {report.report_type === "sales" && report.report_data && (
                      <>
                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <ShoppingCart
                                size={16}
                                className="summary-icon"
                              />
                              Completed Sales
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.total_completed_sales || 0}
                              </div>
                              <div className="stat-change">
                                <span className="positive">
                                  <TrendingUp
                                    size={14}
                                    className="trend-icon"
                                  />
                                  +5%
                                </span>
                                <span className="period">vs. last period</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <DollarSign size={16} className="summary-icon" />
                              Completed Revenue
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value">
                                {formatCurrency(
                                  report.report_data.total_completed_revenue ||
                                    0,
                                )}
                              </p>
                              <div className="stat-change">
                                <span className="positive">
                                  <TrendingUp
                                    size={14}
                                    className="trend-icon"
                                  />
                                  +8.2%
                                </span>
                                <span className="period">vs. last period</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <CreditCard size={16} className="summary-icon" />
                              Credit Sales
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value">
                                {report.report_data.total_credit_sales || 0}
                              </p>
                              <div className="stat-change">
                                <span className="negative">
                                  <TrendingDown
                                    size={14}
                                    className="trend-icon"
                                  />
                                  -2.1%
                                </span>
                                <span className="period">vs. last period</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <Wallet size={16} className="summary-icon" />
                              Cash in Hand
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value primary">
                                {formatCurrency(
                                  report.report_data.cash_in_hand || 0,
                                )}
                              </p>
                              <div className="stat-change">
                                <span className="positive">
                                  <TrendingUp
                                    size={14}
                                    className="trend-icon"
                                  />
                                  +12.5%
                                </span>
                                <span className="period">vs. last period</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <Package size={16} className="summary-icon" />
                              Products Sold
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value">
                                {Array.isArray(report.report_data.products_sold)
                                  ? report.report_data.products_sold.length
                                  : 0}
                              </p>
                              <div className="stat-change">
                                <span className="positive">
                                  <TrendingUp
                                    size={14}
                                    className="trend-icon"
                                  />
                                  +3.7%
                                </span>
                                <span className="period">vs. last period</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Inventory Dashboard Summary */}
                    {report.report_type === "inventory" && (
                      <>
                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <Package size={16} className="summary-icon" />
                              Total Products
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value">
                                {getInventoryStats().totalProducts}
                              </p>
                              <div className="stat-change">
                                <span className="positive">
                                  <ChevronsUp
                                    size={14}
                                    className="trend-icon"
                                  />
                                  In Stock
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <AlertCircle size={16} className="summary-icon" />
                              Expired Products
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value danger">
                                {getInventoryStats().expiredCount}
                              </div>
                              <div className="stat-change">
                                <span className="negative">
                                  <Percent size={14} className="trend-icon" />
                                  {getInventoryStats().totalProducts > 0
                                    ? (
                                        (getInventoryStats().expiredCount /
                                          getInventoryStats().totalProducts) *
                                        100
                                      ).toFixed(1)
                                    : 0}
                                  % of inventory
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              <Shield size={16} className="summary-icon" />
                              Low Stock
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value warning">
                                {getInventoryStats().lowStockCount}
                              </div>
                              <div className="stat-change">
                                <span className="warning">
                                  <Percent size={14} className="trend-icon" />
                                  {getInventoryStats().totalProducts > 0
                                    ? (
                                        (getInventoryStats().lowStockCount /
                                          getInventoryStats().totalProducts) *
                                        100
                                      ).toFixed(1)
                                    : 0}
                                  % of inventory
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {report.report_type === "inventory" && (
                  <div className="tab-content" id="inventory-details">
                    <div className="inventory-details-section">
                      <div className="inventory-filters">
                        <div className="filter-badges">
                          <span className="filter-label">
                            <Filter size={14} className="filter-icon" />
                            Quick Filters:
                          </span>
                          <button className="filter-badge all active">
                            All
                          </button>
                          <button className="filter-badge critical">
                            Low Stock
                          </button>
                          <button className="filter-badge expired">
                            Expired
                          </button>
                        </div>
                      </div>

                      <div className="inventory-details-table">
                        {renderInventoryDataTable()}
                      </div>

                      <div className="inventory-summary">
                        <div className="inventory-summary-item">
                          <Info size={16} />
                          <span>
                            Products with quantity below minimum stock level are
                            marked as <strong>Low Stock</strong>
                          </span>
                        </div>
                        <div className="inventory-summary-item">
                          <AlertCircle size={16} />
                          <span>
                            Products past their expiration date are marked as{" "}
                            <strong>Expired</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {report && report.api_response && debugInfo && (
          <div className="debug-section">
            <h3 className="debug-title">
              <Database size={16} className="debug-icon" />
              API Response
            </h3>
            <div className="debug-content">
              <pre className="debug-json">
                {JSON.stringify(report.api_response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="report-modal">
            <div className="report-modal-header">
              <h3>
                <FileText size={18} className="modal-icon" />
                Generate Report
              </h3>
              <button className="close-modal-btn" onClick={closeReportModal}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleGenerateReport}
              className="report-modal-content"
            >
              <div className="report-type-section">
                <h4>
                  <Filter size={16} className="section-icon" />
                  Report Type
                </h4>
                <div className="report-type-buttons">
                  <button
                    type="button"
                    className={`report-type-btn ${reportType === "inventory" ? "active" : ""}`}
                    onClick={() => handleReportTypeSelect("inventory")}
                  >
                    <Package size={18} />
                    <span>Inventory</span>
                  </button>
                  <button
                    type="button"
                    className={`report-type-btn ${reportType === "sales" ? "active" : ""}`}
                    onClick={() => handleReportTypeSelect("sales")}
                  >
                    <BarChart size={18} />
                    <span>Sales</span>
                  </button>
                </div>
              </div>

              <div className="date-range-section">
                <h4>
                  <Calendar size={16} className="section-icon" />
                  Date Range (Optional)
                </h4>
                <div className="date-inputs">
                  <div className="form-group">
                    <label htmlFor="start-date" className="form-label">
                      <Calendar size={14} className="input-icon" />
                      Start Date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        console.log("Start date set to:", e.target.value);
                      }}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end-date" className="form-label">
                      <Calendar size={14} className="input-icon" />
                      End Date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        console.log("End date set to:", e.target.value);
                      }}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="report-modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeReportModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="generate-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="btn-content">
                      <Loader2 className="btn-icon spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="btn-content">
                      <FileText className="btn-icon" />
                      Generate Report
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
