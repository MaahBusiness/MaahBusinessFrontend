"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  FileText,
  DollarSign,
  Calendar,
  User,
  ShoppingCart,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
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

// Sample products data
const products = [
  { id: "product-1", name: "Laptop", price: 1200 },
  { id: "product-2", name: "Smartphone", price: 800 },
  { id: "product-3", name: "Headphones", price: 150 },
  { id: "product-4", name: "Monitor", price: 300 },
  { id: "product-5", name: "Keyboard", price: 80 },
  { id: "product-6", name: "Mouse", price: 50 },
  { id: "product-7", name: "Tablet", price: 500 },
  { id: "product-8", name: "Printer", price: 250 },
];

const Invoice = () => {
  // Main state
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list"); // list, analytics
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [statusMessage, setStatusMessage] = useState({
    show: false,
    text: "",
    type: "success",
  });

  // Form state
  const [clientName, setClientName] = useState("");
  const [reason, setReason] = useState("");
  const [tax, setTax] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);

  const [lines, setLines] = useState([
    { product_id: "", name: "", quantity: 1, price: 0, discount: 0 },
  ]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);
  const [formError, setFormError] = useState("");

  // Initialize with sample data
  useEffect(() => {
    const sampleInvoices = [
      {
        id: "INV-001",
        client_name: "John Doe",
        reason: "IT Equipment Purchase",
        tax: 5,
        status: "COMPLETED",
        due_date: "2025-04-15",
        date_created: "2025-03-01",
        advance_paid: 1500,
        lines: [
          {
            product_id: "product-1",
            name: "Laptop",
            quantity: 1,
            price: 1200,
            discount: 0,
          },
          {
            product_id: "product-3",
            name: "Headphones",
            quantity: 2,
            price: 150,
            discount: 10,
          },
        ],
        subtotal: 1470,
        total: 1543.5,
        remaining: 43.5,
        refund: 0,
      },
      {
        id: "INV-002",
        client_name: "Jane Smith",
        reason: "Office Supplies",
        tax: 7,
        status: "PENDING",
        due_date: "2025-04-30",
        date_created: "2025-03-10",
        advance_paid: 200,
        lines: [
          {
            product_id: "product-5",
            name: "Keyboard",
            quantity: 3,
            price: 80,
            discount: 5,
          },
          {
            product_id: "product-6",
            name: "Mouse",
            quantity: 3,
            price: 50,
            discount: 5,
          },
          {
            product_id: "product-8",
            name: "Printer",
            quantity: 1,
            price: 250,
            discount: 0,
          },
        ],
        subtotal: 569,
        total: 608.83,
        remaining: 408.83,
        refund: 0,
      },
      {
        id: "INV-003",
        client_name: "Robert Johnson",
        reason: "Software Licenses",
        tax: 0,
        status: "COMPLETED",
        due_date: "2025-03-15",
        date_created: "2025-02-15",
        advance_paid: 1000,
        lines: [
          {
            product_id: "product-9",
            name: "Software License",
            quantity: 5,
            price: 200,
            discount: 20,
          },
        ],
        subtotal: 800,
        total: 800,
        remaining: 0,
        refund: 200,
      },
    ];
    setInvoices(sampleInvoices);
  }, []);

  // Helper function to calculate invoice totals
  const calculateTotals = () => {
    const subtotal = lines.reduce(
      (sum, item) =>
        sum + item.quantity * item.price * (1 - item.discount / 100),
      0,
    );
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;
    const remaining = total - advancePaid;
    const refund = advancePaid > total ? advancePaid - total : 0;
    const status = remaining > 0 ? "PENDING" : "COMPLETED";
    return { subtotal, total, remaining, refund, status };
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
      { product_id: "", name: "", quantity: 1, price: 0, discount: 0 },
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

  // Update a line item
  const updateLine = (index, key, value) => {
    setLines(
      lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [key]: value };

          // If product_id changed, update the name and price
          if (key === "product_id" && value) {
            const selectedProduct = products.find((p) => p.id === value);
            if (selectedProduct) {
              updatedLine.name = selectedProduct.name;
              updatedLine.price = selectedProduct.price;
            }
          }

          return updatedLine;
        }
        return line;
      }),
    );
  };

  // Handle creating or updating an invoice
  const handleCreateOrUpdateInvoice = () => {
    // Validate form
    if (!clientName.trim()) {
      setFormError("Client name is required");
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

    const { subtotal, total, remaining, refund, status } = calculateTotals();

    const newInvoice = {
      id:
        currentEditingIndex !== null
          ? invoices[currentEditingIndex].id
          : `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      client_name: clientName,
      reason,
      tax,
      status,

      date_created:
        currentEditingIndex !== null
          ? invoices[currentEditingIndex].date_created
          : new Date().toISOString().split("T")[0],
      advance_paid: advancePaid,
      lines,
      subtotal,
      total,
      remaining,
      refund,
    };

    if (currentEditingIndex !== null) {
      // Update existing invoice
      setInvoices(
        invoices.map((inv, i) =>
          i === currentEditingIndex ? newInvoice : inv,
        ),
      );
      showStatusMessage("Invoice updated successfully");
    } else {
      // Create new invoice
      setInvoices([...invoices, newInvoice]);
      showStatusMessage("Invoice created successfully");
    }

    resetForm();
    setShowModal(false);
  };

  // Handle editing an invoice
  const handleEditInvoice = (index) => {
    const invoice = invoices[index];
    setClientName(invoice.client_name);
    setReason(invoice.reason || "");
    setTax(invoice.tax);
    setAdvancePaid(invoice.advance_paid);

    setLines(invoice.lines);
    setCurrentEditingIndex(index);
    setFormError("");
    setShowModal(true);
  };

  // Handle viewing an invoice
  const handleViewInvoice = (index) => {
    setSelectedInvoice(invoices[index]);
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = (index) => {
    setConfirmDelete(index);
  };

  // Confirm delete
  const confirmDeleteInvoice = () => {
    setInvoices(invoices.filter((_, i) => i !== confirmDelete));
    setConfirmDelete(null);
    showStatusMessage("Invoice deleted successfully", "warning");
  };

  // Reset form
  const resetForm = () => {
    setClientName("");
    setReason("");
    setTax(0);
    setAdvancePaid(0);

    setLines([
      { product_id: "", name: "", quantity: 1, price: 0, discount: 0 },
    ]);
    setCurrentEditingIndex(null);
    setFormError("");
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate analytics data
  const getAnalyticsData = () => {
    // Monthly revenue data
    const monthlyData = {};
    invoices.forEach((invoice) => {
      const month = invoice.date_created.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += invoice.total;
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
        name: "Completed",
        value: invoices.filter((inv) => inv.status === "COMPLETED").length,
      },
      {
        name: "Pending",
        value: invoices.filter((inv) => inv.status === "PENDING").length,
      },
    ];

    // Client distribution
    const clientData = {};
    invoices.forEach((invoice) => {
      if (!clientData[invoice.client_name]) {
        clientData[invoice.client_name] = 0;
      }
      clientData[invoice.client_name] += invoice.total;
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
    (sum, invoice) => sum + invoice.total,
    0,
  );
  const totalPending = invoices.reduce(
    (sum, invoice) =>
      sum + (invoice.status === "PENDING" ? invoice.remaining : 0),
    0,
  );
  const averageInvoiceValue =
    invoices.length > 0 ? totalRevenue / invoices.length : 0;

  // COLORS for charts
  const COLORS = ["#800020", "#6A1B9A", "#4A0F0F", "#B71C1C", "#1F2937"];

  return (
    <div className="invoice-manager-container">
      <div className="invoice-manager-header">
        <h2>Invoice Management</h2>
        <button
          className="add-button"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Create Invoice
        </button>
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

          {filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>
                No invoices found. Create your first invoice to get started.
              </p>
            </div>
          ) : (
            <div className="invoice-list">
              {filteredInvoices.map((invoice, index) => (
                <div key={invoice.id} className="invoice-card">
                  <div className="invoice-card-header">
                    <div className="invoice-id">{invoice.id}</div>
                    <div
                      className={`invoice-status ${invoice.status.toLowerCase()}`}
                    >
                      {invoice.status}
                    </div>
                  </div>
                  <div className="invoice-card-body">
                    <div className="invoice-client">
                      <User size={16} />
                      <span>{invoice.client_name}</span>
                    </div>
                    <div className="invoice-reason">
                      <FileText size={16} />
                      <span>{invoice.reason || "N/A"}</span>
                    </div>
                    <div className="invoice-date">
                      <Calendar size={16} />
                      <span>Due: {invoice.due_date}</span>
                    </div>
                    <div className="invoice-amount">
                      <DollarSign size={16} />
                      <span>{invoice.total.toFixed(2)} XFA</span>
                    </div>
                    <div className="invoice-items">
                      <ShoppingCart size={16} />
                      <span>{invoice.lines.length} items</span>
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
                        className="invoice-action-btn edit"
                        onClick={() => handleEditInvoice(index)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="invoice-action-btn delete"
                        onClick={() => handleDeleteInvoice(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Create/Edit Invoice Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {currentEditingIndex !== null
                  ? "Edit Invoice"
                  : "Create New Invoice"}
              </h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}

              <div className="form-grid">
                {/* Client Information */}
                <div className="form-section">
                  <h4>Client Information</h4>
                  <div className="form-group">
                    <label htmlFor="client-name">Client Name</label>
                    <input
                      id="client-name"
                      type="text"
                      placeholder="Enter client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={
                        formError && !clientName.trim() ? "input-error" : ""
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason/Description</label>
                    <input
                      id="reason"
                      type="text"
                      placeholder="Enter reason for invoice"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="due-date">Due Date</label>
                    <input
                      id="due-date"
                      type="date"
                      onChange={(e) => e.target.value}
                      className={formError ? "input-error" : ""}
                    />
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
                    <div className="line-item-col discount">Discount (%)</div>
                    <div className="line-item-col subtotal">Subtotal</div>
                    <div className="line-item-col actions">Actions</div>
                  </div>

                  {lines.map((line, index) => {
                    const lineSubtotal =
                      line.quantity * line.price * (1 - line.discount / 100);

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
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.price} XFA
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
                          />
                        </div>
                        <div className="line-item-col discount">
                          <input
                            type="number"
                            min="0"
                            max="100"
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
                  const { subtotal, total, remaining, refund, status } =
                    calculateTotals();
                  return (
                    <>
                      <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>{subtotal.toFixed(2)} XFA</span>
                      </div>
                      <div className="totals-row">
                        <span>Tax ({tax}%):</span>
                        <span>{((subtotal * tax) / 100).toFixed(2)} XFA</span>
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
                onClick={handleCreateOrUpdateInvoice}
              >
                {currentEditingIndex !== null ? (
                  <>
                    <Check size={16} /> Update Invoice
                  </>
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
                  <h4>Invoice #{selectedInvoice.id}</h4>
                  <div
                    className={`invoice-status ${selectedInvoice.status.toLowerCase()}`}
                  >
                    {selectedInvoice.status}
                  </div>
                </div>
                <div className="invoice-detail-dates">
                  <div className="date-item">
                    <span>Created:</span>
                    <span>{selectedInvoice.date_created}</span>
                  </div>
                  <div className="date-item">
                    <span>Due:</span>
                    <span>{selectedInvoice.due_date}</span>
                  </div>
                </div>
              </div>

              <div className="invoice-detail-client">
                <h4>Client Information</h4>
                <p>
                  <strong>Name:</strong> {selectedInvoice.client_name}
                </p>
                <p>
                  <strong>Reason:</strong> {selectedInvoice.reason || "N/A"}
                </p>
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
                    {selectedInvoice.lines.map((line, index) => {
                      const lineSubtotal =
                        line.quantity * line.price * (1 - line.discount / 100);
                      return (
                        <tr key={index}>
                          <td>{line.name || line.product_id}</td>
                          <td>{line.quantity}</td>
                          <td>{line.price.toFixed(2)} XFA</td>
                          <td>{line.discount}%</td>
                          <td>{lineSubtotal.toFixed(2)} XFA</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="invoice-detail-totals">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>{selectedInvoice.subtotal.toFixed(2)} XFA</span>
                </div>
                <div className="totals-row">
                  <span>Tax ({selectedInvoice.tax}%):</span>
                  <span>
                    {(
                      (selectedInvoice.subtotal * selectedInvoice.tax) /
                      100
                    ).toFixed(2)}{" "}
                    XFA
                  </span>
                </div>
                <div className="totals-row total">
                  <span>Total:</span>
                  <span>{selectedInvoice.total.toFixed(2)} XFA</span>
                </div>
                <div className="totals-row">
                  <span>Advance Paid:</span>
                  <span>{selectedInvoice.advance_paid.toFixed(2)} XFA</span>
                </div>
                {selectedInvoice.remaining > 0 ? (
                  <div className="totals-row remaining">
                    <span>Remaining:</span>
                    <span>{selectedInvoice.remaining.toFixed(2)} XFA</span>
                  </div>
                ) : selectedInvoice.refund > 0 ? (
                  <div className="totals-row refund">
                    <span>Refund:</span>
                    <span>{selectedInvoice.refund.toFixed(2)} XFA</span>
                  </div>
                ) : (
                  <div className="totals-row paid">
                    <span>Fully Paid</span>
                    <span>
                      <Check size={16} />
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="print-btn" onClick={() => window.print()}>
                Print Invoice
              </button>
              <button
                className="edit-btn"
                onClick={() => {
                  const index = invoices.findIndex(
                    (inv) => inv.id === selectedInvoice.id,
                  );
                  if (index !== -1) {
                    handleEditInvoice(index);
                    setSelectedInvoice(null);
                  }
                }}
              >
                <Edit size={16} /> Edit Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete !== null && (
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
              <p>
                Are you sure you want to delete invoice{" "}
                <strong>{invoices[confirmDelete].id}</strong>?
              </p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDeleteInvoice}>
                <Trash2 size={16} /> Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
