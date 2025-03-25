"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, Package, Calendar, BarChart } from "lucide-react";
import { format } from "date-fns";
import "./reports.css";

const Reports = () => {
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

  // Load saved reports from localStorage on component mount
  useEffect(() => {
    const storedReports = localStorage.getItem("savedReports");
    if (storedReports) {
      setSavedReports(JSON.parse(storedReports));
    }
  }, []);

  // Handle form submission
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an API response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const reportId = `report-${Date.now()}`;
      const generatedDate = new Date();

      if (reportType === "sales") {
        const mockSalesReport = {
          id: reportId,
          date_generated: generatedDate.toISOString(),
          report_data: {
            total_sales: 20,
            total_revenue: 1110600,
            products_sold: [
              {
                product_name: "Product 1",
                total_quantity: 1323,
                total_revenue: 264600,
              },
              {
                product_name: "First",
                total_quantity: 423,
                total_revenue: 846000,
              },
            ],
          },
          report_type: "sales",
          generated_by: "Admin",
          date_range: {
            start: startDate || null,
            end: endDate || null,
          },
        };

        saveReport(mockSalesReport);
        setReport(mockSalesReport);
      } else {
        const mockInventoryReport = {
          id: reportId,
          date_generated: generatedDate.toISOString(),
          report_data: {
            total_products: 15,
            expired_products: 8,
            near_expiry_count: 1,
            low_stock_products: 3,
          },
          report_type: "inventory",
          generated_by: "Admin",
          date_range: {
            start: startDate || null,
            end: endDate || null,
          },
        };

        saveReport(mockInventoryReport);
        setReport(mockInventoryReport);
      }
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save report to localStorage
  const saveReport = (newReport) => {
    const updatedReports = [...savedReports, newReport];
    setSavedReports(updatedReports);
    localStorage.setItem("savedReports", JSON.stringify(updatedReports));
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
    return format(new Date(dateString), "PPP");
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Add tab functionality with useEffect
  useEffect(() => {
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
        document.getElementById(tabId).classList.add("active");
      });
    });
  }, [report]);

  return (
    <div className="report-container">
      <div className="report-wrapper">
        <h1 className="report-title">Report Generator</h1>

        <div className="report-grid">
          {/* Report Generator Form */}
          <div className="report-form-card">
            <div className="report-form-header">
              <h2 className="form-title">Generate Report</h2>
              <p className="form-description">
                Select report type and date range
              </p>
            </div>
            <div className="form-content">
              <div className="form-group">
                <label htmlFor="report-type" className="form-label">
                  Report Type
                </label>
                <select
                  id="report-type"
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                </select>
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
            </div>
            <div className="form-footer">
              <button
                className="generate-btn"
                onClick={handleGenerateReport}
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
                          {savedReport.report_type.toUpperCase()}
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
                      {report.report_type.toUpperCase()}
                    </div>
                  </div>

                  <div className="report-content-section">
                    {report.report_type === "sales" && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Total Sales</p>
                            <p className="stat-value">
                              {report.report_data.total_sales}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Total Revenue</p>
                            <p className="stat-value primary">
                              {formatCurrency(report.report_data.total_revenue)}
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
                                {report.report_data.products_sold.map(
                                  (product, index) => (
                                    <tr key={index}>
                                      <td>{product.product_name}</td>
                                      <td className="text-right">
                                        {product.total_quantity}
                                      </td>
                                      <td className="text-right primary">
                                        {formatCurrency(product.total_revenue)}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                    {report.report_type === "inventory" && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Total Products</p>
                            <p className="stat-value">
                              {report.report_data.total_products}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Expired Products</p>
                            <p className="stat-value danger">
                              {report.report_data.expired_products}
                            </p>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Near Expiry</p>
                            <p className="stat-value warning">
                              {report.report_data.near_expiry_count}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Low Stock</p>
                            <p className="stat-value warning">
                              {report.report_data.low_stock_products}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="report-footer">
                    <p className="generated-by">
                      Generated by:{" "}
                      <span className="user-name">{report.generated_by}</span>
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
                  <button
                    className="tab-trigger"
                    data-tab="details"
                    onClick={() => handleTabChange("details")}
                  >
                    Details
                  </button>
                </div>

                <div className="tab-content active" id="summary">
                  <div className="summary-cards">
                    {report.report_type === "sales" && (
                      <>
                        <div className="summary-card">
                          <div className="summary-card-header">
                            <h3 className="summary-card-title">Total Sales</h3>
                          </div>
                          <div className="summary-card-content">
                            <div className="summary-value-container">
                              <div className="summary-value">
                                {report.report_data.total_sales}
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
                                  report.report_data.total_revenue,
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
                                {report.report_data.products_sold.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

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
                                {report.report_data.total_products}
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
                                {report.report_data.expired_products}
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
                                {report.report_data.low_stock_products}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="tab-content" id="details">
                  <div className="report-details">
                    <div className="details-section">
                      <h3 className="details-title">Report Information</h3>
                      <div className="details-grid">
                        <div className="details-item">
                          <span className="details-label">Report ID:</span>
                          <span className="details-value">{report.id}</span>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Type:</span>
                          <span className="details-value">
                            {report.report_type.toUpperCase()}
                          </span>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Generated On:</span>
                          <span className="details-value">
                            {formatDate(report.date_generated)}
                          </span>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Generated By:</span>
                          <span className="details-value">
                            {report.generated_by}
                          </span>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Start Date:</span>
                          <span className="details-value">
                            {formatDate(report.date_range?.start)}
                          </span>
                        </div>
                        <div className="details-item">
                          <span className="details-label">End Date:</span>
                          <span className="details-value">
                            {formatDate(report.date_range?.end)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {report.report_type === "sales" && (
                      <div className="details-section">
                        <h3 className="details-title">Sales Details</h3>
                        <p className="details-description">
                          This report shows sales performance data including
                          total sales volume, revenue generated, and
                          product-specific performance metrics.
                        </p>
                        <div className="details-highlight">
                          <p>Key findings:</p>
                          <ul>
                            <li>
                              Total sales volume:{" "}
                              <strong>{report.report_data.total_sales}</strong>
                            </li>
                            <li>
                              Total revenue:{" "}
                              <strong>
                                {formatCurrency(
                                  report.report_data.total_revenue,
                                )}
                              </strong>
                            </li>
                            <li>
                              Number of products sold:{" "}
                              <strong>
                                {report.report_data.products_sold.length}
                              </strong>
                            </li>
                            <li>
                              Top performing product:{" "}
                              <strong>
                                {
                                  report.report_data.products_sold[0]
                                    .product_name
                                }
                              </strong>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {report.report_type === "inventory" && (
                      <div className="details-section">
                        <h3 className="details-title">Inventory Details</h3>
                        <p className="details-description">
                          This report provides an overview of current inventory
                          status including total products, expired products,
                          products nearing expiry, and low stock items.
                        </p>
                        <div className="details-highlight">
                          <p>Key findings:</p>
                          <ul>
                            <li>
                              Total products in inventory:{" "}
                              <strong>
                                {report.report_data.total_products}
                              </strong>
                            </li>
                            <li>
                              Expired products:{" "}
                              <strong>
                                {report.report_data.expired_products}
                              </strong>
                            </li>
                            <li>
                              Products nearing expiry:{" "}
                              <strong>
                                {report.report_data.near_expiry_count}
                              </strong>
                            </li>
                            <li>
                              Low stock products:{" "}
                              <strong>
                                {report.report_data.low_stock_products}
                              </strong>
                            </li>
                          </ul>
                        </div>
                      </div>
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
