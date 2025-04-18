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
  X,
  Plus,
  Calendar,
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();

  // Basic state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Report generation state
  const [reportType, setReportType] = useState("inventory");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [period, setPeriod] = useState("daily");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

    // Get current user role and user info
    getCurrentUserInfo();

    // Load saved reports from localStorage first
    loadSavedReportsFromLocalStorage();

    // Then fetch reports from API
    fetchAllReports();
  }, [navigate, token]);

  // Load saved reports from localStorage
  const loadSavedReportsFromLocalStorage = () => {
    try {
      const savedReportsData = localStorage.getItem("savedReportsData");
      if (savedReportsData) {
        const parsedReports = JSON.parse(savedReportsData);
        if (Array.isArray(parsedReports) && parsedReports.length > 0) {
          console.log("Loaded reports from localStorage:", parsedReports);
          setSavedReports(parsedReports);
        }
      }
    } catch (error) {
      console.error("Error loading saved reports from localStorage:", error);
    }
  };

  // Get current user info
  const getCurrentUserInfo = async () => {
    try {
      // Try to get the user info from localStorage first
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.role) {
            setCurrentUserRole(parsedUser.role);
            setCurrentUser(parsedUser);
            console.log("Current user set from localStorage:", parsedUser);
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

        if (userInfoResponse.data) {
          setCurrentUserRole(userInfoResponse.data.role);
          setCurrentUser(userInfoResponse.data);
          console.log("Current user set to:", userInfoResponse.data);
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
        "Could not determine user role from any source, defaulting to cashier",
      );
      setCurrentUserRole("cashier");
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  // Check if user has permission to access reports
  const hasReportAccess = () => {
    return ["manager", "cashier", "stock_keeper"].includes(currentUserRole);
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

  // Helper function to determine report type from report data
  const determineReportType = (reportData) => {
    // Check direct report_type property
    if (reportData.report_type) {
      return reportData.report_type;
    }

    // Check report_data.report_type
    if (reportData.report_data && reportData.report_data.report_type) {
      return reportData.report_data.report_type;
    }

    // Check for inventory_report or sales_report properties
    if (reportData.inventory_report) {
      return "inventory";
    }

    if (reportData.sales_report) {
      return "sales";
    }

    // Check for specific properties in report_data that would indicate a sales report
    if (reportData.report_data) {
      if (
        reportData.report_data.total_completed_sales !== undefined ||
        reportData.report_data.total_completed_revenue !== undefined ||
        reportData.report_data.products_sold
      ) {
        return "sales";
      }
    }

    // Default to the current reportType if we can't determine
    return reportType || "unknown";
  };

  // Save report to local state and localStorage
  const saveReport = (newReport) => {
    if (!newReport) return;

    // Create a completely new, independent copy of the report
    const reportToSave = JSON.parse(JSON.stringify(newReport));

    // Ensure dates are in ISO format
    if (!reportToSave.created_at && !reportToSave.generated_at) {
      reportToSave.created_at = new Date().toISOString();
    }

    // Generate a unique ID if not present
    if (!reportToSave.report_id && !reportToSave.id) {
      reportToSave.report_id = crypto.randomUUID();
    }

    // Standardize the ID field
    if (reportToSave.report_id && !reportToSave.id) {
      reportToSave.id = reportToSave.report_id;
    } else if (reportToSave.id && !reportToSave.report_id) {
      reportToSave.report_id = reportToSave.id;
    }

    // Ensure report_type is set
    if (!reportToSave.report_type) {
      reportToSave.report_type = determineReportType(reportToSave);
    }

    // Update or add the report
    const reportId = reportToSave.id || reportToSave.report_id;
    const existingIndex = savedReports.findIndex(
      (r) => (r.id || r.report_id) === reportId,
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
      // Store the updated reports in localStorage with a unique key
      localStorage.setItem("savedReportsData", JSON.stringify(updatedReports));
      console.log("Saved reports to localStorage:", updatedReports);
    } catch (err) {
      console.error("Error saving reports:", err);
      setError("Failed to save report to local storage");
    }
  };

  // Update the deleteReport function to also update localStorage
  const deleteReport = (reportId, e) => {
    // Stop event propagation to prevent loading the report when clicking delete
    if (e) {
      e.stopPropagation();
    }

    // Filter out the report to delete
    const updatedReports = savedReports.filter((report) => {
      const id = report.id || report.report_id;
      return id !== reportId;
    });

    // Update state and localStorage
    setSavedReports(updatedReports);
    localStorage.setItem("savedReportsData", JSON.stringify(updatedReports));
    console.log("Updated reports after deletion:", updatedReports);

    // If the current report is the one being deleted, clear it
    if (report && (report.id === reportId || report.report_id === reportId)) {
      setReport(null);
    }
  };

  // Download a report as PDF
  const downloadReport = async (reportId, e) => {
    // Stop event propagation to prevent loading the report when clicking download
    if (e) {
      e.stopPropagation();
    }

    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);

      // Use the correct download endpoint from the API with POST method
      const response = await axios({
        method: "post",
        url: "http://localhost:8000/api/v1/report/download-report/",
        data: { report_id: reportId },
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Important for handling file downloads
      });

      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setIsLoading(false);
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Failed to download report. Please try again.");
      setIsLoading(false);
    }
  };

  // Load a report from saved reports
  const loadReport = (reportId) => {
    const reportToLoad = savedReports.find((r) => {
      const id = r.id || r.report_id;
      return id === reportId;
    });

    if (!reportToLoad) {
      console.error("Report not found:", reportId);
      return;
    }

    // Create a completely new, independent copy of the report
    const freshReport = JSON.parse(JSON.stringify(reportToLoad));
    console.log("Loading report:", freshReport);

    // Reset all state variables to prevent data from previous reports affecting the new one
    setInventoryData([]);
    setCurrentPage(1);
    setError(null);
    setInventoryError(null);

    // Determine report type
    const type = determineReportType(freshReport);
    console.log("Determined report type:", type);

    // Set report type
    setReportType(type);

    // Now set the new report
    setReport(freshReport);

    // Set date filters from the saved report if they exist
    if (freshReport.start_date) {
      const startDateObj = new Date(freshReport.start_date);
      setStartDate(startDateObj.toISOString().split("T")[0]);
    } else {
      setStartDate("");
    }

    if (freshReport.end_date) {
      const endDateObj = new Date(freshReport.end_date);
      setEndDate(endDateObj.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }

    // For inventory reports, try to fetch fresh inventory data
    if (type === "inventory") {
      fetchInventoryData(startDate, endDate).catch((err) => {
        console.error("Error fetching inventory data for saved report:", err);
      });
    }
  };

  // Check if user has permission to view report data
  const hasReportViewPermission = () => {
    return ["manager", "cashier", "stock_keeper"].includes(currentUserRole);
  };

  // Fetch all reports from the API
  const fetchAllReports = async () => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.get(
        "http://localhost:8000/api/v1/report/all-report/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("All reports response:", response.data);

      // Process the reports and update the savedReports state
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Process each report to ensure it has a report_type
        const processedReports = response.data.map((report) => {
          if (!report.report_type) {
            report.report_type = determineReportType(report);
          }
          return report;
        });

        // Store reports in localStorage with a unique key
        localStorage.setItem(
          "savedReportsData",
          JSON.stringify(processedReports),
        );
        setSavedReports(processedReports);
        console.log("Saved processed reports:", processedReports);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching all reports:", err);
      setError("Failed to fetch reports. Please try again.");
      setIsLoading(false);
    }
  };

  // Generate a new report
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setCurrentPage(1);
    setInventoryData([]);
    closeReportModal();

    if (!token) {
      setError("Authentication required. Please log in again.");
      setIsGenerating(false);
      navigate("/login");
      return;
    }

    // Check if user has permission to generate reports
    if (!hasReportViewPermission()) {
      setError(
        "You don't have permission to generate reports. Only managers, cashiers, and stock keepers can generate reports.",
      );
      setIsGenerating(false);
      return;
    }

    try {
      // Build query parameters for the GET request
      const params = new URLSearchParams();
      params.append("report_type", reportType);

      // Only add period if no dates are provided
      if (
        (!startDate || startDate.trim() === "") &&
        (!endDate || endDate.trim() === "")
      ) {
        params.append("period", period);
      }
      // Only add dates if they are provided
      else {
        // Format dates for API - only add if they are not empty strings
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
      }

      console.log("Generating report with params:", params.toString());

      // Generate the report using the API
      const response = await axios.get(
        `http://localhost:8000/api/v1/report/generate/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Report generation response:", response.data);

      // Process the response according to the API schema
      if (response.data && response.data.success && response.data.data) {
        const reportData = response.data.data;

        // Create a standardized report object
        const newReport = {
          id: reportData.report_id,
          report_id: reportData.report_id,
          report_type: reportData.report_data.report_type || reportType,
          created_at: reportData.report_data.created_at,
          generated_by: reportData.report_data.generated_by,
          report_data: reportData.report_data,
        };

        console.log("Created new report object:", newReport);

        // Save and set the report
        saveReport(newReport);
        setReport(newReport);

        // If it's an inventory report, fetch inventory data
        if (reportType === "inventory") {
          fetchInventoryData(startDate, endDate);
        }
      } else {
        setError("Invalid response format from the server. Please try again.");
      }
    } catch (err) {
      console.error("Error generating report:", err);

      // Handle API error
      if (err.response) {
        setError(
          err.response.data?.error?.non_field_errors?.[0] ||
            err.response.data?.error?.report_type?.[0] ||
            err.response.data?.error ||
            err.response.data?.message ||
            "Failed to generate report. Please check your inputs.",
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch inventory data
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
      let url = "http://localhost:8000/api/v1/dashboard/inventory/";
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
      if (response.data) {
        setInventoryData(response.data);
        return response.data;
      }

      return [];
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

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";

    if (!hasReportViewPermission()) {
      return "NaN";
    }

    // Check if the amount is negative
    const isNegative = amount < 0;
    // Use absolute value for display but keep the minus sign
    const displayAmount = isNegative
      ? `XAF -${Math.abs(amount)}`
      : `XAF ${amount}`;

    // Return with a CSS class for negative values
    return isNegative
      ? `<span class="negative-value">${displayAmount}</span>`
      : displayAmount;
  };

  // Format date with readable time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);

      // Format the date part
      const formattedDate = format(date, "PPP");

      // Format the time part in 12-hour format with AM/PM
      const formattedTime = format(date, "h:mm a");

      return `${formattedDate} at ${formattedTime}`;
    } catch (err) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
  };

  // Handle report type selection
  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setError(null);

    // Clear inventory data when switching report types
    if (type !== "inventory") {
      setInventoryData([]);
      setInventoryError(null);
    }
  };

  // Handle period selection
  const handlePeriodSelect = (selectedPeriod) => {
    setPeriod(selectedPeriod);
    setError(null);
  };

  // Modal controls
  const openReportModal = () => {
    // Reset form fields when opening the modal
    setReportType("inventory");
    setStartDate("");
    setEndDate("");
    setPeriod("daily");
    setError(null);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  // Render inventory data table
  const renderInventoryDataTable = () => {
    // Check if we have inventory data
    if (
      !inventoryData ||
      !inventoryData.stockData ||
      inventoryData.stockData.length === 0
    ) {
      return (
        <div className="empty-inventory-message">
          <Package size={48} className="icon-package" />
          <p>No inventory data found for the selected date range</p>
          <button
            className="refresh-inventory-btn"
            onClick={() => fetchInventoryData(startDate, endDate)}
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
    const currentItems = inventoryData.stockData.slice(
      indexOfFirstItem,
      indexOfLastItem,
    );
    const totalPages = Math.ceil(inventoryData.stockData.length / itemsPerPage);

    return (
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="text-right">In Stock</th>
              <th className="text-right">Low Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => {
              // Determine row class based on status
              const isLowStock = item.lowStock > 0;
              const isOutOfStock = item.outOfStock !== "In stock";
              const rowClass = isOutOfStock
                ? "out-of-stock-row"
                : isLowStock
                  ? "low-stock-row"
                  : "";

              return (
                <tr key={index} className={rowClass}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.inStock}</td>
                  <td className="text-right">{item.lowStock}</td>
                  <td className={isOutOfStock ? "status-warning" : ""}>
                    {item.outOfStock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination controls */}
        {renderPaginationControls(inventoryData.stockData.length, totalPages)}
      </div>
    );
  };

  // Render sales data table
  const renderSalesDataTable = () => {
    // Check if we have sales data
    if (
      !report ||
      !report.report_data ||
      !report.report_data.products_sold ||
      report.report_data.products_sold.length === 0
    ) {
      return (
        <div className="empty-inventory-message">
          <ShoppingCart size={48} className="icon-shopping-cart" />
          <p>No sales data found for the selected date range</p>
        </div>
      );
    }

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = report.report_data.products_sold.slice(
      indexOfFirstItem,
      indexOfLastItem,
    );
    const totalPages = Math.ceil(
      report.report_data.products_sold.length / itemsPerPage,
    );

    return (
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Revenue</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.product__name}</td>
                <td className="text-right">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="text-right">{item.total_quantity}</td>
                <td
                  className="text-right"
                  dangerouslySetInnerHTML={{
                    __html: formatCurrency(item.total_revenue),
                  }}
                ></td>
                <td>{formatDate(item.period)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        {renderPaginationControls(
          report.report_data.products_sold.length,
          totalPages,
        )}
      </div>
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
    if (!inventoryData || !inventoryData.stockStatus) {
      return {
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        overstocked: 0,
      };
    }

    const stats = {
      totalProducts: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      overstocked: inventoryData.alerts?.overstocked || 0,
    };

    // Calculate totals from stockStatus
    inventoryData.stockStatus.forEach((status) => {
      stats.totalProducts += status.value;

      if (status.name === "In Stock") {
        stats.inStock = status.value;
      } else if (status.name === "Low Stock") {
        stats.lowStock = status.value;
      } else if (status.name === "Out of Stock") {
        stats.outOfStock = status.value;
      }
    });

    return stats;
  };

  // Refresh a report
  const refreshReport = async () => {
    if (!report) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      const currentReportType =
        report.report_type ||
        (report.report_data && report.report_data.report_type) ||
        determineReportType(report);

      params.append("report_type", currentReportType);

      // Only add period if no dates are provided
      if (
        (!startDate || startDate.trim() === "") &&
        (!endDate || endDate.trim() === "")
      ) {
        params.append("period", period);
      }
      // Only add dates if they are provided
      else {
        if (startDate) {
          const formattedStartDate = new Date(startDate);
          formattedStartDate.setUTCHours(0, 0, 0, 0);
          params.append("start_date", formattedStartDate.toISOString());
        }

        if (endDate) {
          const formattedEndDate = new Date(endDate);
          formattedEndDate.setUTCHours(23, 59, 59, 999);
          params.append("end_date", formattedEndDate.toISOString());
        }
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
      if (response.data && response.data.success && response.data.data) {
        const reportData = response.data.data;

        // Create a standardized report object
        const newReport = {
          id: reportData.report_id,
          report_id: reportData.report_id,
          report_type: reportData.report_data.report_type || currentReportType,
          created_at: reportData.report_data.created_at,
          generated_by: reportData.report_data.generated_by,
          report_data: reportData.report_data,
        };

        console.log("Created refreshed report object:", newReport);

        // Save and set the report
        saveReport(newReport);
        setReport(newReport);

        // If it's an inventory report, fetch inventory data
        if (currentReportType === "inventory") {
          fetchInventoryData(startDate, endDate);
        }
      } else {
        setError("Invalid response format from the server. Please try again.");
      }
    } catch (err) {
      console.error("Error refreshing report:", err);
      if (err.response) {
        setError(
          err.response.data?.error?.non_field_errors?.[0] ||
            err.response.data?.error?.report_type?.[0] ||
            err.response.data?.error ||
            err.response.data?.message ||
            "Failed to refresh report. Please try again.",
        );
      } else {
        setError("Network error. Please check your connection.");
      }
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
              Access denied. Only managers, cashiers, and stock keepers can
              access reports.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to safely access nested report data
  const getReportData = (path) => {
    if (!report) return null;

    // Handle direct properties on report
    if (report[path] !== undefined) {
      return report[path];
    }

    // Handle properties in report_data
    if (report.report_data && report.report_data[path] !== undefined) {
      return report.report_data[path];
    }

    return null;
  };

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

              {/* Saved Reports Section */}
              {savedReports.length > 0 && (
                <div className="saved-reports-section">
                  <h3 className="saved-reports-title">
                    <Database size={16} className="section-icon" />
                    Saved Reports
                  </h3>
                  <div className="saved-reports-list">
                    {savedReports.map((savedReport) => {
                      const reportId = savedReport.id || savedReport.report_id;
                      const reportType =
                        savedReport.report_type ||
                        (savedReport.report_data &&
                          savedReport.report_data.report_type) ||
                        determineReportType(savedReport);
                      const createdAt =
                        savedReport.created_at ||
                        (savedReport.report_data &&
                          savedReport.report_data.created_at) ||
                        savedReport.generated_at;

                      return (
                        <div
                          key={reportId}
                          className="saved-report-item"
                          onClick={() => loadReport(reportId)}
                        >
                          <div className="saved-report-info">
                            <div className="saved-report-type">
                              {reportType === "inventory" ? (
                                <Package
                                  size={14}
                                  className="report-type-icon"
                                />
                              ) : (
                                <BarChart
                                  size={14}
                                  className="report-type-icon"
                                />
                              )}
                              {reportType.toUpperCase()}
                            </div>
                            <div className="saved-report-date">
                              <Calendar size={12} className="date-icon" />
                              {formatDate(createdAt)}
                            </div>
                          </div>
                          <div className="saved-report-actions">
                            <button
                              className="download-report-btn"
                              onClick={(e) => downloadReport(reportId, e)}
                              title="Download report"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              className="delete-report-btn"
                              onClick={(e) => deleteReport(reportId, e)}
                              title="Delete report"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                  ? `Generated on ${formatDate(report.created_at || (report.report_data && report.report_data.created_at))}`
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

              {!report && !error && !isGenerating && !isLoadingInventory && (
                <div className="empty-state">
                  <FileText className="empty-icon" />
                  <p className="empty-text">
                    Click "Generate New Report" to create a report
                  </p>
                </div>
              )}

              {(isGenerating || isLoadingInventory) && (
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
                      {report.report_type === "inventory" ||
                      (report.report_data &&
                        report.report_data.report_type === "inventory") ? (
                        <Package size={14} className="badge-icon" />
                      ) : (
                        <BarChart size={14} className="badge-icon" />
                      )}
                      {(
                        report.report_type ||
                        (report.report_data &&
                          report.report_data.report_type) ||
                        determineReportType(report)
                      ).toUpperCase()}
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
                    {(report.report_type === "sales" ||
                      (report.report_data &&
                        report.report_data.report_type === "sales")) && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon sales">
                              <ShoppingCart
                                size={20}
                                className="icon-shopping-cart"
                              />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Completed Sales</p>
                              <p className="stat-value">
                                {getReportData("total_completed_sales") || 0}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon revenue">
                              <DollarSign size={20} className="icon-dollar" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Completed Revenue</p>
                              <p
                                className={`stat-value ${(getReportData("total_completed_revenue") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("total_completed_revenue") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon credit">
                              <ShoppingCart size={20} className="icon-credit" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Credit Sales</p>
                              <p className="stat-value">
                                {getReportData("total_credit_sales") || 0}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon credit-revenue">
                              <DollarSign
                                size={20}
                                className="icon-credit-revenue"
                              />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Credit Revenue</p>
                              <p
                                className={`stat-value ${(getReportData("total_credit_revenue") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("total_credit_revenue") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon total">
                              <DollarSign size={20} className="icon-total" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Total General</p>
                              <p
                                className={`stat-value ${(getReportData("total_general") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("total_general") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon profit">
                              <DollarSign size={20} className="icon-profit" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Total Profit</p>
                              <p
                                className={`stat-value ${(getReportData("total_profit") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("total_profit") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon advance">
                              <DollarSign size={20} className="icon-advance" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Advance Paid</p>
                              <p
                                className={`stat-value ${(getReportData("total_advance_paid") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("total_advance_paid") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon outstanding">
                              <DollarSign
                                size={20}
                                className="icon-outstanding"
                              />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Money Outstanding</p>
                              <p
                                className={`stat-value ${(getReportData("money_outstanding") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("money_outstanding") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <div className="stat-card-icon credit-profit">
                              <DollarSign
                                size={20}
                                className="icon-credit-profit"
                              />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Credit Profit</p>
                              <p
                                className={`stat-value ${(getReportData("credit_profit") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("credit_profit") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-card-icon marge">
                              <DollarSign size={20} className="icon-marge" />
                            </div>
                            <div className="stat-content">
                              <p className="stat-label">Marge</p>
                              <p
                                className={`stat-value ${(getReportData("marge") || 0) < 0 ? "negative-value" : "primary"}`}
                              >
                                {formatCurrency(
                                  getReportData("marge") || 0,
                                ).replace(/<\/?span.*?>/g, "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="report-table-section">
                          <h4 className="table-title">
                            <ShoppingCart size={16} className="table-icon" />
                            Products Sold
                          </h4>
                          {renderSalesDataTable()}
                        </div>
                      </>
                    )}

                    {/* Inventory Report */}
                    {(report.report_type === "inventory" ||
                      (report.report_data &&
                        report.report_data.report_type === "inventory")) &&
                      inventoryData && (
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
                              <div className="stat-card-icon">
                                <Package size={20} className="stat-icon" />
                              </div>
                              <div className="stat-content">
                                <p className="stat-label">In Stock</p>
                                <p className="stat-value">
                                  {getInventoryStats().inStock}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="report-stats">
                            <div className="stat-card">
                              <div className="stat-card-icon warning">
                                <AlertCircle size={20} className="stat-icon" />
                              </div>
                              <div className="stat-content">
                                <p className="stat-label">Low Stock</p>
                                <p className="stat-value warning">
                                  {getInventoryStats().lowStock}
                                </p>
                              </div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-card-icon">
                                <Package size={20} className="stat-icon" />
                              </div>
                              <div className="stat-content">
                                <p className="stat-label">Overstocked</p>
                                <p className="stat-value">
                                  {getInventoryStats().overstocked}
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
                        {report.generated_by ||
                          (report.report_data &&
                            report.report_data.generated_by) ||
                          "System"}
                      </span>
                    </p>
                    <div className="report-timestamp">
                      <Clock size={14} className="timestamp-icon" />
                      <span>
                        {formatDate(
                          report.created_at ||
                            (report.report_data &&
                              report.report_data.created_at),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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

              {/* Period Selection */}
              <div className="report-type-section">
                <h4>
                  <Clock size={16} className="section-icon" />
                  Period
                </h4>
                <div className="report-type-buttons">
                  <button
                    type="button"
                    className={`report-type-btn ${period === "daily" ? "active" : ""}`}
                    onClick={() => handlePeriodSelect("daily")}
                  >
                    <Calendar size={18} />
                    <span>Daily</span>
                  </button>
                  <button
                    type="button"
                    className={`report-type-btn ${period === "weekly" ? "active" : ""}`}
                    onClick={() => handlePeriodSelect("weekly")}
                  >
                    <Calendar size={18} />
                    <span>Weekly</span>
                  </button>
                  <button
                    type="button"
                    className={`report-type-btn ${period === "monthly" ? "active" : ""}`}
                    onClick={() => handlePeriodSelect("monthly")}
                  >
                    <Calendar size={18} />
                    <span>Monthly</span>
                  </button>
                  <button
                    type="button"
                    className={`report-type-btn ${period === "yearly" ? "active" : ""}`}
                    onClick={() => handlePeriodSelect("yearly")}
                  >
                    <Calendar size={18} />
                    <span>Yearly</span>
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
                  disabled={isGenerating}
                >
                  {isGenerating ? (
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
