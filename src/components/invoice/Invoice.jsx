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
    { product_id: "product-1", quantity: 1, discount: 0 },
  ]);

  const subtotal = lines.reduce(
    (sum, item) => sum + item.quantity * 100 * (1 - item.discount / 100),
    0,
  );
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;
  const remaining = total - advancePaid;

  const handleAddLine = () => {
    setLines([...lines, { product_id: "product-2", quantity: 1, discount: 0 }]);
  };

  const handleCreateInvoice = () => {
    const newInvoice = {
      client_name: clientName,
      tax,
      status: "COMPLETED",
      reason,
      due_date: "2025-03-03",
      advance_paid: advancePaid,
      lines,
      subtotal,
      total,
      remaining,
    };
    setInvoices([...invoices, newInvoice]);
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setClientName("");
    setReason("");
    setTax(0);
    setAdvancePaid(0);
    setLines([{ product_id: "product-1", quantity: 1, discount: 0 }]);
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
        <div className="modal-overlay">
          <div className="modal modal2">
            <div className="modal-title">
              {" "}
              <h2>Create New Invoice</h2>
            </div>
            <div className="modal_content">
              <label>
                Client Name:
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="input"
                />
              </label>

              <label>
                Reason:
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input"
                />
              </label>

              <label>
                Tax %:
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="input"
                />
              </label>

              <label>
                Advance Paid:
                <input
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  className="input"
                />
              </label>
              {lines.map((line, index) => (
                <div key={index} className="line-item">
                  <label>
                    Product ID:
                    <input
                      type="text"
                      value={line.product_id}
                      onChange={(e) => {
                        const updatedLines = [...lines];
                        updatedLines[index].product_id = e.target.value;
                        setLines(updatedLines);
                      }}
                      className="input small"
                    />
                  </label>

                  <label>
                    Qty:
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => {
                        const updatedLines = [...lines];
                        updatedLines[index].quantity = Number(e.target.value);
                        setLines(updatedLines);
                      }}
                      className="input tiny"
                    />
                  </label>

                  <label>
                    Discount %:
                    <input
                      type="number"
                      value={line.discount}
                      onChange={(e) => {
                        const updatedLines = [...lines];
                        updatedLines[index].discount = Number(e.target.value);
                        setLines(updatedLines);
                      }}
                      className="input tiny"
                    />
                  </label>
                </div>
              ))}

              <button className="add-line-btn" onClick={handleAddLine}>
                + Add Product
              </button>

              <div className="totals">
                <p>Subtotal: {subtotal} XFA</p>
                <p>Total (Tax): {total} XFA</p>
                <p>Remaining: {remaining} XFA</p>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="create-btn" onClick={handleCreateInvoice}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="invoice-list">
        <h2 className="subtitle">Created Invoices</h2>
        {invoices.map((invoice, index) => (
          <div key={index} className="invoice-card">
            <p>
              <strong>Client:</strong> {invoice.client_name}
            </p>
            <p>
              <strong>Total:</strong> {invoice.total} XFA
            </p>
            <p>
              <strong>Status:</strong> {invoice.status}
            </p>
            <p>
              <strong>Due Date:</strong> {invoice.due_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
