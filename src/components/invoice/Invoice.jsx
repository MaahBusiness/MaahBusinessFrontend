"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Trash2,
  X,
  Check,
  FileText,
  DollarSign,
  Calendar,
  User,
  ShoppingCart,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Invoice.css";
import ArchiveManager from "./ArchiveManager";

const Invoice = () => {
  // Style definitions for form fields
  const requiredFieldStyle = {
    color: "#f44336",
    marginLeft: "4px",
  };

  const optionalFieldStyle = {
    color: "#a5a5a5",
    fontSize: "0.8rem",
    marginLeft: "4px",
  };

  const fieldHintStyle = {
    color: "#a5a5a5",
    fontSize: "0.75rem",
    marginTop: "4px",
    display: "block",
  };

  // Main state
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list"); // list, analytics
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [statusMessage, setStatusMessage] = useState({
    show: false,
    text: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [validStatusValues, setValidStatusValues] = useState([]);
  const [showArchiveManager, setShowArchiveManager] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const itemsPerPage = 10;

  // Form state
  const [clientName, setClientName] = useState("");
  const [reason, setReason] = useState("");
  const [tax, setTax] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [lines, setLines] = useState([
    {
      product_id: "",
      name: "",
      quantity: 1,
      price: 0,
      discount: 0,
      is_promotion: false,
    },
  ]);
  const [formError, setFormError] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (!token) {
      showStatusMessage(
        "Please log in to create or manage invoices",
        "warning",
      );
      // Redirect to login page
      window.location.href = "/login";
      return;
    }

    // Try to get cached user data
    try {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        // Check if user is a manager based on cached data
        setIsManager(userData.role === "manager");
      }

      // Fetch latest user information from API
      fetch("http://localhost:8000/api/v1/user-info/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }
          return response.json();
        })
        .then((userData) => {
          // Update user role based on fetched data
          setIsManager(userData.role === "manager");
          // Store updated user data
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
          if (error.message === "Unauthorized") {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            window.location.href = "/login";
          }
        });
    } catch (error) {
      console.error("Error processing user data:", error);
    }
  }, []);

  // Function to check if user is a manager
  const checkUserRole = () => {
    try {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        // Check if user is a manager based on role
        setIsManager(userData.role === "manager");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsManager(false);
    }
  };

  // Update the checkUserRole when authentication status changes
  useEffect(() => {
    checkUserRole();
  }, [isAuthenticated]);

  // Create axios instance with authentication headers
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // Fetch products and invoices on component mount
  useEffect(() => {
    fetchProducts();
    fetchInvoices(currentPage);
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        "http://localhost:8000/api/v1/product/products/",
      );
      console.log("Products API response:", response.data);

      // Handle different response formats
      let productData = [];
      if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        productData = response.data.results;
      } else if (typeof response.data === "object") {
        // If it's an object with product data directly
        productData = [response.data];
      }

      console.log("Product data array length:", productData.length);

      // Map the products correctly, handling different possible structures
      const processedProducts = productData
        .map((item) => {
          // Handle different possible product structures
          const productInfo = item.product || item;

          // Check if product is on promotion
          const isPromotion =
            productInfo.is_promotion || productInfo.on_promotion || false;
          const promotionPrice =
            productInfo.promotion_price || productInfo.promo_price || 0;

          return {
            id: productInfo.id || "",
            name:
              productInfo.name || productInfo.product_name || "Unnamed Product",
            price: Number.parseFloat(
              productInfo.unit_price || productInfo.price || 0,
            ),
            is_promotion: isPromotion,
            promotion_price: isPromotion
              ? Number.parseFloat(promotionPrice)
              : 0,
          };
        })
        .filter((product) => product.id); // Filter out any products without an ID

      console.log(
        "Processed products:",
        processedProducts.length,
        processedProducts,
      );
      setProducts(processedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);

        // Handle authentication errors
        if (error.response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          showStatusMessage(
            "Authentication expired. Please log in again.",
            "error",
          );
        }
      }
      showStatusMessage("Failed to load products. Please try again.", "error");
    }
  };

  const fetchInvoices = async (page = 1) => {
    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/invoice/invoices/?page=${page}`,
      );
      console.log("Invoices fetched:", response.data);

      // Handle pagination data
      const count = response.data.count || 0;
      setTotalInvoices(count);
      setTotalPages(Math.ceil(count / itemsPerPage));

      // Check if response.data is an array or has a results property
      const invoiceData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // Extract valid status values from the invoices
      const statusValues = new Set();
      invoiceData.forEach((invoice) => {
        if (invoice.status) {
          statusValues.add(invoice.status);
        }
      });

      setValidStatusValues(Array.from(statusValues));
      console.log("Valid status values extracted:", Array.from(statusValues));

      setInvoices(invoiceData);
    } catch (error) {
      console.error("Error fetching invoices:", error);

      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        showStatusMessage(
          "Authentication expired. Please log in again.",
          "error",
        );
      } else {
        showStatusMessage(
          "Failed to load invoices. Please try again.",
          "error",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate invoice totals
  const calculateTotals = () => {
    const subtotal = lines.reduce(
      (sum, item) => sum + (item.quantity * item.price - item.discount),
      0,
    );
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;
    const remaining = total - advancePaid;
    const refund = advancePaid > total ? advancePaid - total : 0;

    // Set status to "COMPLETED" for the API, but we'll hide it in the UI
    const status = "COMPLETED";

    return { subtotal, taxAmount, total, remaining, refund, status };
  };

  // Function to show status messages
  const showStatusMessage = (text, type = "success") => {
    setStatusMessage({ show: true, text, type });

    // Auto-hide the message after 3 seconds
    setTimeout(() => {
      setStatusMessage({ show: false, text: "", type: "success" });
    }, 3000);
  };

  // Handle adding a new line item
  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        product_id: "",
        name: "",
        quantity: 1,
        price: 0,
        discount: 0,
        is_promotion: false,
      },
    ]);
  };

  // Handle removing a line item
  const handleRemoveLine = (index) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    } else {
      showStatusMessage("Invoice must have at least one product", "error");
    }
  };

  const updateLine = (index, key, value) => {
    setLines(
      lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [key]: value };

          // If product_id changed, update the name and price
          if (key === "product_id" && value) {
            const selectedProduct = products.find(
              (p) => p.id.toString() === value.toString(),
            );
            if (selectedProduct) {
              console.log("Selected product:", selectedProduct);
              updatedLine.name = selectedProduct.name;

              // Check if product is on promotion and use promotion price if available
              if (
                selectedProduct.is_promotion &&
                selectedProduct.promotion_price > 0
              ) {
                updatedLine.price = selectedProduct.promotion_price;
                updatedLine.is_promotion = true;
              } else {
                updatedLine.price = selectedProduct.price;
                updatedLine.is_promotion = false;
              }
            } else {
              console.log("Product not found for ID:", value);
            }
          }

          return updatedLine;
        }
        return line;
      }),
    );
  };

  // Handle creating a new invoice
  const handleCreateInvoice = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setFormError("You must be logged in to create invoices");
      showStatusMessage("Authentication required. Please log in.", "error");
      return;
    }

    // Calculate if there's a remaining balance
    const { total, remaining, status } = calculateTotals();

    // Only require due date if there's a remaining balance (invoice not fully paid)
    if (remaining > 0 && !dueDate) {
      setFormError("Due date is required for invoices with remaining balance");
      return;
    }

    // Validate line items
    const invalidLines = lines.filter(
      (line) => !line.product_id || line.quantity <= 0,
    );
    if (invalidLines.length > 0) {
      setFormError(
        "All products must be selected and have a quantity greater than 0",
      );
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the payload for the API
      const payload = {
        client_name: clientName || "Anonymous", // Default to "Anonymous" if client name is not provided
        tax: tax.toString(),
        status: status, // Use lowercase status
        reason: reason || "", // Make reason optional
        due_date: dueDate || null, // Make due date optional
        advance_paid: advancePaid.toString(),
        lines: lines.map((line) => ({
          product_id: line.product_id,
          quantity: line.quantity,
          discount: line.discount.toString(),
          is_promotion: line.is_promotion,
        })),
      };

      console.log("Submitting invoice payload:", payload);
      const authAxios = getAuthAxios();

      // Create new invoice
      const response = await authAxios.post(
        "http://localhost:8000/api/v1/invoice/create-invoice/",
        payload,
      );

      // Refresh the invoice list to include the new invoice
      fetchInvoices(currentPage);

      showStatusMessage("Invoice created successfully");

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);

        // Handle authentication errors
        if (error.response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          setFormError("Authentication expired. Please log in again.");
          return;
        }

        // Handle specific API errors
        if (error.response.data.status) {
          setFormError(
            `Status error: ${JSON.stringify(error.response.data.status)}`,
          );

          // Try to determine valid status values from the error message
          if (
            typeof error.response.data.status === "string" &&
            error.response.data.status.includes("valid choice")
          ) {
            const match = error.response.data.status.match(
              /"([^"]+)" is not a valid choice/,
            );
            if (match) {
              setFormError(
                `"${match[1]}" is not a valid status. Please try a different value.`,
              );
            }
          }
        } else if (
          error.response.data.error &&
          error.response.data.error.includes("Invoice.cashier")
        ) {
          setFormError(
            "Authentication error: You must be logged in as a valid user to create invoices",
          );
        } else {
          setFormError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to process invoice. Please try again.",
          );
        }
      } else {
        setFormError("Failed to process invoice. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Try to pay off an invoice debt
  const handlePayDebt = async (invoiceId, amount) => {
    if (!isAuthenticated) {
      showStatusMessage("Authentication required. Please log in.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const authAxios = getAuthAxios();

      const response = await authAxios.post(
        "http://localhost:8000/api/v1/invoice/pay-debt/",
        {
          invoice_id: invoiceId,
          amount: amount.toString(),
        },
      );

      console.log("Debt payment response:", response.data);

      // Update the invoice in the list
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, ...response.data } : inv,
        ),
      );

      showStatusMessage("Payment processed successfully");

      // If we're viewing this invoice, update the selected invoice
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, ...response.data });
      }
    } catch (error) {
      console.error("Error paying debt:", error);
      showStatusMessage(
        "Failed to process payment. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // View invoice details
  const handleViewInvoice = async (index) => {
    const invoice = invoices[index];
    setIsLoading(true);

    try {
      // If we already have detailed data, use it directly
      if (invoice.lines && invoice.cashier_name) {
        setSelectedInvoice(invoice);
      } else {
        // Otherwise fetch detailed invoice data
        const authAxios = getAuthAxios();
        const response = await authAxios.get(
          `http://localhost:8000/api/v1/invoice/${invoice.id}/detail/`,
        );
        setSelectedInvoice(response.data);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);

      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        showStatusMessage(
          "Authentication expired. Please log in again.",
          "error",
        );
      } else {
        showStatusMessage(
          "Failed to load invoice details. Please try again.",
          "error",
        );
      }

      // Fallback to using the basic invoice data we already have
      setSelectedInvoice(invoice);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle archiving an invoice (appears as delete to the user)
  const handleArchiveInvoice = (index) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showStatusMessage("Authentication required. Please log in.", "error");
      return;
    }

    setConfirmArchive(index);
  };

  // Confirm archive
  const confirmArchiveInvoice = async () => {
    const invoiceId = invoices[confirmArchive].id;
    const invoiceNumber = invoices[confirmArchive].number;
    setIsLoading(true);

    try {
      const authAxios = getAuthAxios();

      // Try multiple approaches to handle the unique constraint
      try {
        console.log("Attempting to archive invoice with ID:", invoiceId);

        // First attempt - standard archive request
        await authAxios.post(
          "http://localhost:8000/api/v1/archive/archive-invoice/",
          {
            invoice_id: invoiceId,
          },
        );
      } catch (firstError) {
        console.error("First Delete attempt failed:", firstError);

        if (
          firstError.response?.data?.error?.includes("UNIQUE constraint failed")
        ) {
          console.log(
            "Handling unique constraint error - trying with override_number=true",
          );

          // Second attempt - try with override_number in different formats
          try {
            await authAxios.post(
              "http://localhost:8000/api/v1/archive/archive-invoice/",
              {
                invoice_id: invoiceId,
                override_number: true,
              },
            );
          } catch (secondError) {
            console.error("Second archive attempt failed:", secondError);

            // Third attempt - try with different parameter name
            try {
              await authAxios.post(
                "http://localhost:8000/api/v1/archive/archive-invoice/",
                {
                  invoice_id: invoiceId,
                  force: true,
                },
              );
            } catch (thirdError) {
              console.error("Third archive attempt failed:", thirdError);

              // Fourth attempt - try with a modified invoice number
              try {
                await authAxios.post(
                  "http://localhost:8000/api/v1/archive/archive-invoice/",
                  {
                    invoice_id: invoiceId,
                    new_number: `${invoiceNumber}-${Date.now()}`,
                  },
                );
              } catch (fourthError) {
                console.error("Fourth archive attempt failed:", fourthError);

                // If all attempts fail, rethrow the original error
                throw firstError;
              }
            }
          }
        } else {
          // If it's not a unique constraint error, rethrow
          throw firstError;
        }
      }

      // Refresh the invoice list after archiving
      fetchInvoices(currentPage);
      showStatusMessage("Invoice Deleted successfully", "warning");
    } catch (error) {
      console.error("Error archiving invoice:", error);

      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        showStatusMessage(
          "Authentication expired. Please log in again.",
          "error",
        );
      } else {
        // Show the specific error message from the API if available
        const errorMessage =
          error.response?.data?.error ||
          "Failed to Delete invoice. Please try again.";
        showStatusMessage(errorMessage, "error");

        // Log detailed error information for debugging
        console.error("Archive error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
    } finally {
      setConfirmArchive(null);
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setClientName("");
    setReason("");
    setTax(0);
    setAdvancePaid(0);
    setDueDate("");
    setLines([
      {
        product_id: "",
        name: "",
        quantity: 1,
        price: 0,
        discount: 0,
        is_promotion: false,
      },
    ]);
    setFormError("");
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      (invoice.id &&
        invoice.id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (invoice.client_name &&
        invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.reason &&
        invoice.reason.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Calculate analytics data
  const getAnalyticsData = () => {
    // Monthly revenue data
    const monthlyData = {};
    invoices.forEach((invoice) => {
      if (!invoice.created_at) return;

      const month = invoice.created_at.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += Number.parseFloat(invoice.total) || 0;
      monthlyData[month].count += 1;
    });

    const monthlyRevenueData = Object.keys(monthlyData).map((month) => ({
      month,
      revenue: monthlyData[month].total,
      count: monthlyData[month].count,
    }));

    // Status distribution
    const statusData = [
      {
        name: "COMPLETED",
        value: invoices.filter((inv) => inv.status === "COMPLETED").length,
      },
      {
        name: "CANCELLED",
        value: invoices.filter((inv) => inv.status === "CANCELLED").length,
      },
      {
        name: "CREDIT",
        value: invoices.filter((inv) => inv.status === "CREDIT").length,
      },
    ];

    // Client distribution
    const clientData = {};
    invoices.forEach((invoice) => {
      if (!invoice.client_name) return;

      if (!clientData[invoice.client_name]) {
        clientData[invoice.client_name] = 0;
      }
      clientData[invoice.client_name] += Number.parseFloat(invoice.total) || 0;
    });

    const clientDistributionData = Object.keys(clientData).map((client) => ({
      name: client,
      value: clientData[client],
    }));

    return {
      monthlyRevenueData: monthlyRevenueData.sort((a, b) =>
        a.month.localeCompare(b.month),
      ),
      statusData,
      clientDistributionData,
    };
  };

  const { monthlyRevenueData, statusData, clientDistributionData } =
    getAnalyticsData();

  // Calculate totals for summary cards
  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (Number.parseFloat(invoice.total) || 0),
    0,
  );
  const totalPending = invoices.reduce(
    (sum, invoice) =>
      sum +
      (invoice.status !== "COMPLETED"
        ? Number.parseFloat(invoice.remaining_amount) || 0
        : 0),
    0,
  );
  const averageInvoiceValue =
    invoices.length > 0 ? totalRevenue / invoices.length : 0;

  // COLORS for charts
  const COLORS = ["#800020", "#6A1B9A", "#4A0F0F", "#B71C1C", "#1F2937"];

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

  // Handle PDF export
  const handleExportPDF = async (invoiceId) => {
    if (!isAuthenticated) {
      showStatusMessage("Authentication required. Please log in.", "error");
      return;
    }

    if (!invoiceId) {
      showStatusMessage("Invoice ID is required for export", "error");
      return;
    }

    try {
      setIsLoading(true);
      showStatusMessage("Generating PDF...", "info");

      const authAxios = getAuthAxios();

      // Make request to export PDF endpoint with the invoice ID as a query parameter
      const response = await authAxios.get(
        `http://localhost:8000/api/v1/invoice/export-pdf/?invoice_id=${invoiceId}`,
        {
          responseType: "blob", // Important: set the response type to blob
        },
      );

      // Create a blob from the PDF response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showStatusMessage("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error exporting PDF:", error);

      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        showStatusMessage(
          "Authentication expired. Please log in again.",
          "error",
        );
      } else {
        showStatusMessage("Failed to export PDF. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = () => {
    // Redirect to login page or show login modal
    window.location.href = "/login";
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="invoice-manager-container">
      <div className="invoice-manager-header">
        <h2>Invoice Management</h2>
        <div className="header-actions">
          {isAuthenticated ? (
            <button
              className="add-button"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <Plus size={18} /> Create Invoice
            </button>
          ) : (
            <button className="login-button" onClick={handleLogin}>
              <User size={18} /> Login to Create Invoices
            </button>
          )}
          {isAuthenticated && isManager && (
            <button
              className="archive-button"
              onClick={() => setShowArchiveManager(true)}
            >
              <Archive size={18} /> View Archived Invoices
            </button>
          )}
        </div>
      </div>

      {/* Status Message */}
      {statusMessage.show && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${currentView === "list" ? "active" : ""}`}
          onClick={() => setCurrentView("list")}
        >
          <FileText size={16} /> Invoice List
        </button>
        <button
          className={`view-toggle-btn ${currentView === "analytics" ? "active" : ""}`}
          onClick={() => setCurrentView("analytics")}
        >
          <BarChart size={16} /> Analytics
        </button>
      </div>

      {/* List View */}
      {currentView === "list" && (
        <div className="invoice-list-view">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search invoices by ID, client name, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {isLoading ? (
            <div className="loading-state">
              <Loader size={48} className="spin" />
              <p>Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>
                No invoices found. Create your first invoice to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="invoice-list">
                {filteredInvoices.map((invoice, index) => (
                  <div key={invoice.id} className="invoice-card">
                    <div className="invoice-card-header">
                      <div className="invoice-id">
                        {invoice.number ? `INV-${invoice.number}` : invoice.id}
                      </div>
                      {invoice.status && invoice.status !== "COMPLETED" && (
                        <div
                          className={`invoice-status ${(invoice.status || "").toLowerCase()}`}
                        >
                          {invoice.status}
                        </div>
                      )}
                    </div>
                    <div className="invoice-card-body">
                      <div className="invoice-client">
                        <User size={16} />
                        <span>{invoice.client_name || "Anonymous"}</span>
                      </div>
                      <div className="invoice-reason">
                        <FileText size={16} />
                        <span>{invoice.reason || "N/A"}</span>
                      </div>
                      <div className="invoice-date">
                        <Calendar size={16} />
                        <span>Due: {formatDate(invoice.due_date)}</span>
                      </div>
                      <div className="invoice-date">
                        <Clock size={16} />
                        <span>
                          Created: {formatDateTime(invoice.created_at)}
                        </span>
                      </div>
                      <div className="invoice-amount">
                        <DollarSign size={16} />
                        <span>
                          {Number.parseFloat(invoice.total || 0).toFixed(2)} XFA
                        </span>
                      </div>
                      <div className="invoice-items">
                        <ShoppingCart size={16} />
                        <span>{invoice.lines?.length || 0} items</span>
                      </div>
                    </div>
                    <div className="invoice-card-footer">
                      <button
                        className="invoice-action-btn view"
                        onClick={() => handleViewInvoice(index)}
                      >
                        View Details
                      </button>
                      <div className="invoice-actions">
                        <button
                          className="invoice-action-btn delete"
                          onClick={() => handleArchiveInvoice(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
                    Page {currentPage} of {totalPages} ({totalInvoices}{" "}
                    invoices)
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
            </>
          )}
        </div>
      )}

      {/* Analytics View */}
      {currentView === "analytics" && (
        <div className="analytics-view">
          <div className="analytics-summary">
            <div className="summary-card">
              <div className="summary-icon revenue">
                <DollarSign size={24} />
              </div>
              <div className="summary-content">
                <h3>Total Revenue</h3>
                <div className="summary-value">
                  {totalRevenue.toFixed(2)} XFA
                </div>
                <div className="summary-trend up"></div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon pending">
                <AlertCircle size={24} />
              </div>
              <div className="summary-content">
                <h3>Pending Payments</h3>
                <div className="summary-value">
                  {totalPending.toFixed(2)} XFA
                </div>
                <div className="summary-trend down"></div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon average">
                <FileText size={24} />
              </div>
              <div className="summary-content">
                <h3>Average Invoice</h3>
                <div className="summary-value">
                  {averageInvoiceValue.toFixed(2)} XFA
                </div>
                <div className="summary-trend up"></div>
              </div>
            </div>
          </div>

          <div className="analytics-charts">
            <div className="chart-container">
              <h3>Monthly Revenue</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData}>
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
                    <Legend wrapperStyle={{ color: "#D1D5DB" }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#800020" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container">
              <h3>Invoice Status</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
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
            </div>

            <div className="chart-container">
              <h3>Revenue by Client</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={clientDistributionData}
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
                    <Bar dataKey="value" name="Revenue" fill="#6A1B9A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Invoice</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}

              {!isAuthenticated && (
                <div className="auth-warning">
                  <AlertCircle size={18} />
                  <span>You must be logged in to create invoices</span>
                </div>
              )}

              <div className="form-grid">
                {/* Client Information */}
                <div className="form-section">
                  <h4>Client Information</h4>
                  <div className="form-group">
                    <label htmlFor="client-name">
                      Client Name{" "}
                      <span style={optionalFieldStyle}>(Optional)</span>
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      placeholder="Enter client name or leave blank for anonymous"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">
                      Reason/Description{" "}
                      <span style={optionalFieldStyle}>(Optional)</span>
                    </label>
                    <input
                      id="reason"
                      type="text"
                      placeholder="Enter reason for invoice"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="due-date">
                      Due Date{" "}
                      {advancePaid < calculateTotals().total ? (
                        <span style={requiredFieldStyle}>*</span>
                      ) : (
                        <span style={optionalFieldStyle}>(Optional)</span>
                      )}
                    </label>
                    <input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={
                        formError &&
                        advancePaid < calculateTotals().total &&
                        !dueDate
                          ? "input-error"
                          : ""
                      }
                    />
                    {advancePaid < calculateTotals().total && (
                      <small style={fieldHintStyle}>
                        Required when invoice is not fully paid
                      </small>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="form-section">
                  <h4>Payment Details</h4>
                  <div className="form-group">
                    <label htmlFor="tax">Tax Percentage (%)</label>
                    <input
                      id="tax"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter tax percentage"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="advance-paid">Advance Paid (XFA)</label>
                    <input
                      id="advance-paid"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter advance payment"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="form-section">
                <div className="section-header">
                  <h4>Products</h4>
                  <button
                    type="button"
                    className="add-line-btn"
                    onClick={handleAddLine}
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                <div className="line-items">
                  <div className="line-item-header">
                    <div className="line-item-col product">Product</div>
                    <div className="line-item-col quantity">Quantity</div>
                    <div className="line-item-col price">Price (XFA)</div>
                    <div className="line-item-col discount">Discount (XFA)</div>
                    <div className="line-item-col subtotal">Subtotal</div>
                    <div className="line-item-col actions">Actions</div>
                  </div>

                  {lines.map((line, index) => {
                    const lineSubtotal =
                      line.quantity * line.price - line.discount;

                    return (
                      <div key={index} className="line-item">
                        <div className="line-item-col product">
                          <select
                            value={line.product_id}
                            onChange={(e) =>
                              updateLine(index, "product_id", e.target.value)
                            }
                            className={
                              formError && !line.product_id ? "input-error" : ""
                            }
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option
                                key={product.id}
                                value={product.id.toString()}
                              >
                                {product.name} -{" "}
                                {product.is_promotion &&
                                product.promotion_price > 0
                                  ? `${product.promotion_price} XFA (PROMO)`
                                  : `${product.price} XFA`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="line-item-col quantity">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(
                                index,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className={
                              formError && line.quantity <= 0
                                ? "input-error"
                                : ""
                            }
                          />
                        </div>
                        <div className="line-item-col price">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.price}
                            onChange={(e) =>
                              updateLine(index, "price", Number(e.target.value))
                            }
                            disabled={!!line.product_id}
                            className={
                              line.is_promotion ? "promotion-price" : ""
                            }
                          />
                        </div>
                        <div className="line-item-col discount">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.discount}
                            onChange={(e) =>
                              updateLine(
                                index,
                                "discount",
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="line-item-col subtotal">
                          {lineSubtotal.toFixed(2)}
                        </div>
                        <div className="line-item-col actions">
                          <button
                            type="button"
                            className="remove-line-btn"
                            onClick={() => handleRemoveLine(index)}
                            disabled={lines.length === 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="invoice-totals">
                {(() => {
                  const {
                    subtotal,
                    taxAmount,
                    total,
                    remaining,
                    refund,
                    status,
                  } = calculateTotals();
                  return (
                    <>
                      <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>{subtotal.toFixed(2)} XFA</span>
                      </div>
                      <div className="totals-row">
                        <span>Tax ({tax}%):</span>
                        <span>{taxAmount.toFixed(2)} XFA</span>
                      </div>
                      <div className="totals-row total">
                        <span>Total:</span>
                        <span>{total.toFixed(2)} XFA</span>
                      </div>
                      <div className="totals-row">
                        <span>Advance Paid:</span>
                        <span>{advancePaid.toFixed(2)} XFA</span>
                      </div>
                      {remaining > 0 ? (
                        <div className="totals-row remaining">
                          <span>Remaining:</span>
                          <span>{remaining.toFixed(2)} XFA</span>
                        </div>
                      ) : refund > 0 ? (
                        <div className="totals-row refund">
                          <span>Refund:</span>
                          <span>{refund.toFixed(2)} XFA</span>
                        </div>
                      ) : (
                        <div className="totals-row paid">
                          <span>Fully Paid</span>
                          <span>
                            <Check size={16} />
                          </span>
                        </div>
                      )}
                      <div className="totals-row status">
                        <span>Status:</span>
                        <span className={status.toLowerCase()}>{status}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleCreateInvoice}
                disabled={isLoading || !isAuthenticated}
              >
                {isLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  <>
                    <Plus size={16} /> Create Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content invoice-detail-modal">
            <div className="modal-header">
              <h3>Invoice Details</h3>
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
                    {selectedInvoice.number
                      ? selectedInvoice.number
                      : selectedInvoice.id}
                  </h4>
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
                <p>
                  <strong>Reason:</strong> {selectedInvoice.reason || "N/A"}
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
                        const linePrice =
                          Number.parseFloat(line.unit_price || line.price) || 0;
                        const lineDiscount =
                          Number.parseFloat(line.discount) || 0;
                        const lineQuantity = line.quantity || 0;
                        const lineSubtotal =
                          Number.parseFloat(line.line_total) ||
                          lineQuantity * linePrice * (1 - lineDiscount / 100);
                        const isPromotion = line.is_promotion || false;

                        return (
                          <tr key={index}>
                            <td>{line.product_name || "Unknown Product"}</td>
                            <td>{lineQuantity}</td>
                            <td
                              className={
                                isPromotion
                                  ? "promotion-price"
                                  : "product-price"
                              }
                            >
                              {linePrice.toFixed(2)} XFA
                            </td>
                            <td>{lineDiscount.toFixed(2)} XFA</td>
                            <td className="product-subtotal">
                              {lineSubtotal.toFixed(2)} XFA
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="invoice-detail-totals">
                <div className="totals-row">
                  <span>Subtotal:</span>
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
                    {Number.parseFloat(selectedInvoice.tax_amount || 0).toFixed(
                      2,
                    )}{" "}
                    XFA
                  </span>
                </div>
                <div className="totals-row total">
                  <span>Total:</span>
                  <span>
                    {Number.parseFloat(selectedInvoice.total || 0).toFixed(2)}{" "}
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
              {Number.parseFloat(selectedInvoice.remaining_amount || 0) > 0 && (
                <button
                  className="pay-debt-btn"
                  onClick={() => {
                    setPaymentAmount(
                      Number.parseFloat(selectedInvoice.remaining_amount || 0),
                    );
                    setShowPaymentModal(true);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader size={16} className="spin" />
                  ) : (
                    <>
                      <DollarSign size={16} /> Pay Debt
                    </>
                  )}
                </button>
              )}
              <button
                className="export-pdf-btn"
                onClick={() => handleExportPDF(selectedInvoice.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  <>
                    <FileText size={16} /> Export PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Archive Modal */}
      {confirmArchive !== null && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button
                className="close-modal-btn"
                onClick={() => setConfirmArchive(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete invoice this invoice?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setConfirmArchive(null)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={confirmArchiveInvoice}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  <>
                    <Trash2 size={16} /> Delete Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedInvoice && showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <div className="modal-header">
              <h3>Pay Invoice Debt</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <p>
                  <strong>Invoice #:</strong>{" "}
                  {selectedInvoice.number || selectedInvoice.id}
                </p>
                <p>
                  <strong>Client:</strong>{" "}
                  {selectedInvoice.client_name || "Anonymous"}
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {Number.parseFloat(selectedInvoice.total || 0).toFixed(2)} XFA
                </p>
                <p>
                  <strong>Remaining Balance:</strong>{" "}
                  {Number.parseFloat(
                    selectedInvoice.remaining_amount || 0,
                  ).toFixed(2)}{" "}
                  XFA
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="payment-amount">Payment Amount (XFA)</label>
                <input
                  id="payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  max={Number.parseFloat(selectedInvoice.remaining_amount || 0)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="payment-input"
                />
                <small style={fieldHintStyle}>
                  Maximum payment:{" "}
                  {Number.parseFloat(
                    selectedInvoice.remaining_amount || 0,
                  ).toFixed(2)}{" "}
                  XFA
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="pay-btn"
                onClick={() => {
                  handlePayDebt(selectedInvoice.id, paymentAmount);
                  setShowPaymentModal(false);
                }}
                disabled={
                  isLoading ||
                  paymentAmount <= 0 ||
                  paymentAmount >
                    Number.parseFloat(selectedInvoice.remaining_amount || 0)
                }
              >
                {isLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  <>
                    <DollarSign size={16} /> Process Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Archive Manager */}
      {showArchiveManager && (
        <ArchiveManager onBack={() => setShowArchiveManager(false)} />
      )}
    </div>
  );
};

export default Invoice;
