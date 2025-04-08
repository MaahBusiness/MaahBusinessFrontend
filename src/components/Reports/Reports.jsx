"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  FileText,
  Package,
  Calendar,
  BarChart,
  RefreshCw,
  AlertCircle,
  Info,
  X,
  Plus,
} from "lucide-react";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();

  // Basic state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

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

  // Fetch inventory data from API
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
        inventoryItems = response.data;
      } else if (
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        inventoryItems = response.data.results;
      } else if (response.data) {
        // Handle case where a single item is returned
        inventoryItems = [response.data];
      }

      // Remove duplicates using product name and category as key
      const uniqueItems = Array.from(
        new Map(
          inventoryItems.map((item) => [
            `${item.product_name || item.name}-${item.category}`,
            item,
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

  // Generate a new report
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

      // Generate the report
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

      // Create report object
      const reportData = {
        id: responseData.data?.report_id || `report-${Date.now()}`,
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
      };

      // For inventory reports, add the inventory data
      if (reportType === "inventory" && inventoryItems.length > 0) {
        reportData.report_data.products = inventoryItems;
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
      setReport(reportData);
    } catch (err) {
      console.error("Error generating report:", err);

      handleApiError(err, "report generation");

      // Create empty report for "No inventory report found" error
      if (err.response?.data?.error === "No inventory report found.") {
        const emptyReport = {
          id: `report-${Date.now()}`,
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
        setReport(emptyReport);
      }
    } finally {
      setIsLoading(false);
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
          total_sales: 0,
          total_revenue: 0,
          products_sold: [],
        };
      case "returns":
        return {
          report_type: type,
          total_returns: 0,
          total_return_value: 0,
          return_rate: 0,
          returned_products: [],
        };
      case "expired":
        return {
          report_type: type,
          total_expired: 0,
          total_loss_value: 0,
          expiry_rate: 0,
          expired_products: [],
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

  // Save report to localStorage
  const saveReport = (newReport) => {
    if (!newReport) return;

    // Create a deep copy
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

  // Load a saved report
  const loadReport = (reportId) => {
    const reportToLoad = savedReports.find((r) => r.id === reportId);
    if (!reportToLoad) return;

    // Reset all state variables to prevent data from previous reports affecting the new one
    setInventoryData([]);
    setCurrentPage(1);
    setError(null);
    setInventoryError(null);
    setDebugInfo(null);

    // Now set the new report
    setReport(reportToLoad);
    setReportType(reportToLoad.report_type);

    // Set date filters from the saved report
    if (reportToLoad.date_range) {
      if (reportToLoad.date_range.start) {
        const startDateObj = new Date(reportToLoad.date_range.start);
        setStartDate(startDateObj.toISOString().split("T")[0]);
      } else {
        setStartDate("");
      }

      if (reportToLoad.date_range.end) {
        const endDateObj = new Date(reportToLoad.date_range.end);
        setEndDate(endDateObj.toISOString().split("T")[0]);
      } else {
        setEndDate("");
      }
    } else {
      // Ensure dates are cleared if no date range exists
      setStartDate("");
      setEndDate("");
    }

    // For inventory reports, try to fetch fresh data
    if (reportToLoad.report_type === "inventory") {
      fetchInventoryData(
        reportToLoad.date_range?.start
          ? new Date(reportToLoad.date_range.start).toISOString().split("T")[0]
          : "",
        reportToLoad.date_range?.end
          ? new Date(reportToLoad.date_range.end).toISOString().split("T")[0]
          : "",
      ).catch((err) => {
        console.error("Error fetching inventory data for saved report:", err);

        // If API returns "No inventory report found", use saved data
        if (err.response?.data?.error === "No inventory report found.") {
          console.log("Using saved inventory data");
          if (reportToLoad.report_data?.products) {
            setInventoryData(reportToLoad.report_data.products);
          }
        }
      });
    }
  };

  // Delete a saved report
  const deleteReport = (reportId, e) => {
    e.stopPropagation();

    const updatedReports = savedReports.filter((r) => r.id !== reportId);
    setSavedReports(updatedReports);
    localStorage.setItem("savedReports", JSON.stringify(updatedReports));

    // Clear current report if it's the one being deleted
    if (report && report.id === reportId) {
      setReport(null);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          Previous
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
          Next
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

  return (
    <div className="report-container">
      <div className="report-wrapper">
        <div className="report-header-bar">
          <h1 className="report-title">Report Generator</h1>
        </div>

        <div className="report-grid">
          {/* Report Generator Section */}
          <div className="report-form-card">
            <div className="report-form-header">
              <h2 className="form-title">Generate Report</h2>
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
                  <h3 className="debug-title">Debug Information</h3>
                  <div className="debug-content">
                    <p>Status: {debugInfo.status}</p>
                    <p>Error: {JSON.stringify(debugInfo.data)}</p>
                  </div>
                </div>
              )}

              {/* Saved Reports Section */}
              {savedReports.length > 0 && (
                <div className="saved-reports-section">
                  <h3 className="saved-reports-title">Saved Reports</h3>
                  <div className="saved-reports-list">
                    {savedReports.map((savedReport) => (
                      <div
                        key={savedReport.id}
                        className="saved-report-item"
                        onClick={() => loadReport(savedReport.id)}
                      >
                        <div className="saved-report-info">
                          <div className="saved-report-type">
                            {savedReport.report_type?.toUpperCase() ||
                              "UNKNOWN"}
                          </div>
                          <div className="saved-report-date">
                            {formatDate(savedReport.date_generated)}
                          </div>
                        </div>
                        <button
                          className="delete-report-btn"
                          onClick={(e) => deleteReport(savedReport.id, e)}
                          title="Delete report"
                        >
                          ×
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
              <h2 className="results-title">Report Results</h2>
              <p className="results-description">
                {report
                  ? `Generated on ${formatDate(report.date_generated)}`
                  : "No report generated yet"}
              </p>
            </div>
            <div className="results-content">
              {error && <div className="error-message">{error}</div>}
              {inventoryError && (
                <div className="error-message">{inventoryError}</div>
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
                      {report.report_type?.toUpperCase() || "UNKNOWN"}
                    </div>
                    {(startDate || endDate) && (
                      <div className="date-filter-info">
                        <span className="date-filter-label">Date Range:</span>
                        <span className="date-filter-value">
                          {startDate ? formatDate(startDate) : "All time"} -
                          {endDate ? formatDate(endDate) : "Present"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="report-content-section">
                    {/* Sales Report */}
                    {report.report_type === "sales" && report.report_data && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Total Sales</p>
                            <p className="stat-value">
                              {report.report_data.total_sales || 0}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Total Revenue</p>
                            <p className="stat-value primary">
                              {formatCurrency(
                                report.report_data.total_revenue || 0,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="report-table-section">
                          <h4 className="table-title">Products Sold</h4>
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
                            <p className="stat-label">Total Products</p>
                            <p className="stat-value">
                              {getInventoryStats().totalProducts}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Expired Products</p>
                            <p className="stat-value danger">
                              {getInventoryStats().expiredCount}
                            </p>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Near Expiry</p>
                            <p className="stat-value warning">
                              {getInventoryStats().nearExpiryCount}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Low Stock</p>
                            <p className="stat-value warning">
                              {getInventoryStats().lowStockCount}
                            </p>
                          </div>
                        </div>

                        {/* Detailed Inventory Data Table */}
                        <div className="report-table-section">
                          <h4 className="table-title">Detailed Inventory</h4>
                          {renderInventoryDataTable()}
                        </div>
                      </>
                    )}

                    {/* Returns Report */}
                    {report.report_type === "returns" && report.report_data && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Total Returns</p>
                            <p className="stat-value">
                              {report.report_data.total_returns || 0}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Return Value</p>
                            <p className="stat-value danger">
                              {formatCurrency(
                                report.report_data.total_return_value || 0,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="report-table-section">
                          <h4 className="table-title">Returned Products</h4>
                          <div className="table-container">
                            <table className="report-table">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th className="text-right">Quantity</th>
                                  <th className="text-right">Value</th>
                                  <th>Reason</th>
                                </tr>
                              </thead>
                              {Array.isArray(
                                report.report_data.returned_products,
                              ) ? (
                                renderPaginatedTable(
                                  report.report_data.returned_products,
                                  [
                                    { key: "product_name", label: "Product" },
                                    {
                                      key: "quantity",
                                      label: "Quantity",
                                      align: "right",
                                    },
                                    {
                                      key: "value",
                                      label: "Value",
                                      align: "right",
                                      format: formatCurrency,
                                      className: "danger",
                                    },
                                    {
                                      key: "reason",
                                      label: "Reason",
                                      format: (val) => val || "N/A",
                                    },
                                  ],
                                )
                              ) : (
                                <tbody>
                                  <tr>
                                    <td colSpan="4">
                                      No return data available
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Expired Products Report */}
                    {report.report_type === "expired" && report.report_data && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Total Expired</p>
                            <p className="stat-value danger">
                              {report.report_data.total_expired || 0}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Loss Value</p>
                            <p className="stat-value danger">
                              {formatCurrency(
                                report.report_data.total_loss_value || 0,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="report-table-section">
                          <h4 className="table-title">Expired Products</h4>
                          <div className="table-container">
                            <table className="report-table">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th className="text-right">Quantity</th>
                                  <th>Expiry Date</th>
                                  <th className="text-right">Loss Value</th>
                                </tr>
                              </thead>
                              {Array.isArray(
                                report.report_data.expired_products,
                              ) ? (
                                renderPaginatedTable(
                                  report.report_data.expired_products,
                                  [
                                    { key: "product_name", label: "Product" },
                                    {
                                      key: "quantity",
                                      label: "Quantity",
                                      align: "right",
                                    },
                                    {
                                      key: "expiry_date",
                                      label: "Expiry Date",
                                      format: formatDate,
                                    },
                                    {
                                      key: "loss_value",
                                      label: "Loss Value",
                                      align: "right",
                                      format: formatCurrency,
                                      className: "danger",
                                    },
                                  ],
                                )
                              ) : (
                                <tbody>
                                  <tr>
                                    <td colSpan="4">
                                      No expired product data available
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="report-footer">
                    <p className="generated-by">
                      Generated by:{" "}
                      <span className="user-name">
                        {report.generated_by || "System"}
                      </span>
                    </p>
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
              <h2 className="dashboard-title">Report Dashboard</h2>
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
                    Summary
                  </button>
                  {report.report_type === "inventory" && (
                    <button
                      className="tab-trigger"
                      data-tab="inventory-details"
                      onClick={() => setActiveTab("inventory-details")}
                    >
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
                            <h3 className="summary-card-title">Total Sales</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.total_sales || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              Total Revenue
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value">
                                {formatCurrency(
                                  report.report_data.total_revenue || 0,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
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
                              Total Products
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <p className="summary-value">
                                {getInventoryStats().totalProducts}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              Expired Products
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value danger">
                                {getInventoryStats().expiredCount}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">Low Stock</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value warning">
                                {getInventoryStats().lowStockCount}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {report.report_type === "returns" && report.report_data && (
                      <>
                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              Total Returns
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.total_returns || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">Return Value</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {formatCurrency(
                                  report.report_data.total_return_value || 0,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">Return Rate</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.return_rate
                                  ? `${report.report_data.return_rate}%`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {report.report_type === "expired" && report.report_data && (
                      <>
                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">
                              Total Expired
                            </h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.total_expired || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">Loss Value</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {formatCurrency(
                                  report.report_data.total_loss_value || 0,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">Expiry Rate</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.expiry_rate
                                  ? `${report.report_data.expiry_rate}%`
                                  : "N/A"}
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
                          <span className="filter-label">Quick Filters:</span>
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
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="report-modal">
            <div className="report-modal-header">
              <h3>Generate Report</h3>
              <button className="close-modal-btn" onClick={closeReportModal}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleGenerateReport}
              className="report-modal-content"
            >
              <div className="report-type-section">
                <h4>Report Type</h4>
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
                  <button
                    type="button"
                    className={`report-type-btn ${reportType === "returns" ? "active" : ""}`}
                    onClick={() => handleReportTypeSelect("returns")}
                  >
                    <RefreshCw size={18} />
                    <span>Returns</span>
                  </button>
                  <button
                    type="button"
                    className={`report-type-btn ${reportType === "expired" ? "active" : ""}`}
                    onClick={() => handleReportTypeSelect("expired")}
                  >
                    <Calendar size={18} />
                    <span>Expired</span>
                  </button>
                </div>
              </div>

              <div className="date-range-section">
                <h4>Date Range (Optional)</h4>
                <div className="date-inputs">
                  <div className="form-group">
                    <label htmlFor="start-date" className="form-label">
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
