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
  X,
  Plus,
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
  const [startTime, setStartTime] = useState("00:00"); // Add start time state
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59"); // Add end time state with default end of day
  const [showReportModal, setShowReportModal] = useState(false);

  // Report state
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Inventory data state
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);

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

    // If inventory type is selected, fetch detailed inventory data
    if (type === "inventory") {
      fetchInventoryData();
    }
  };

  // Open report generation modal
  const openReportModal = () => {
    setShowReportModal(true);
    setError(null);
  };

  // Close report generation modal
  const closeReportModal = () => {
    setShowReportModal(false);
  };

  // Update the fetchInventoryData function to properly handle date-time parameters
  const fetchInventoryData = async () => {
    setIsLoadingInventory(true);
    setInventoryError(null);

    // Get the authentication token
    const token = localStorage.getItem("token");
    if (!token) {
      setInventoryError("Authentication required. Please log in again.");
      setIsLoadingInventory(false);
      return;
    }

    try {
      // Add date parameters to the request if they exist
      let url = "http://localhost:8000/api/v1/report/inventory-data/";
      const params = new URLSearchParams();

      if (startDate) {
        // Combine date and time for more precise filtering
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const formattedStartDate = new Date(startDate);
        formattedStartDate.setHours(startHours, startMinutes, 0, 0);

        // Format as ISO string and ensure it's in the correct format
        const isoStartDate = formattedStartDate.toISOString();
        console.log("Using start date:", isoStartDate);
        params.append("start_date", isoStartDate);
      }

      if (endDate) {
        // Combine date and time for more precise filtering
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        const formattedEndDate = new Date(endDate);
        formattedEndDate.setHours(endHours, endMinutes, 59, 999);

        // Format as ISO string and ensure it's in the correct format
        const isoEndDate = formattedEndDate.toISOString();
        console.log("Using end date:", isoEndDate);
        params.append("end_date", isoEndDate);
      }

      // Append params to URL if any exist
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log("Fetching inventory data from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Inventory data response:", response.data);

      // Use only the API response data
      const inventoryItems = Array.isArray(response.data)
        ? response.data
        : response.data.results || [response.data];

      // Remove duplicates by creating a Map with product_name as key
      const uniqueInventoryMap = new Map();
      inventoryItems.forEach((item) => {
        // Use a combination of product name and category as the unique key
        const key = `${item.product_name}-${item.category}`;
        if (!uniqueInventoryMap.has(key)) {
          uniqueInventoryMap.set(key, item);
        }
      });

      // Convert Map back to array
      const uniqueInventoryItems = Array.from(uniqueInventoryMap.values());

      setInventoryData(uniqueInventoryItems);
    } catch (err) {
      console.error("Error fetching inventory data:", err);

      // Handle authentication errors
      if (err.response && err.response.status === 401) {
        setInventoryError("Authentication expired. Please log in again.");
        setIsLoadingInventory(false);
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Handle "No inventory report found" error gracefully
      if (
        err.response &&
        err.response.data &&
        err.response.data.error === "No inventory report found."
      ) {
        console.log("No inventory data found for the selected date range");
        // Set empty array instead of showing error
        setInventoryData([]);
      } else {
        // For other errors, set the error message
        setInventoryError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch inventory data",
        );
      }
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Add a function to directly query products by date range
  const fetchProductsByDateRange = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Get the authentication token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in again.");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    try {
      // Format dates with time
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(startHours, startMinutes, 0, 0);

      const [endHours, endMinutes] = endTime.split(":").map(Number);
      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(endHours, endMinutes, 59, 999);

      // Create query parameters
      const params = new URLSearchParams({
        start_date: formattedStartDate.toISOString(),
        end_date: formattedEndDate.toISOString(),
      });

      console.log("Fetching products with date range:", params.toString());

      // Make direct request to products API with date filter
      const response = await axios.get(
        `http://localhost:8000/api/v1/product/products/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Products by date range response:", response.data);

      // Process the products data
      const products = response.data.results || [];

      if (products.length === 0) {
        setError("No products found in the selected date range");
      } else {
        // Create a report from the products data
        const reportData = {
          id: `report-${Date.now()}`,
          report_type: "inventory",
          date_generated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          generated_by: "System",
          date_range: {
            start: formattedStartDate.toISOString(),
            end: formattedEndDate.toISOString(),
          },
          report_data: {
            report_type: "inventory",
            total_products: products.length,
            expired_count: products.filter(
              (p) => p.product && p.product.is_expired,
            ).length,
            low_stock_count: products.filter(
              (p) => p.product && p.product.quantity <= p.product.min_quantity,
            ).length,
            near_expiry_count: 0, // Would need logic to determine this
            products: products,
            created_at: new Date().toISOString(),
          },
        };

        // Save and display the report
        saveReport(reportData);
        setReport(reportData);

        // Also update inventory data
        setInventoryData(
          products.map((p) => ({
            product_name: p.product?.name || "Unknown",
            category: p.category?.name || "Uncategorized",
            subcategory: p.subcategory?.name || "",
            unit_price: p.product?.unit_price || 0,
            quantity: p.product?.quantity || 0,
            min_quantity: p.product?.min_quantity || 0,
            expiry_date: p.product?.expiry_date || null,
            is_expired: p.product?.is_expired || false,
            is_critical: p.product?.quantity <= p.product?.min_quantity,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching products by date range:", err);
      setError("Failed to fetch products. Please try again.");

      // Log detailed error information
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
        setDebugInfo({
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed version of handleGenerateReport function - corrected try/catch/finally structure
  const handleGenerateReport = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    // Close the modal
    closeReportModal();

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
        created_at: new Date().toISOString(), // Add created_at timestamp in ISO format
      });

      // Format and add date parameters if they exist
      if (startDate) {
        // Combine date and time for more precise filtering
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const formattedStartDate = new Date(startDate);
        // Use local time instead of UTC to avoid timezone issues
        formattedStartDate.setHours(startHours, startMinutes, 0, 0);

        // Format as ISO string
        const isoStartDate = formattedStartDate.toISOString();
        console.log("Using start date for report:", isoStartDate);
        params.append("start_date", isoStartDate);
      }

      if (endDate) {
        // Combine date and time for more precise filtering
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        const formattedEndDate = new Date(endDate);
        // Use local time instead of UTC to avoid timezone issues
        formattedEndDate.setHours(endHours, endMinutes, 59, 999);

        // Format as ISO string
        const isoEndDate = formattedEndDate.toISOString();
        console.log("Using end date for report:", isoEndDate);
        params.append("end_date", isoEndDate);
      }

      // Debug log
      console.log("Request params:", params.toString());
      console.log(
        "Generating report with URL:",
        `http://localhost:8000/api/v1/report/generate/?${params.toString()}`,
      );

      // If inventory report is selected, fetch detailed inventory data with the same date parameters
      if (reportType === "inventory") {
        await fetchInventoryData();
      }

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
        // If no success but we have data, we can still show the report
        if (responseData.data && responseData.data.report_data) {
          // Continue with the report generation
        } else {
          setError(responseData.message || "Failed to generate report");
          return;
        }
      }

      // Restructure the data to match what the frontend expects
      const reportData = {
        id: responseData.data?.report_id || `report-${Date.now()}`,
        report_type: responseData.data?.report_data?.report_type || reportType,
        date_generated: new Date().toISOString(), // Current date in ISO format
        created_at: responseData.data?.created_at || new Date().toISOString(), // Use API's created_at or generate new one
        generated_by: responseData.data?.report_data?.generated_by || "Unknown",
        date_range: {
          start: startDate ? new Date(startDate).toISOString() : null,
          end: endDate ? new Date(endDate).toISOString() : null,
        },
        report_data: {
          ...(responseData.data?.report_data || {
            // Default empty data structure based on report type
            report_type: reportType,
            total_products: 0,
            expired_count: 0,
            low_stock_count: 0,
            near_expiry_count: 0,
            products: [],
          }),
          created_at: responseData.data?.created_at || new Date().toISOString(), // Add created_at to report_data as well
        },
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

      // Handle "No inventory report found" error gracefully
      if (
        err.response &&
        err.response.data &&
        err.response.data.error === "No inventory report found."
      ) {
        console.log("Creating empty report due to no data found");
        // Create an empty report instead of showing error
        const emptyReport = {
          id: `report-${Date.now()}`,
          report_type: reportType,
          date_generated: new Date().toISOString(),
          created_at: new Date().toISOString(), // Add created_at timestamp in ISO format
          generated_by: "System",
          date_range: {
            start: startDate ? new Date(startDate).toISOString() : null,
            end: endDate ? new Date(endDate).toISOString() : null,
          },
          report_data: {
            report_type: reportType,
            total_products: 0,
            expired_count: 0,
            low_stock_count: 0,
            near_expiry_count: 0,
            products: [],
            created_at: new Date().toISOString(), // Add created_at to report_data as well
          },
        };

        saveReport(emptyReport);
        setReport(emptyReport);

        // Show a more helpful message to the user
        setError(
          "No data found for the selected date range. An empty report has been generated.",
        );
      } else {
        // Enhanced error handling for other errors
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response:", err.response.data);
          console.error("Error status:", err.response.status);

          // Set detailed error message
          if (err.response.status === 400) {
            setError(
              `API Error (400): ${err.response.data?.detail || err.response.data?.message || err.response.data?.error || "Invalid request parameters"}`,
            );
          } else if (err.response.status === 500) {
            setError(
              `Server Error (500): ${err.response.data?.detail || err.response.data?.message || "Internal server error"}`,
            );
          } else {
            setError(
              `Error ${err.response.status}: ${err.response.data?.detail || err.response.data?.message || err.response.data?.error || "Unknown error"}`,
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Update the saveReport function to ensure proper date formatting
  const saveReport = (newReport) => {
    if (!newReport) return;

    // Create a deep copy to avoid reference issues
    const reportToSave = JSON.parse(JSON.stringify(newReport));

    // Ensure date_generated is in ISO format
    if (
      !reportToSave.date_generated ||
      !reportToSave.date_generated.includes("T")
    ) {
      reportToSave.date_generated = new Date().toISOString();
    }

    // Ensure created_at is in ISO format
    if (!reportToSave.created_at || !reportToSave.created_at.includes("T")) {
      reportToSave.created_at = new Date().toISOString();
    }

    // Ensure date range is properly formatted
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

  // Update the loadReport function to fetch data with date filters
  const loadReport = (reportId) => {
    const reportToLoad = savedReports.find((r) => r.id === reportId);
    if (reportToLoad) {
      setReport(reportToLoad);

      // Set the date filters from the saved report
      if (reportToLoad.date_range) {
        if (reportToLoad.date_range.start) {
          const startDateObj = new Date(reportToLoad.date_range.start);
          setStartDate(startDateObj.toISOString().split("T")[0]); // Format as YYYY-MM-DD

          // Extract time and format as HH:MM
          const hours = startDateObj.getUTCHours().toString().padStart(2, "0");
          const minutes = startDateObj
            .getUTCMinutes()
            .toString()
            .padStart(2, "0");
          setStartTime(`${hours}:${minutes}`);
        }

        if (reportToLoad.date_range.end) {
          const endDateObj = new Date(reportToLoad.date_range.end);
          setEndDate(endDateObj.toISOString().split("T")[0]); // Format as YYYY-MM-DD

          // Extract time and format as HH:MM
          const hours = endDateObj.getUTCHours().toString().padStart(2, "0");
          const minutes = endDateObj
            .getUTCMinutes()
            .toString()
            .padStart(2, "0");
          setEndTime(`${hours}:${minutes}`);
        }
      }

      // If loading an inventory report, fetch the latest inventory data with the date filters
      if (reportToLoad.report_type === "inventory") {
        fetchInventoryData();
      }
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

  // Update the renderInventoryDataTable function to handle empty data gracefully
  const renderInventoryDataTable = () => {
    if (!inventoryData || inventoryData.length === 0) {
      return (
        <div className="empty-inventory-message">
          <Package size={48} />
          <p>No inventory data found for the selected date range</p>
          <button
            className="refresh-inventory-btn"
            onClick={fetchInventoryData}
          >
            Refresh Inventory Data
          </button>
        </div>
      );
    }

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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item, index) => (
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
                <td>{item.product_name}</td>
                <td>{item.category}</td>
                <td>{item.subcategory}</td>
                <td className="text-right">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{item.min_quantity}</td>
                <td>{formatDate(item.expiry_date)}</td>
                <td>
                  {item.is_expired ? (
                    <span className="status-badge expired">Expired</span>
                  ) : item.is_critical ? (
                    <span className="status-badge critical">Low Stock</span>
                  ) : (
                    <span className="status-badge normal">Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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

              {/* Add the debug section that shows when toggled */}
              {showDebug && (
                <div className="debug-section">
                  <h3 className="debug-title">Debug Information</h3>
                  <div className="debug-content">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {startDate ? `${startDate} ${startTime}` : "Not set"}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {endDate ? `${endDate} ${endTime}` : "Not set"}
                    </p>
                    <p>
                      <strong>ISO Start:</strong>{" "}
                      {startDate
                        ? new Date(`${startDate}T${startTime}`).toISOString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>ISO End:</strong>{" "}
                      {endDate
                        ? new Date(`${endDate}T${endTime}`).toISOString()
                        : "N/A"}
                    </p>
                    {debugInfo && (
                      <>
                        <p>
                          <strong>Last API Status:</strong> {debugInfo.status}
                        </p>
                        <p>
                          <strong>Last API Response:</strong>
                        </p>
                        <pre className="debug-json">
                          {JSON.stringify(debugInfo.data, null, 2)}
                        </pre>
                      </>
                    )}
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
                  {/* Add a date filter display in the report header to show the active date range */}
                  <div className="report-header-section">
                    <div className="report-type-badge">
                      {report.report_type?.toUpperCase() || "UNKNOWN"}
                    </div>
                    {(startDate || endDate) && (
                      <div className="date-filter-info">
                        <span className="date-filter-label">Date Range:</span>
                        <span className="date-filter-value">
                          {startDate ? formatDate(startDate) : "All time"} -{" "}
                          {endDate ? formatDate(endDate) : "Present"}
                        </span>
                      </div>
                    )}
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

                    {/* Update the inventory stats section to only use API data */}
                    {report.report_type === "inventory" && (
                      <>
                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Total Products</p>
                            <p className="stat-value">
                              {inventoryData.length || 0}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Expired Products</p>
                            <p className="stat-value danger">
                              {inventoryData.filter((item) => item.is_expired)
                                .length || 0}
                            </p>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="stat-card">
                            <p className="stat-label">Near Expiry</p>
                            <p className="stat-value warning">
                              {inventoryData.filter(
                                (item) => item.is_near_expiry,
                              ).length || 0}
                            </p>
                          </div>
                          <div className="stat-card">
                            <p className="stat-label">Low Stock</p>
                            <p className="stat-value warning">
                              {inventoryData.filter((item) => item.is_critical)
                                .length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Detailed Inventory Data Table - Now using the extracted function */}
                        <div className="report-table-section">
                          <h4 className="table-title">Detailed Inventory</h4>
                          {renderInventoryDataTable()}
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
                  {report.report_type === "inventory" && (
                    <button
                      className="tab-trigger"
                      data-tab="inventory-details"
                      onClick={() => handleTabChange("inventory-details")}
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

                    {/* Update the inventory dashboard summary to use the actual inventory data */}
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
                                {inventoryData.length || 0}
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
                                {inventoryData.filter((item) => item.is_expired)
                                  .length || 0}
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
                                {inventoryData.filter(
                                  (item) => item.is_critical,
                                ).length || 0}
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
                        {/* Using the extracted function to render inventory data table */}
                        {renderInventoryDataTable()}
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

              {/* Update the date input fields in the modal to handle date changes better */}
              <div className="date-range-section">
                <h4>Date Range (Optional)</h4>
                <div className="date-inputs">
                  <div className="form-group">
                    <label htmlFor="start-date" className="form-label">
                      Start Date
                    </label>
                    <div className="date-time-inputs">
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          console.log("Start date set to:", e.target.value);
                        }}
                        className="form-input date-input"
                      />
                      <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          console.log("Start time set to:", e.target.value);
                        }}
                        className="form-input time-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="end-date" className="form-label">
                      End Date
                    </label>
                    <div className="date-time-inputs">
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          console.log("End date set to:", e.target.value);
                        }}
                        className="form-input date-input"
                      />
                      <input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => {
                          setEndTime(e.target.value);
                          console.log("End time set to:", e.target.value);
                        }}
                        className="form-input time-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Update the report modal footer to include a direct fetch button */}
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
