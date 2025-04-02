"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Loader2,
  FileText,
  Package,
  Calendar,
  BarChart,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./reports.css";

const Reports = () => {
  // Navigation
  const navigate = useNavigate();

  // Form state
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Report state
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [debugInfo, setDebugInfo] = useState(null);

  // Check for authentication token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if no token exists
      navigate("/login");
      return;
    }

    // Load saved reports if authenticated
    const storedReports = localStorage.getItem("savedReports");
    if (storedReports) {
      try {
        const parsedReports = JSON.parse(storedReports);
        setSavedReports(parsedReports || []);
      } catch (err) {
        console.error("Error parsing saved reports:", err);
        localStorage.removeItem("savedReports"); // Clear corrupted data
        setSavedReports([]);
      }
    }
  }, [navigate]);

  // Handle report type selection
  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setError(null);
  };

  // Handle form submission
  const handleGenerateReport = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    // Get the authentication token
    const token = localStorage.getItem("token");
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

      // Add date parameters if they exist
      if (startDate) {
        params.append("start_date", startDate);
      }

      if (endDate) {
        params.append("end_date", endDate);
      }

      // Debug log
      console.log("Request params:", params.toString());

      // Make the GET request with authentication token
      const response = await axios.get(
        `http://localhost:8000/api/v1/report/generate/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Get report data from API response
      const responseData = response.data;
      console.log("Response data:", responseData);

      // Check if the API returned a success response
      if (!responseData.success) {
        setError(responseData.message || "Failed to generate report");
        return;
      }

      // Restructure the data to match what the frontend expects
      const reportData = {
        id: responseData.data.report_id || `report-${Date.now()}`,
        report_type: responseData.data.report_data.report_type,
        date_generated: new Date().toISOString(), // Add current date since API doesn't provide it
        generated_by: responseData.data.report_data.generated_by || "Unknown",
        date_range: {
          start: startDate || null,
          end: endDate || null,
        },
        report_data: responseData.data.report_data,
      };

      console.log("Processed report data:", reportData);

      // Save the report
      saveReport(reportData);
      setReport(reportData);
    } catch (err) {
      console.error("API error:", err);

      // Handle authentication errors specifically
      if (err.response && err.response.status === 401) {
        setError("Authentication expired. Please log in again.");
        localStorage.removeItem("token"); // Clear invalid token
        setTimeout(() => navigate("/login"), 2000); // Redirect after showing message
        return;
      }

      // Enhanced error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);

        // Set detailed error message
        if (err.response.status === 400) {
          setError(
            `API Error (400): ${err.response.data?.detail || err.response.data?.message || "Invalid request parameters"}`,
          );
        } else if (err.response.status === 500) {
          setError(
            `Server Error (500): ${err.response.data?.detail || err.response.data?.message || "Internal server error"}`,
          );
        } else {
          setError(
            `Error ${err.response.status}: ${err.response.data?.detail || err.response.data?.message || "Unknown error"}`,
          );
        }

        // Save debug info
        setDebugInfo({
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError(
          "No response received from server. Please check if the server is running.",
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", err.message);
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save report to localStorage
  const saveReport = (newReport) => {
    if (!newReport) return;

    // Create a deep copy to avoid reference issues
    const reportToSave = JSON.parse(JSON.stringify(newReport));

    // Check if a report with this ID already exists
    const existingReportIndex = savedReports.findIndex(
      (r) => r.id === reportToSave.id,
    );

    let updatedReports;
    if (existingReportIndex >= 0) {
      // Update existing report
      updatedReports = [...savedReports];
      updatedReports[existingReportIndex] = reportToSave;
    } else {
      // Add new report
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
    if (reportToLoad) {
      setReport(reportToLoad);
    }
  };

  // Delete a saved report
  const deleteReport = (reportId, e) => {
    e.stopPropagation();
    const updatedReports = savedReports.filter((r) => r.id !== reportId);
    setSavedReports(updatedReports);
    localStorage.setItem("savedReports", JSON.stringify(updatedReports));

    // If the current report is deleted, clear it
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

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Add tab functionality with useEffect
  useEffect(() => {
    if (!report) return; // Don't run if there's no report

    const tabTriggers = document.querySelectorAll(".tab-trigger");
    const tabContents = document.querySelectorAll(".tab-content");

    tabTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const tabId = trigger.getAttribute("data-tab");

        // Remove active class from all triggers and contents
        tabTriggers.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        // Add active class to clicked trigger and corresponding content
        trigger.classList.add("active");
        document.getElementById(tabId)?.classList.add("active");
      });
    });
  }, [report]);

  // For testing purposes - generate a mock report if API is not ready
  const generateMockReport = () => {
    const mockReport = {
      id: `mock-${Date.now()}`,
      report_type: reportType,
      date_generated: new Date().toISOString(),
      generated_by: "Test User",
      date_range: {
        start: startDate || null,
        end: endDate || null,
      },
      report_data:
        reportType === "sales"
          ? {
              total_sales: 145,
              total_revenue: 1250000,
              products_sold: [
                {
                  product_name: "Product A",
                  total_quantity: 50,
                  total_revenue: 500000,
                },
                {
                  product_name: "Product B",
                  total_quantity: 35,
                  total_revenue: 350000,
                },
                {
                  product_name: "Product C",
                  total_quantity: 60,
                  total_revenue: 400000,
                },
              ],
            }
          : {
              total_products: 267,
              expired_products: 12,
              near_expiry_count: 24,
              low_stock_products: 18,
            },
    };

    saveReport(mockReport);
    setReport(mockReport);
    setError("Note: Using mock data since API is not connected");
  };

  return (
    <div className="report-container">
      <div className="report-wrapper">
        <div className="report-header-bar">
          <h1 className="report-title">Report Generator</h1>
        </div>

        <div className="report-grid">
          {/* Report Generator Form */}
          <div className="report-form-card">
            <div className="report-form-header">
              <h2 className="form-title">Generate Report</h2>
              <p className="form-description">
                Select report type and date range
              </p>
            </div>
            <form className="form-content" onSubmit={handleGenerateReport}>
              {/* Report Type Buttons */}
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

              <div className="form-group">
                <label htmlFor="start-date" className="form-label">
                  Start Date (Optional)
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-date" className="form-label">
                  End Date (Optional)
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-footer">
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
                {/* <button
                  type="button"
                  className="generate-btn mock-btn"
                  onClick={generateMockReport}
                  disabled={isLoading}
                >
                  <span className="btn-content">
                    <FileText className="btn-icon" />
                    Generate Mock Report
                  </span>
                </button> */}
              </div>
            </form>

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
                          {savedReport.report_type?.toUpperCase() || "UNKNOWN"}
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

              {!report && !error && !isLoading && (
                <div className="empty-state">
                  <FileText className="empty-icon" />
                  <p className="empty-text">
                    Select a report type and click "Generate Report" to view
                    results
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="loading-state">
                  <Loader2 className="loading-icon spin" />
                  <p className="loading-text">Generating your report...</p>
                </div>
              )}

              {report && (
                <div className="report-data">
                  <div className="report-header-section">
                    <div className="report-type-badge">
                      {report.report_type?.toUpperCase() || "UNKNOWN"}
                    </div>
                  </div>

                  <div className="report-content-section">
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
                              <tbody>
                                {Array.isArray(
                                  report.report_data.products_sold,
                                ) ? (
                                  report.report_data.products_sold.map(
                                    (product, index) => (
                                      <tr key={index}>
                                        <td>{product.product_name}</td>
                                        <td className="text-right">
                                          {product.total_quantity}
                                        </td>
                                        <td className="text-right primary">
                                          {formatCurrency(
                                            product.total_revenue,
                                          )}
                                        </td>
                                      </tr>
                                    ),
                                  )
                                ) : (
                                  <tr>
                                    <td colSpan="3">
                                      No product data available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                    {report.report_type === "inventory" &&
                      report.report_data && (
                        <>
                          <div className="report-stats">
                            <div className="stat-card">
                              <p className="stat-label">Total Products</p>
                              <p className="stat-value">
                                {report.report_data.total_products || 0}
                              </p>
                            </div>
                            <div className="stat-card">
                              <p className="stat-label">Expired Products</p>
                              <p className="stat-value danger">
                                {report.report_data.expired_products || 0}
                              </p>
                            </div>
                          </div>

                          <div className="report-stats">
                            <div className="stat-card">
                              <p className="stat-label">Near Expiry</p>
                              <p className="stat-value warning">
                                {report.report_data.near_expiry_count || 0}
                              </p>
                            </div>
                            <div className="stat-card">
                              <p className="stat-label">Low Stock</p>
                              <p className="stat-value warning">
                                {report.report_data.low_stock_products || 0}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

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
                              <tbody>
                                {Array.isArray(
                                  report.report_data.returned_products,
                                ) ? (
                                  report.report_data.returned_products.map(
                                    (product, index) => (
                                      <tr key={index}>
                                        <td>{product.product_name}</td>
                                        <td className="text-right">
                                          {product.quantity}
                                        </td>
                                        <td className="text-right danger">
                                          {formatCurrency(product.value)}
                                        </td>
                                        <td>{product.reason || "N/A"}</td>
                                      </tr>
                                    ),
                                  )
                                ) : (
                                  <tr>
                                    <td colSpan="4">
                                      No return data available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}

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
                              <tbody>
                                {Array.isArray(
                                  report.report_data.expired_products,
                                ) ? (
                                  report.report_data.expired_products.map(
                                    (product, index) => (
                                      <tr key={index}>
                                        <td>{product.product_name}</td>
                                        <td className="text-right">
                                          {product.quantity}
                                        </td>
                                        <td>
                                          {formatDate(product.expiry_date)}
                                        </td>
                                        <td className="text-right danger">
                                          {formatCurrency(product.loss_value)}
                                        </td>
                                      </tr>
                                    ),
                                  )
                                ) : (
                                  <tr>
                                    <td colSpan="4">
                                      No expired product data available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
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
                        {report.generated_by || ""}
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
                    onClick={() => handleTabChange("summary")}
                  >
                    Summary
                  </button>
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

                    {report.report_type === "inventory" &&
                      report.report_data && (
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
                                  {report.report_data.total_products || 0}
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
                                <div className="summary-value">
                                  {report.report_data.expired_products || 0}
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
                                <div className="summary-value">
                                  {report.report_data.low_stock_products || 0}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
