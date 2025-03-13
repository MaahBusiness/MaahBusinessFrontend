import { useState } from "react";
import "./Invoice.css";

export default function Invoice() {
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [clientName, setClientName] = useState("");
  const [reason, setReason] = useState("");
  const [tax, setTax] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [lines, setLines] = useState([
    { product_id: "product-1", quantity: 1, price: 100, discount: 0 },
  ]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

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

  const { subtotal, total, remaining, refund, status } = calculateTotals();

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        product_id: `product-${lines.length + 1}`,
        quantity: 1,
        price: 100,
        discount: 0,
      },
    ]);
  };

  const updateLine = (index, key, value) => {
    setLines(
      lines.map((line, i) => (i === index ? { ...line, [key]: value } : line)),
    );
  };

  const handleCreateOrUpdateInvoice = () => {
    const newInvoice = {
      client_name: clientName,
      tax,
      status,
      reason,
      due_date: "2025-03-03",
      advance_paid: advancePaid,
      lines,
      subtotal,
      total,
      remaining,
      refund,
    };

    setInvoices((prev) =>
      currentEditingIndex !== null
        ? prev.map((inv, i) => (i === currentEditingIndex ? newInvoice : inv))
        : [...prev, newInvoice],
    );

    resetForm();
    setShowModal(false);
  };

  const handleEditInvoice = (index) => {
    const invoice = invoices[index];
    setClientName(invoice.client_name);
    setReason(invoice.reason);
    setTax(invoice.tax);
    setAdvancePaid(invoice.advance_paid);
    setLines(invoice.lines);
    setCurrentEditingIndex(index);
    setShowModal(true);
  };

  const resetForm = () => {
    setClientName("");
    setReason("");
    setTax(0);
    setAdvancePaid(0);
    setLines([
      { product_id: "product-1", quantity: 1, price: 100, discount: 0 },
    ]);
    setCurrentEditingIndex(null);
  };

  return (
    <div className="invoice-container">
      <div className="header">
        <h1 className="title">Invoices</h1>
        <button className="add-invoice-btn" onClick={() => setShowModal(true)}>
          Add Invoice
        </button>
      </div>

      {showModal && (
        <div className="modal-overllay">
          <div className="modall">
            <div className="modallheader">
              <h2>
                {currentEditingIndex !== null
                  ? "Edit Invoice"
                  : "Create New Invoice"}
              </h2>
            </div>
            <div className="modal_content">
              <label>
                Client Name:
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </label>
              <label>
                Reason:
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <label>
                Tax %:
                <input
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                />
              </label>
              <label>
                Advance Paid:
                <input
                  type="number"
                  min="0"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                />
              </label>
              {lines.map((line, index) => (
                <div key={index} className="line-item">
                  <label>
                    Product Name:
                    <input
                      type="text"
                      value={line.product_id}
                      onChange={(e) =>
                        updateLine(index, "product_id", e.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
              <button onClick={handleAddLine}>+ Add Product</button>
              <div className="totals">
                <p>Subtotal: {subtotal.toFixed(2)} XFA</p>
                <p>Total (Tax): {total.toFixed(2)} XFA</p>
                <p>Remaining: {remaining.toFixed(2)} XFA</p>
                {refund > 0 && <p>Refund: {refund.toFixed(2)} XFA</p>}
                <p>Status: {status}</p>
              </div>
              <button onClick={handleCreateOrUpdateInvoice}>
                {currentEditingIndex !== null ? "Update" : "Create"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="invoice-list">
        <h2>Created Invoices</h2>
        {invoices.length === 0 ? (
          <p>No invoices created yet.</p>
        ) : (
          invoices.map((invoice, index) => (
            <div key={index} className="invoice-card">
              <p>
                <strong>Client:</strong> {invoice.client_name}
              </p>
              <p>
                <strong>Reason:</strong> {invoice.reason}
              </p>
              <p>
                <strong>Products:</strong>
              </p>
              <ul>
                {invoice.lines.map((line, idx) => (
                  <li key={idx}>
                    {line.product_id} - {line.quantity} x {line.price} XFA (
                    {line.discount}% off)
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total:</strong> {invoice.total.toFixed(2)} XFA
              </p>
              <p>
                <strong>Status:</strong> {invoice.status}
              </p>
              <button onClick={() => handleEditInvoice(index)}>Edit</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
