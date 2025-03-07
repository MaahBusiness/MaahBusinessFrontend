import { useState, useEffect } from "react";
import ProductDetail from "./ProductDetail";

import "./products.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // ❗️ For error handling
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit_price: "",
    image: "",
    quantity: 0,
    min_quantity: 0,
    is_expired: false,
    expiry_date: "",
    on_promotion: false,
    promotion_start_date: "",
    promotion_end_date: "",
    promo_price: "",
    category_id: "",
    subcategory_id: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔍 Check if product name already exists
    const nameExists = products.some(
      (product) => product.name.toLowerCase() === formData.name.toLowerCase(),
    );

    if (nameExists) {
      setErrorMessage("A product with this name already exists.");
      return;
    }

    fetch("http://localhost:5000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((newProduct) => setProducts([...products, newProduct]))
      .catch((error) => console.error("Error adding product:", error));

    setShowForm(false);
    setErrorMessage(""); // Reset error message
    setFormData({
      name: "",
      description: "",
      unit_price: "",
      image: "",
      quantity: 0,
      min_quantity: 0,
      is_expired: false,
      expiry_date: "",
      on_promotion: false,
      promotion_start_date: "",
      promotion_end_date: "",
      promo_price: "",
      category_id: "",
      subcategory_id: "",
    });
  };

  return (
    <div className="product-container">
      <div className="product-container-input">
        <h2>Create Product</h2>
        <button onClick={() => setShowForm(true)} className="open-form-btn">
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmit} className="productForm">
              <div className="form-group">
                <label>Name:</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange(e);
                    setErrorMessage(""); // Clear error when editing name
                  }}
                  required
                />
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
              </div>
              <div className="form-group">
                <label>Description:</label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: URL.createObjectURL(e.target.files[0]),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Min Quantity:</label>
                <input
                  type="text"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date:</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    name="is_expired"
                    checked={formData.is_expired}
                    onChange={handleChange}
                  />{" "}
                  Expired
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="on_promotion"
                    checked={formData.on_promotion}
                    onChange={handleChange}
                  />{" "}
                  On Promotion
                </label>
              </div>
              <div className="form-group">
                <label>Promotion Start:</label>
                <input
                  type="date"
                  name="promotion_start_date"
                  value={formData.promotion_start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Promotion End:</label>
                <input
                  type="date"
                  name="promotion_end_date"
                  value={formData.promotion_end_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Promo Price:</label>
                <input
                  name="promo_price"
                  value={formData.promo_price}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Category </label>
                <input
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subcategory </label>
                <input
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="create">
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setErrorMessage("");
                  }}
                  className="Cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div>
        <ProductDetail />
      </div>
    </div>
  );
};

export default Product;
