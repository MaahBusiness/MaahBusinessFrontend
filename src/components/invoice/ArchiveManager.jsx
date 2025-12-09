"use client";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  FileText,
  Calendar,
  Loader,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Eye,
  Check,
  X,
} from "lucide-react";
import "./Invoice.css";

const ArchiveManager = ({ onBack = null }) => {
  // State
  const [archivedInvoices, setArchivedInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    show: false,
    text: "",
    type: "success",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const itemsPerPage = 10;

  // Create axios instance with authentication headers
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // Fetch archived invoices
  useEffect(() => {
    fetchArchivedInvoices();
  }, [currentPage]);

  const fetchArchivedInvoices = async () => {
    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        "https://victbackendmanagement.onrender.com/api/v1/archive/all-archive-invoice/",
      );
      console.log("Archived invoices fetched:", response.data);

      // Handle pagination data
      const invoiceData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      const count = Array.isArray(response.data)
        ? invoiceData.length
        : response.data.count || 0;

      setTotalInvoices(count);
      setTotalPages(Math.ceil(count / itemsPerPage));

      // Get current page of invoices
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageInvoices = invoiceData.slice(startIndex, endIndex);

      setArchivedInvoices(currentPageInvoices);
    } catch (error) {
      console.error("Error fetching archived invoices:", error);
      showStatusMessage(
        "Failed to load archived invoices. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // View archived invoice details
  const handleViewInvoice = async (index) => {
    const invoice = archivedInvoices[index];
    setIsLoading(true);

    try {
      // If we already have detailed data, use it directly
      if (invoice.lines) {
        setSelectedInvoice(invoice);
      } else {
        // Otherwise fetch detailed invoice data
        const authAxios = getAuthAxios();
        // Make sure we're using the correct endpoint format with query parameters
        const invoiceId = invoice.invoice_id || invoice.id;
        console.log("Fetching archived invoice details for ID:", invoiceId);

        const response = await authAxios.get(
          `https://victbackendmanagement.onrender.com/api/v1/archive/archive-invoice-by-id/?invoice_id=${invoiceId}`,
        );
        console.log("Archived invoice details response:", response.data);
        setSelectedInvoice(response.data);
      }
    } catch (error) {
      console.error("Error fetching archived invoice details:", error);
      showStatusMessage(
        "Failed to load invoice details. Please try again.",
        "error",
      );

      // Log detailed error information for debugging
      console.error("View archived invoice error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Fallback to using the basic invoice data we already have
      setSelectedInvoice(invoice);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to show status messages
  const showStatusMessage = (text, type = "success") => {
    setStatusMessage({ show: true, text, type });

    // Auto-hide the message after 3 seconds
    setTimeout(() => {
      setStatusMessage({ show: false, text: "", type: "success" });
    }, 3000);
  };

  // Filter invoices based on search term
  const filteredInvoices = archivedInvoices.filter(
    (invoice) =>
      (invoice.number &&
        invoice.number
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (invoice.client_name &&
        invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (error) {
      return dateString;
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return "";
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "completed";
    if (statusLower === "cancelled") return "cancelled";
    if (statusLower === "credit") return "credit";
    return "";
  };

  // Handle back button click
  const handleBackClick = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    } else {
      console.warn("onBack prop is not provided or not a function");
      // Fallback navigation if needed
      // window.history.back()
    }
  };

  return (
    <div className="invoice-manager-container">
      <div className="invoice-manager-header">
        <h2>Archived Invoices</h2>
        <div className="header-actions">
          <button className="archive-button1" onClick={handleBackClick}>
            <Link to="/Invoice">
              <ArrowLeft size={18} /> Back to Invoices{" "}
            </Link>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage.show && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Search Container */}
      <div className="view-toggle">
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search invoice"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="date-filter">
            <Calendar className="calendar-icon" size={18} />
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              className="date-input"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <Loader size={48} className="spin" />
          <p>Loading archived invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>No archived invoices found.</p>
        </div>
      ) : (
        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total</th>
                <th>Advance Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <tr key={invoice.id || index}>
                  <td>{invoice.number ? `INV-${invoice.number}` : "N/A"}</td>
                  <td>{invoice.client_name || "Anonymous"}</td>
                  <td>{formatDate(invoice.due_date)}</td>
                  <td>${Number.parseFloat(invoice.total || 0).toFixed(2)}</td>
                  <td>
                    ${Number.parseFloat(invoice.advance_paid || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusBadgeClass(invoice.status)}`}
                    >
                      {invoice.status?.toUpperCase() || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="view-btn"
                        onClick={() => handleViewInvoice(index)}
                      >
                        <Eye size={16} />
                      </button>
                      <button className="delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalInvoices} invoices)
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* View Invoice Modal - keeping the existing modal implementation */}
      {selectedInvoice && (
        <div className="invoice-modal-overlay">
          <div className="invoice-modal-content invoice-detail-modal">
            <div className="modal-header">
              <h3>Archived Invoice Details</h3>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail-header">
                <div className="invoice-detail-id">
                  <h4>
                    Invoice #
                    {selectedInvoice.number ? selectedInvoice.number : "N/A"}
                  </h4>
                  <div
                    className={`invoice-status ${(selectedInvoice.status || "").toLowerCase()}`}
                  >
                    {selectedInvoice.status}
                  </div>
                </div>
                <div className="invoice-detail-dates">
                  <div className="date-item">
                    <span>Created:</span>
                    <span>{formatDateTime(selectedInvoice.created_at)}</span>
                  </div>
                  <div className="date-item">
                    <span>Due:</span>
                    <span>{formatDate(selectedInvoice.due_date)}</span>
                  </div>
                </div>
              </div>

              <div className="invoice-detail-client">
                <h4>Client Information</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedInvoice.client_name || "Anonymous"}
                </p>
                {selectedInvoice.cashier_name && (
                  <p>
                    <strong>Cashier:</strong> {selectedInvoice.cashier_name}
                  </p>
                )}
              </div>

              <div className="invoice-detail-items">
                <h4>Products</h4>
                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.lines &&
                      selectedInvoice.lines.map((line, index) => {
                        const linePrice = Number.parseFloat(
                          line.unit_price || 0,
                        );
                        const lineDiscount = Number.parseFloat(
                          line.discount || 0,
                        );
                        const lineQuantity = line.quantity || 0;
                        const lineSubtotal = Number.parseFloat(
                          line.line_total || 0,
                        );

                        return (
                          <tr key={index}>
                            <td>{line.product_name || "Unknown Product"}</td>
                            <td>{lineQuantity}</td>
                            <td>{linePrice.toFixed(2)} XFA</td>
                            <td>{lineDiscount}%</td>
                            <td>{lineSubtotal.toFixed(2)} XFA</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="invoice-detail-totals">
                <div className="totals-row">
                  <span>Total:</span>
                  <span>
                    {Number.parseFloat(selectedInvoice.total || 0).toFixed(2)}{" "}
                    XFA
                  </span>
                </div>
                <div className="totals-row">
                  <span>
                    Tax ({Number.parseFloat(selectedInvoice.tax || 0)}%):
                  </span>
                  <span>
                    {(
                      (Number.parseFloat(selectedInvoice.total || 0) *
                        Number.parseFloat(selectedInvoice.tax || 0)) /
                      100
                    ).toFixed(2)}{" "}
                    XFA
                  </span>
                </div>
                <div className="totals-row">
                  <span>Advance Paid:</span>
                  <span>
                    {Number.parseFloat(
                      selectedInvoice.advance_paid || 0,
                    ).toFixed(2)}{" "}
                    XFA
                  </span>
                </div>
                {Number.parseFloat(selectedInvoice.remaining_amount || 0) >
                0 ? (
                  <div className="totals-row remaining">
                    <span>Remaining:</span>
                    <span>
                      {Number.parseFloat(
                        selectedInvoice.remaining_amount || 0,
                      ).toFixed(2)}{" "}
                      XFA
                    </span>
                  </div>
                ) : Number.parseFloat(selectedInvoice.refund_amount || 0) >
                  0 ? (
                  <div className="totals-row refund">
                    <span>Refund:</span>
                    <span>
                      {Number.parseFloat(
                        selectedInvoice.refund_amount || 0,
                      ).toFixed(2)}{" "}
                      XFA
                    </span>
                  </div>
                ) : (
                  <div className="totals-row paid">
                    <span>Fully Paid</span>
                    <span>
                      <Check size={16} />
                    </span>
                  </div>
                )}
                {selectedInvoice.is_credit_settled !== undefined && (
                  <div className="totals-row">
                    <span>Credit Settled:</span>
                    <span>
                      {selectedInvoice.is_credit_settled ? "Yes" : "No"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveManager;
