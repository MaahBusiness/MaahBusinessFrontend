import { useState, useEffect, ChangeEvent, FormEvent, MouseEvent } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import {
  X,
  Plus,
  AlertCircle,
  ImageIcon,
  Edit,
  Trash2,
  Search,
  List,
  Check,
  Loader,
  Calendar,
  Lock,
  Eye,
} from "lucide-react";
import { productService } from "../../services";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import type { ProductsLoaderData } from "../../loaders";
import type { Product, Category, Subcategory } from "../../types";
const NoImage = "/assets/No_IMG.jpg";
import "./products.css";

interface ProductFormData {
  id: string | number | null;
  name: string;
  description: string;
  unit_price: string;
  purchase_price: string;
  image: string | File;
  quantity: number;
  min_quantity: number;
  is_expired: boolean;
  expiry_date: string;
  on_promotion: boolean;
  promotion_start_date: string;
  promotion_end_date: string;
  promo_price: string;
  category_id: string;
  subcategory_id: string;
}

interface ProductItem {
  product: Product;
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
}

const initialFormData: ProductFormData = {
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
};

function Products() {
  const loaderData = useLoaderData() as ProductsLoaderData;
  const revalidator = useRevalidator();
  const notification = useNotification();
  const { hasAccess, isLoading: authLoading } = useAuth();

  // State
  const [products, setProducts] = useState<ProductItem[]>(
    loaderData?.products || [],
  );
  const [categories] = useState<Category[]>(loaderData?.categories || []);
  const [subcategories] = useState<Subcategory[]>(
    loaderData?.subcategories || [],
  );
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >([]);

  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<
    string | number | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Check access
  const userHasAccess = hasAccess([
    "manager",
    "cashier",
    "stock_keeper",
    "wholesale_client",
    "sales_agent",
  ]);

  // Update products when loader data changes
  useEffect(() => {
    if (loaderData?.products) {
      setProducts(loaderData.products);
    }
  }, [loaderData]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const filtered = subcategories.filter(
        (sub) => String(sub.category_id) === String(formData.category_id),
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories]);

  // Form handlers
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "name" && errorMessage) {
      setErrorMessage("");
    }

    if (name === "category_id") {
      setFormData((prev) => ({ ...prev, subcategory_id: "" }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setErrorMessage("");
    setImagePreview(null);
    setIsEditing(false);
    setEditingProductId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const productFormData = new FormData();

      // Format dates if they exist
      const formattedData = { ...formData };
      if (formData.promotion_start_date) {
        formattedData.promotion_start_date = `${formData.promotion_start_date}T00:00:00Z`;
      }
      if (formData.promotion_end_date) {
        formattedData.promotion_end_date = `${formData.promotion_end_date}T00:00:00Z`;
      }
      if (formData.expiry_date) {
        formattedData.expiry_date = `${formData.expiry_date}T00:00:00Z`;
      }

      // Add product_id for update
      if (isEditing && editingProductId) {
        productFormData.append("product_id", String(editingProductId));
      }

      // Add form fields
      Object.entries(formattedData).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          key === "id"
        )
          return;
        if (key === "image" && typeof value === "string") return;
        productFormData.append(key, String(value));
      });

      // Add image file if exists
      if (formData.image && typeof formData.image !== "string") {
        productFormData.append("image", formData.image);
      }

      if (isEditing) {
        await productService.updateProduct(productFormData);
        notification.showSuccess("Product updated successfully!");
      } else {
        await productService.createProduct(productFormData);
        notification.showSuccess("Product created successfully!");
      }

      resetForm();
      revalidator.revalidate();
    } catch (error) {
      console.error("Error saving product:", error);
      notification.showError("Failed to save product. Please try again.");
      setErrorMessage(
        "Failed to save product. Please check all required fields.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (item: ProductItem, event?: MouseEvent) => {
    if (event) event.stopPropagation();

    setIsEditing(true);
    setEditingProductId(item.product.id);

    const product = item.product;
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || "",
      unit_price: String(product.unit_price || ""),
      purchase_price: String(product.purchase_price || ""),
      image: product.image || "",
      quantity: product.quantity || 0,
      min_quantity: product.min_quantity || 0,
      is_expired: product.is_expired || false,
      expiry_date: product.expiry_date ? product.expiry_date.split("T")[0] : "",
      on_promotion: product.on_promotion || false,
      promotion_start_date: product.promotion_start_date
        ? product.promotion_start_date.split("T")[0]
        : "",
      promotion_end_date: product.promotion_end_date
        ? product.promotion_end_date.split("T")[0]
        : "",
      promo_price: String(product.promo_price || ""),
      category_id: String(item.category?.id || product.category_id || ""),
      subcategory_id: String(
        item.subcategory?.id || product.subcategory_id || "",
      ),
    });

    setImagePreview(product.image || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string | number, event?: MouseEvent) => {
    if (event) event.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productService.deleteProduct(String(id));
      notification.showSuccess("Product deleted successfully!");
      revalidator.revalidate();
      if (showDetailsModal) setShowDetailsModal(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      notification.showError("Failed to delete product.");
    }
  };

  const handleViewProductDetails = (item: ProductItem) => {
    setSelectedProduct({
      ...item.product,
      category: item.category,
      subcategory: item.subcategory,
    } as Product);
    setShowDetailsModal(true);
  };

  const fetchProductsByExpiryDate = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProductsByExpiryDate();
      const formattedProducts: ProductItem[] = [
        ...(data.expired_products || []).map((p) => ({
          product: p,
          category: { id: String(p.category_id), name: "Loading..." },
          subcategory: p.subcategory_id
            ? { id: String(p.subcategory_id), name: "" }
            : undefined,
        })),
        ...(data.near_expiry_products || []).map((p) => ({
          product: p,
          category: { id: String(p.category_id), name: "Loading..." },
          subcategory: p.subcategory_id
            ? { id: String(p.subcategory_id), name: "" }
            : undefined,
        })),
      ];
      setProducts(formattedProducts);
      notification.showInfo(
        `Found ${formattedProducts.length} products by expiry date`,
      );
    } catch (error) {
      console.error("Error fetching products by expiry:", error);
      notification.showError("Failed to fetch products by expiry date");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearExpiryFilter = () => {
    revalidator.revalidate();
    notification.showInfo("Cleared expiry date filter");
  };

  // Filter and pagination
  const filteredProducts = products.filter((item) => {
    if (!item.product) return false;
    const term = searchTerm.toLowerCase();
    return (
      item.product.name?.toLowerCase().includes(term) ||
      item.product.description?.toLowerCase().includes(term) ||
      item.category?.name?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  const getStockStatus = (product: Product): string => {
    if (!product) return "unknown";
    if (product.quantity <= 0) return "out-of-stock";
    if (
      product.min_quantity !== undefined &&
      product.quantity <= product.min_quantity
    )
      return "low-stock";
    return "in-stock";
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Access denied
  if (!userHasAccess) {
    return (
      <div className="access-denied-container">
        <Lock size={48} className="access-denied-icon" />
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="back-home-btn"
        >
          Back to Home
        </button>
      </div>
    );
  }

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

        <div className="expiry-filter-container">
          <button
            className="expiry-filter-btn"
            onClick={fetchProductsByExpiryDate}
          >
            <Calendar size={18} /> Expired Products
          </button>
          <button
            className="clear-filter-btn"
            onClick={handleClearExpiryFilter}
          >
            <X size={14} /> Clear Filter
          </button>
        </div>

        <div className="view-controls">
          <button className="view-btn active" aria-label="List view">
            <List size={18} /> List
          </button>
        </div>
      </div>

      {/* Products Display */}
      {isLoading || revalidator.state === "loading" ? (
        <div className="loading-state">
          <Loader size={48} className="spin" />
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((item, index) => {
                const product = item.product;
                const stockStatus = getStockStatus(product);

                return (
                  <tr
                    key={product.id || index}
                    onClick={() => handleViewProductDetails(item)}
                    className="product-row"
                  >
                    <td className="product-image-cell">
                      <div className="product-image-container-small">
                        <img
                          src={product.image || NoImage}
                          alt={product.name || "Product"}
                          className="product-image-small"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = NoImage;
                          }}
                        />
                        {product.on_promotion && (
                          <div className="promotion-badge-small">Sale</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <div className="product-name">
                          {product.name || "Unnamed Product"}
                        </div>
                        <div className="product-description-small">
                          {product.description
                            ? product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description
                            : "No description"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="product-category-cell">
                        {item.category?.name || "Uncategorized"}
                        {item.subcategory?.name && (
                          <span className="product-subcategory">
                            <br />
                            {item.subcategory.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-price-cell">
                        {product.on_promotion && product.promo_price ? (
                          <>
                            <div className="product-price promo">
                              {product.promo_price} XFA
                            </div>
                            <div className="product-price original">
                              {product.unit_price} XFA
                            </div>
                          </>
                        ) : (
                          <div className="product-price">
                            {product.unit_price || 0} XFA
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-stock-cell">
                        {product.quantity || 0}
                      </div>
                    </td>
                    <td>
                      <div className={`stock-status ${stockStatus}`}>
                        {stockStatus === "in-stock" && "In Stock"}
                        {stockStatus === "low-stock" && "Low Stock"}
                        {stockStatus === "out-of-stock" && "Out of Stock"}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProductDetails(item);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="edit-btn"
                          onClick={(e) => handleEditProduct(item, e)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => handleDelete(product.id, e)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-products">
          <p>
            No products found. Try adjusting your search or add a new product.
          </p>
          <button onClick={handleClearExpiryFilter}>
            <X size={14} /> Clear Filter
          </button>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <div className="product-modal-header">
              <h3>{isEditing ? "Edit Product" : "Add New Product"}</h3>
              <button className="close-modal-btn" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h4>Basic Information</h4>

                  <div className="form-group">
                    <label htmlFor="product-name">Name *</label>
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
                    <label htmlFor="purchase-price">Purchase Price *</label>
                    <input
                      id="purchase-price"
                      name="purchase_price"
                      type="number"
                      min="0"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-description">Description</label>
                    <textarea
                      id="product-description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-price">Price *</label>
                      <div className="input-with-prefix">
                        <span className="input-prefix">$</span>
                        <input
                          id="product-price"
                          name="unit_price"
                          type="number"
                          min="0"
                          value={formData.unit_price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-category">Category *</label>
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

                  {formData.category_id && (
                    <div className="form-group subcategory-field">
                      <label htmlFor="product-subcategory">Subcategory</label>
                      <select
                        id="product-subcategory"
                        name="subcategory_id"
                        value={formData.subcategory_id}
                        onChange={handleChange}
                        className="form-select"
                        disabled={filteredSubcategories.length === 0}
                      >
                        <option value="">Select a subcategory</option>
                        {filteredSubcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                      {filteredSubcategories.length === 0 && (
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
                      <label htmlFor="product-quantity">Quantity *</label>
                      <input
                        id="product-quantity"
                        type="number"
                        min="0"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-min-quantity">
                        Min Quantity *
                      </label>
                      <input
                        id="product-min-quantity"
                        type="number"
                        min="0"
                        name="min_quantity"
                        value={formData.min_quantity}
                        onChange={handleChange}
                        required
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
                            src={imagePreview || NoImage}
                            alt="Product preview"
                          />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData((prev) => ({ ...prev, image: "" }));
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
                          <label htmlFor="promo-start">Start Date *</label>
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
                          <label htmlFor="promo-end">End Date *</label>
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
                        <label htmlFor="promo-price">Promotional Price *</label>
                        <div className="input-with-prefix">
                          <span className="input-prefix">$</span>
                          <input
                            id="promo-price"
                            name="promo_price"
                            type="number"
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
                <button
                  type="submit"
                  className="create-btn"
                  disabled={isLoading}
                >
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

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="product-modal-overlay">
          <div className="product-modal-content">
            <div className="product-modal-header">
              <h3>Product Details</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="product-details-content">
              <div className="product-details-grid">
                <div className="product-details-image">
                  <img
                    src={selectedProduct.image || NoImage}
                    alt={selectedProduct.name || "Product"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = NoImage;
                    }}
                  />
                  {selectedProduct.on_promotion && (
                    <div className="promotion-badge details-badge">On Sale</div>
                  )}
                </div>

                <div className="product-details-info">
                  <h2 className="product-details-name">
                    {selectedProduct.name}
                  </h2>

                  <div className="product-details-meta">
                    <div className="product-details-category">
                      <strong>Category:</strong>{" "}
                      {(
                        selectedProduct as Product & {
                          category?: { name: string };
                        }
                      ).category?.name || "Uncategorized"}
                    </div>
                    <div
                      className={`stock-status ${getStockStatus(selectedProduct)}`}
                    >
                      {selectedProduct.quantity > 0
                        ? `${selectedProduct.quantity} in stock`
                        : "Out of stock"}
                    </div>
                  </div>

                  <div className="product-details-price">
                    <span className="product-price">
                      {selectedProduct.on_promotion &&
                      selectedProduct.promo_price
                        ? selectedProduct.promo_price
                        : selectedProduct.unit_price || 0}{" "}
                      XFA
                    </span>
                  </div>

                  <div className="product-details-description">
                    <h4>Description</h4>
                    <p>
                      {selectedProduct.description ||
                        "No description available"}
                    </p>
                  </div>

                  <div className="product-details-specs">
                    <div className="details-spec-item">
                      <strong>Min Quantity:</strong>{" "}
                      {selectedProduct.min_quantity || 0}
                    </div>
                    <div className="details-spec-item">
                      <strong>Expiry Date:</strong>{" "}
                      {selectedProduct.expiry_date
                        ? new Date(
                            selectedProduct.expiry_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>

                  <div className="product-details-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        handleEditProduct({
                          product: selectedProduct,
                        } as ProductItem);
                        setShowDetailsModal(false);
                      }}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        handleDelete(selectedProduct.id);
                        setShowDetailsModal(false);
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
