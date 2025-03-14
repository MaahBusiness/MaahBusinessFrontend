import { useState, useEffect } from "react";
import {
  X,
  Plus,
  AlertCircle,
  ImageIcon,
  Edit,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Check,
} from "lucide-react";
import "./products.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
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

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setIsLoading(true);
    // Simulating API call with sample data
    setTimeout(() => {
      const sampleProducts = [
        {
          id: 1,
          name: "Smartphone X",
          description: "Latest smartphone with advanced features",
          unit_price: "999.99",
          image: "/placeholder.svg?height=200&width=200",
          quantity: 50,
          min_quantity: 10,
          is_expired: false,
          expiry_date: "",
          on_promotion: true,
          promotion_start_date: "2025-03-01",
          promotion_end_date: "2025-04-01",
          promo_price: "899.99",
          category_id: "Electronics",
          subcategory_id: "Smartphones",
        },
        {
          id: 2,
          name: "Laptop Pro",
          description: "High-performance laptop for professionals",
          unit_price: "1499.99",
          image: "/placeholder.svg?height=200&width=200",
          quantity: 25,
          min_quantity: 5,
          is_expired: false,
          expiry_date: "",
          on_promotion: false,
          promotion_start_date: "",
          promotion_end_date: "",
          promo_price: "",
          category_id: "Electronics",
          subcategory_id: "Laptops",
        },
        {
          id: 3,
          name: "Wireless Headphones",
          description: "Premium noise-cancelling headphones",
          unit_price: "299.99",
          image: "/placeholder.svg?height=200&width=200",
          quantity: 100,
          min_quantity: 15,
          is_expired: false,
          expiry_date: "",
          on_promotion: true,
          promotion_start_date: "2025-03-15",
          promotion_end_date: "2025-04-15",
          promo_price: "249.99",
          category_id: "Electronics",
          subcategory_id: "Audio",
        },
        {
          id: 4,
          name: "Smart Watch",
          description: "Fitness and health tracking smartwatch",
          unit_price: "199.99",
          image: "/placeholder.svg?height=200&width=200",
          quantity: 75,
          min_quantity: 10,
          is_expired: false,
          expiry_date: "",
          on_promotion: false,
          promotion_start_date: "",
          promotion_end_date: "",
          promo_price: "",
          category_id: "Electronics",
          subcategory_id: "Wearables",
        },
      ];
      setProducts(sampleProducts);
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user types in name field
    if (name === "name" && errorMessage) {
      setErrorMessage("");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update existing product
      const updatedProducts = products.map((product) =>
        product.id === editingProductId
          ? {
              ...formData,
              image: imagePreview || formData.image,
            }
          : product,
      );

      setProducts(updatedProducts);
      setIsEditing(false);
      setEditingProductId(null);
    } else {
      // Check if product name already exists
      const nameExists = products.some(
        (product) => product.name.toLowerCase() === formData.name.toLowerCase(),
      );

      if (nameExists) {
        setErrorMessage("A product with this name already exists.");
        return;
      }

      // Create a new product with an ID
      const newProduct = {
        ...formData,
        id:
          products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
        image: imagePreview || "/placeholder.svg?height=200&width=200",
      };

      // Add the new product to the list
      setProducts([...products, newProduct]);
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setErrorMessage("");
    setImagePreview(null);
    setIsEditing(false);
    setEditingProductId(null);
    setFormData({
      id: null,
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

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setFormData({
      ...product,
    });
    setImagePreview(product.image);
    setShowForm(true);
  };

  const handleDeleteProduct = (id) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStockStatus = (product) => {
    if (product.quantity <= 0) {
      return "out-of-stock";
    } else if (product.quantity <= product.min_quantity) {
      return "low-stock";
    } else {
      return "in-stock";
    }
  };

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Products Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="add-product-btn"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="product-toolbar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid size={18} /> Grid
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={18} /> List
          </button>
        </div>
      </div>

      {/* Products Display */}
      <div className={`products-display ${viewMode}`}>
        {isLoading ? (
          // Loading skeleton
          Array(4)
            .fill()
            .map((_, index) => (
              <div key={index} className="product-card skeleton">
                <div className="product-image skeleton-image"></div>
                <div className="product-details">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line medium"></div>
                </div>
              </div>
            ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="product-image"
                />
                {product.on_promotion && (
                  <div className="promotion-badge">On Sale</div>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <div className="product-category">{product.category_id}</div>
                  <div className={`stock-status ${getStockStatus(product)}`}>
                    {product.quantity > 0
                      ? `${product.quantity} in stock`
                      : "Out of stock"}
                  </div>
                </div>
                <div className="product-price-container">
                  {product.on_promotion ? (
                    <>
                      <span className="product-price discounted">
                        {product.unit_price} XFA
                      </span>
                      <span className="product-price">
                        {product.promo_price} XFA
                      </span>
                    </>
                  ) : (
                    <span className="product-price">
                      {product.unit_price} XFA
                    </span>
                  )}
                </div>
                <div className="product-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>
              No products found. Try adjusting your search or add a new product.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <div className="product-modal-header">
              <h3>{isEditing ? "Edit Product" : "Add New Product"}</h3>
              <button
                className="close-modal-btn"
                onClick={resetForm}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h4>Basic Information</h4>

                  <div className="form-group">
                    <label htmlFor="product-name">Name</label>
                    <input
                      id="product-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errorMessage ? "input-error" : ""}
                      required
                    />
                    {errorMessage && (
                      <div className="error-container">
                        <AlertCircle size={16} />
                        <span className="error-message">{errorMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-description">Description</label>
                    <textarea
                      id="product-description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-price">Price</label>
                      <div className="input-with-prefix">
                        <span className="input-prefix">$</span>
                        <input
                          id="product-price"
                          name="unit_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.unit_price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-category">Category</label>
                      <select
                        id="product-category"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select a category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Books">Books</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-subcategory">Subcategory</label>
                    <select
                      id="product-subcategory"
                      name="subcategory_id"
                      value={formData.subcategory_id}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select a subcategory</option>
                      {formData.category_id === "Electronics" && (
                        <>
                          <option value="Smartphones">Smartphones</option>
                          <option value="Laptops">Laptops</option>
                          <option value="Audio">Audio</option>
                          <option value="Wearables">Wearables</option>
                          <option value="Cameras">Cameras</option>
                        </>
                      )}
                      {formData.category_id === "Clothing" && (
                        <>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Kids">Kids</option>
                          <option value="Accessories">Accessories</option>
                        </>
                      )}
                      {formData.category_id === "Home & Kitchen" && (
                        <>
                          <option value="Furniture">Furniture</option>
                          <option value="Appliances">Appliances</option>
                          <option value="Cookware">Cookware</option>
                          <option value="Decor">Decor</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Inventory Information */}
                <div className="form-section">
                  <h4>Inventory</h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-quantity">Quantity</label>
                      <input
                        id="product-quantity"
                        type="number"
                        min="0"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-min-quantity">Min Quantity</label>
                      <input
                        id="product-min-quantity"
                        type="number"
                        min="0"
                        name="min_quantity"
                        value={formData.min_quantity}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-expiry">Expiry Date</label>
                    <input
                      id="product-expiry"
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_expired"
                        checked={formData.is_expired}
                        onChange={handleChange}
                      />
                      <span>Product is expired</span>
                    </label>
                  </div>

                  <div className="form-group image-upload">
                    <label>Product Image</label>
                    <div className="image-upload-container">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Product preview"
                          />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({ ...formData, image: "" });
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden-input"
                          />
                          <div className="upload-placeholder">
                            <ImageIcon size={24} />
                            <span>Click to upload image</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promotion Information */}
                <div className="form-section promotion-section">
                  <h4>Promotion Details</h4>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="on_promotion"
                        checked={formData.on_promotion}
                        onChange={handleChange}
                      />
                      <span>Product is on promotion</span>
                    </label>
                  </div>

                  {formData.on_promotion && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="promo-start">Start Date</label>
                          <input
                            id="promo-start"
                            type="date"
                            name="promotion_start_date"
                            value={formData.promotion_start_date}
                            onChange={handleChange}
                            required={formData.on_promotion}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="promo-end">End Date</label>
                          <input
                            id="promo-end"
                            type="date"
                            name="promotion_end_date"
                            value={formData.promotion_end_date}
                            onChange={handleChange}
                            required={formData.on_promotion}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="promo-price">Promotional Price</label>
                        <div className="input-with-prefix">
                          <span className="input-prefix">$</span>
                          <input
                            id="promo-price"
                            name="promo_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.promo_price}
                            onChange={handleChange}
                            required={formData.on_promotion}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="create-btn">
                  {isEditing ? (
                    <>
                      <Check size={16} /> Update Product
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Create Product
                    </>
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

export default Product;
