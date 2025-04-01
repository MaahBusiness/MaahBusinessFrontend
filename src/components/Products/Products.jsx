"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Plus,
  AlertCircle,
  ImageIcon,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  Check,
  Loader,
} from "lucide-react";
import "./products.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    unit_price: "",
    purchase_price: "",
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

  const apiBaseUrl = "http://localhost:8000/api/v1/product";
  const categoryApiBaseUrl = "http://localhost:8000/api/v1/categories";

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productsResponse = await axios.get(
          "http://localhost:8000/api/v1/product/products/",
        );
        console.log(
          "Products fetched successfully",
          productsResponse.data.results,
        );
        setProducts(productsResponse.data.results || []);

        // Fetch categories
        const categoriesResponse = await axios.get(
          `${categoryApiBaseUrl}/categories/`,
        );
        console.log(
          "Categories fetched successfully",
          categoriesResponse.data.results,
        );
        setCategories(categoriesResponse.data.results || []);

        // Fetch all subcategories
        const subcategoriesResponse = await axios.get(
          `${categoryApiBaseUrl}/subcategories/`,
        );
        console.log(
          "Subcategories fetched successfully",
          subcategoriesResponse.data.results,
        );
        setSubcategories(subcategoriesResponse.data.results || []);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setProducts([]);
        setCategories([]);
        setSubcategories([]);
      }
    };

    fetchData();
  }, []);

  // Update filtered subcategories when category changes or when subcategories are loaded
  useEffect(() => {
    if (formData.category_id) {
      setIsLoadingSubcategories(true);
      // Simulate a small delay to show loading state (can be removed in production)
      setTimeout(() => {
        const filtered = subcategories.filter(
          (sub) => sub.category_id === formData.category_id,
        );
        setFilteredSubcategories(filtered);
        setIsLoadingSubcategories(false);
      }, 300);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/product/products/",
      );
      console.log("Products fetched successfully", response.data.results);
      setProducts(response.data.results || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Add a new function to fetch product details after the fetchProducts function
  const fetchProductDetails = async (productId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/detail/`, {
        params: { product_id: productId },
      });
      console.log("Product details fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
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

    // When category changes, reset subcategory
    if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        subcategory_id: "",
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        // Update existing product via API
        const productData = new FormData();

        // Add all form fields to FormData
        Object.keys(formData).forEach((key) => {
          if (
            key !== "image" ||
            (key === "image" && typeof formData[key] !== "string")
          ) {
            productData.append(key, formData[key]);
          }
        });

        // If there's a new image file, append it
        if (formData.image && typeof formData.image !== "string") {
          productData.append("image", formData.image);
        }

        await axios.put(
          `${apiBaseUrl}/${editingProductId}/update/`,
          productData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Refresh products from server
        fetchProducts();
        console.log("Product updated successfully");
      } else {
        // Check if product name already exists
        const nameExists = products.some(
          (product) =>
            product.name &&
            formData.name &&
            product.name.toLowerCase() === formData.name.toLowerCase(),
        );

        if (nameExists) {
          setErrorMessage("A product with this name already exists.");
          return;
        }

        // Create a new product via API
        const productData = new FormData();

        // Add all form fields to FormData
        Object.keys(formData).forEach((key) => {
          if (
            key !== "image" ||
            (key === "image" && typeof formData[key] !== "string")
          ) {
            productData.append(key, formData[key]);
          }
        });

        // If there's a new image file, append it
        if (formData.image && typeof formData.image !== "string") {
          productData.append("image", formData.image);
        }

        const response = await axios.post(
          `${apiBaseUrl}/create/`,
          productData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Add the new product to the list
        if (response.data) {
          // Refresh products from server to ensure we have the latest data
          fetchProducts();
          console.log("Product created successfully");
        }
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating/updating product:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to process product. Please try again.",
      );
    }
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
      purchase_price: "",
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

  // Update the handleEditProduct function to use the fetchProductDetails API
  const handleEditProduct = async (product) => {
    setIsLoading(true);
    try {
      // Fetch detailed product information
      const productDetails = await fetchProductDetails(product.id);

      if (productDetails) {
        setIsEditing(true);
        setEditingProductId(product.id);
        setFormData({
          ...productDetails,
        });
        setImagePreview(productDetails.image);
      } else {
        // Fallback to using the product data we already have
        setIsEditing(true);
        setEditingProductId(product.id);
        setFormData({
          ...product,
        });
        setImagePreview(product.image);
      }
    } catch (error) {
      console.error("Error preparing product for edit:", error);
      // Fallback to using the product data we already have
      setIsEditing(true);
      setEditingProductId(product.id);
      setFormData({
        ...product,
      });
      setImagePreview(product.image);
    } finally {
      setIsLoading(false);
      setShowForm(true);
    }
  };

  const handleDeleteProduct = async (id) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Delete product via API
        await axios.delete(`${apiBaseUrl}/${id}/delete/`);

        // Update local state
        setProducts(products.filter((product) => product.id !== id));
        console.log("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.name &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category_id &&
        getCategoryName(product.category_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())),
  );

  const getStockStatus = (product) => {
    if (!product || product.quantity === undefined) return "unknown";

    if (product.quantity <= 0) {
      return "out-of-stock";
    } else if (
      product.min_quantity !== undefined &&
      product.quantity <= product.min_quantity
    ) {
      return "low-stock";
    } else {
      return "in-stock";
    }
  };

  // Get category name by id
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Get subcategory name by id
  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
    return subcategory ? subcategory.name : "";
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
          filteredProducts.map((product, index) => (
            <div key={product.id || index} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name || "Product"}
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
                {product.on_promotion && (
                  <div className="promotion-badge">On Sale</div>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-name">
                  {product.name || "Unnamed Product"}
                </h3>
                <p className="product-description">
                  {product.description || "No description available"}
                </p>
                <div className="product-meta">
                  <div className="product-category">
                    {getCategoryName(product.category_id) || "Uncategorized"}
                    {product.subcategory_id && (
                      <span className="product-subcategory">
                        {" "}
                        / {getSubcategoryName(product.subcategory_id)}
                      </span>
                    )}
                  </div>
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
                        {product.unit_price || 0} XFA
                      </span>
                      <span className="product-price">
                        {product.promo_price || 0} XFA
                      </span>
                    </>
                  ) : (
                    <span className="product-price">
                      {product.unit_price || 0} XFA
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
                    <label htmlFor="purchase-price">Purchase Price</label>
                    <input
                      id="purchase-price"
                      name="purchase_price"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      className={errorMessage ? "input-error" : ""}
                    />
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
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Only show subcategory field when a category is selected */}
                  {formData.category_id && (
                    <div className="form-group subcategory-field">
                      <label htmlFor="product-subcategory">
                        Subcategory
                        {isLoadingSubcategories && (
                          <span className="loading-indicator-inline">
                            <Loader size={14} className="spinner" />
                          </span>
                        )}
                      </label>
                      <select
                        id="product-subcategory"
                        name="subcategory_id"
                        value={formData.subcategory_id}
                        onChange={handleChange}
                        className="form-select"
                        disabled={
                          isLoadingSubcategories ||
                          filteredSubcategories.length === 0
                        }
                      >
                        <option value="">Select a subcategory</option>
                        {filteredSubcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                      {!isLoadingSubcategories &&
                        filteredSubcategories.length === 0 && (
                          <div className="subcategory-message">
                            <AlertCircle size={14} />
                            <small>
                              No subcategories available for this category
                            </small>
                          </div>
                        )}
                    </div>
                  )}
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
