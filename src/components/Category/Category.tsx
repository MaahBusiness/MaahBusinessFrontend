"use client";

import { useState, useCallback } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Info,
  Package,
  ShoppingBag,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Eye,
} from "lucide-react";
import No_image from "../../../public/assets/No_IMG.jpg";
import { useNotification } from "../../context/NotificationContext";
import { useModal, usePagination, useSearch } from "../../hooks";
import { categoryService, productService } from "../../services";
import type { CategoryLoaderData } from "../../loaders";
import type { Category, Subcategory, Product } from "../../types";
import "./category.css";

function CategoryPage() {
  const loaderData = useLoaderData() as CategoryLoaderData;
  const revalidator = useRevalidator();
  const notification = useNotification();

  // Local state for data that can change
  const [categories, setCategories] = useState<Category[]>(loaderData.categories || []);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(loaderData.subcategories || []);

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<Category | null>(null);
  const [subcategoryDetails, setSubcategoryDetails] = useState<Subcategory | null>(null);
  const [subcategoryProducts, setSubcategoryProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Loading states
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategoryDetails, setIsLoadingCategoryDetails] = useState(false);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] = useState(false);

  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formError, setFormError] = useState("");

  // Search
  const { searchTerm, setSearchTerm, filteredItems: filteredCategories } = useSearch(categories, ["name", "description"]);
  const { searchTerm: searchSubcategory, setSearchTerm: setSearchSubcategory, filteredItems: filteredSubcategoriesBase } = useSearch(
    subcategories.filter((s) => s.category_id === selectedCategory?.id),
    ["name", "description"]
  );
  const { searchTerm: searchCategory, setSearchTerm: setSearchCategory, filteredItems: filteredCategoryProducts } = useSearch(
    categoryProducts,
    ["name", "description"]
  );

  // Modals
  const categoryModal = useModal();
  const subcategoryModal = useModal();
  const detailsModal = useModal();
  const categoryProductsModal = useModal();
  const productDetailModal = useModal();

  // Pagination
  const { currentItems: paginatedCategoryProducts, currentPage, totalPages, goToPage, nextPage, prevPage } = usePagination(
    filteredCategoryProducts,
    6
  );
  const {
    currentItems: paginatedSubcategoryProducts,
    currentPage: subCurrentPage,
    totalPages: subTotalPages,
    goToPage: subGoToPage,
    nextPage: subNextPage,
    prevPage: subPrevPage,
  } = usePagination(subcategoryProducts, 6);

  // Filtered subcategories for current category
  const filteredSubcategories = selectedCategory
    ? subcategories.filter(
        (sub) =>
          sub.category_id === selectedCategory.id &&
          (searchSubcategory === "" ||
            sub.name.toLowerCase().includes(searchSubcategory.toLowerCase()) ||
            sub.description.toLowerCase().includes(searchSubcategory.toLowerCase()))
      )
    : [];

  // Fetch category details
  const fetchCategoryDetails = useCallback(async (categoryId: string) => {
    setIsLoadingCategoryDetails(true);
    try {
      const details = await categoryService.getCategoryDetail(categoryId);
      setCategoryDetails(details);
    } catch (error) {
      console.error("Error fetching category details:", error);
      setCategoryDetails(null);
    } finally {
      setIsLoadingCategoryDetails(false);
    }
  }, []);

  // Fetch subcategory details
  const fetchSubcategoryDetails = useCallback(async (subcategoryId: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await categoryService.getSubcategoryDetail(subcategoryId);
      setSubcategoryDetails(details);
    } catch (error) {
      console.error("Error fetching subcategory details:", error);
      setSubcategoryDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // Fetch subcategory products
  const fetchSubcategoryProducts = useCallback(async (subcategoryId: string) => {
    setIsLoadingProducts(true);
    try {
      const response = await categoryService.getSubcategoryProducts(subcategoryId);
      setSubcategoryProducts(response.results || []);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);
      setSubcategoryProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch category products
  const fetchCategoryProducts = useCallback(async (categoryId: string) => {
    setIsLoadingCategoryProducts(true);
    try {
      const response = await categoryService.getCategoryProducts(categoryId);
      setCategoryProducts(response.results || []);
    } catch (error) {
      console.error("Error fetching category products:", error);
      setCategoryProducts([]);
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  }, []);

  // Fetch product details
  const fetchProductDetails = useCallback(async (productId: string) => {
    try {
      const details = await productService.getProductDetail(productId);
      return details;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  }, []);

  // Handlers
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryDetails(category.id);
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryDetails(null);
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    fetchSubcategoryDetails(subcategory.id);
    fetchSubcategoryProducts(subcategory.id);
    detailsModal.open();
  };

  const handleViewCategoryProducts = () => {
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory.id);
      categoryProductsModal.open();
    }
  };

  const handleProductSelect = async (product: Product) => {
    const details = await fetchProductDetails(product.id);
    setSelectedProduct(details || product);
    productDetailModal.open();
  };

  // Category modal functions
  const openCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
    }
    setFormError("");
    categoryModal.open();
  };

  const closeCategoryModal = () => {
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategory(null);
    setFormError("");
    categoryModal.close();
  };

  const addOrUpdateCategory = async () => {
    if (!categoryName.trim()) {
      setFormError("Category name is required");
      return;
    }
    if (!categoryDescription.trim()) {
      setFormError("Category description is required");
      return;
    }

    const isDuplicate = categories.some(
      (cat) => cat.name && cat.name.toLowerCase() === categoryName.toLowerCase() && cat.id !== editingCategory?.id
    );
    if (isDuplicate) {
      setFormError("Category name must be unique!");
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name: categoryName, description: categoryDescription });
        notification.success("Category updated successfully!");
      } else {
        await categoryService.createCategory({ name: categoryName, description: categoryDescription });
        notification.success("Category created successfully!");
      }
      revalidator.revalidate();
      closeCategoryModal();
    } catch (error) {
      console.error("Error creating/updating category:", error);
      setFormError("Failed to process category. Please try again.");
    }
  };

  const deleteCategory = async (id: string) => {
    const hasSubcategories = subcategories.some((sub) => sub.category_id === id);
    if (hasSubcategories) {
      notification.error("Cannot delete category that has subcategories.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(categories.filter((cat) => cat.id !== id));
        setSelectedCategory(null);
        notification.warning("Category deleted successfully!");
      } catch (error) {
        console.error("Error deleting category:", error);
        notification.error("Failed to delete category. Please try again.");
      }
    }
  };

  // Subcategory modal functions
  const openSubcategoryModal = (subcategory: Subcategory | null = null) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryName(subcategory.name);
      setSubcategoryDescription(subcategory.description);
    } else {
      setEditingSubcategory(null);
      setSubcategoryName("");
      setSubcategoryDescription("");
    }
    setFormError("");
    subcategoryModal.open();
  };

  const closeSubcategoryModal = () => {
    setSubcategoryName("");
    setSubcategoryDescription("");
    setEditingSubcategory(null);
    setFormError("");
    subcategoryModal.close();
  };

  const addOrUpdateSubcategory = async () => {
    if (!subcategoryName.trim()) {
      setFormError("Subcategory name is required");
      return;
    }
    if (!subcategoryDescription.trim()) {
      setFormError("Subcategory description is required");
      return;
    }
    if (!selectedCategory) {
      setFormError("No category selected");
      return;
    }

    const isDuplicate = subcategories.some(
      (sub) =>
        sub.name &&
        sub.name.toLowerCase() === subcategoryName.toLowerCase() &&
        sub.category_id === selectedCategory.id &&
        sub.id !== editingSubcategory?.id
    );
    if (isDuplicate) {
      setFormError("A subcategory with this name already exists in this category!");
      return;
    }

    try {
      if (editingSubcategory) {
        const updated = await categoryService.updateSubcategory(editingSubcategory.id, {
          name: subcategoryName,
          description: subcategoryDescription,
          category_id: selectedCategory.id,
        });
        setSubcategories(subcategories.map((sub) => (sub.id === editingSubcategory.id ? updated : sub)));
        notification.success("Subcategory updated successfully!");
      } else {
        const created = await categoryService.createSubcategory({
          name: subcategoryName,
          description: subcategoryDescription,
          category_id: selectedCategory.id,
        });
        setSubcategories([...subcategories, created]);
        notification.success("Subcategory created successfully!");
      }
      closeSubcategoryModal();
    } catch (error) {
      console.error("Error creating/updating subcategory:", error);
      setFormError("Failed to process subcategory. Please try again.");
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await categoryService.deleteSubcategory(id);
        setSubcategories(subcategories.filter((sub) => sub.id !== id));
        notification.warning("Subcategory deleted successfully!");
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        notification.error("Failed to delete subcategory. Please try again.");
      }
    }
  };

  // Format helpers
  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleDateString() : "N/A");
  const formatDateTime = (dateString?: string) => (dateString ? new Date(dateString).toLocaleString() : "N/A");
  const formatPrice = (price?: number) => (price != null ? `$${Number(price).toFixed(2)}` : "N/A");

  return (
    <div className="category-dashboard">
      <div className="category-sidebar">
        <div className="sidebar-headerr">
          <h2>Categories</h2>
          <button className="add-category-btn" onClick={() => openCategoryModal()}>
            <Package size={16} /> Add New Category
          </button>
        </div>

        <div className="category-list">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${selectedCategory?.id === category.id ? "active" : ""}`}
              >
                <div className="category-item-content" onClick={() => handleCategorySelect(category)}>
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">
                    {subcategories.filter((sub) => sub.category_id === category.id).length} subcategories
                  </span>
                </div>
                <button
                  className="category-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(category.id);
                  }}
                  title="Delete category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="no-categories">No categories found</div>
          )}
        </div>
      </div>

      <div className="category-content">
        {!selectedCategory ? (
          <div className="welcome-section">
            <h1>Category Management</h1>
            <p>Select a category to view details or manage subcategories</p>
            <div className="search-container welcome-search">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        ) : (
          <div className="selected-category-details">
            <div className="category-details-header">
              <button className="back-btn" onClick={handleBackToCategories}>
                <ArrowLeft size={16} /> Back to Categories
              </button>
              <div className="category-actions">
                <button className="view-products-btn" onClick={handleViewCategoryProducts}>
                  <ShoppingBag size={16} /> View Products
                </button>
                <button className="edit-btn" onClick={() => openCategoryModal(selectedCategory)}>
                  <Edit size={16} /> Edit
                </button>
                <button className="add-subcategory-btn" onClick={() => openSubcategoryModal()}>
                  <Plus size={16} /> Add Subcategory
                </button>
              </div>
            </div>

            <div className="category-info">
              {isLoadingCategoryDetails ? (
                <div className="loading-indicator">Loading category details...</div>
              ) : categoryDetails ? (
                <div className="category-details-container">
                  <h2>{categoryDetails.name}</h2>
                  <p className="category-description">{categoryDetails.description}</p>
                  <div className="category-meta-info">
                    <div className="category-meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">
                        <div className="date-time-display">
                          <Calendar size={14} />
                          <span>{formatDate(categoryDetails.created_at)}</span>
                        </div>
                        <div className="date-time-display">
                          <Clock size={14} />
                          <span>{categoryDetails.created_at && new Date(categoryDetails.created_at).toLocaleTimeString()}</span>
                        </div>
                      </span>
                    </div>
                    <div className="category-meta-item">
                      <span className="meta-label">Subcategories:</span>
                      <span className="meta-value">
                        {subcategories.filter((sub) => sub.category_id === selectedCategory.id).length}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2>{selectedCategory.name}</h2>
                  <p>{selectedCategory.description}</p>
                </div>
              )}
            </div>

            <div className="subcategories-section">
              <div className="subcategories-header">
                <h3>Subcategories</h3>
                <div className="search-container subcategory-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchSubcategory}
                    onChange={(e) => setSearchSubcategory(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="subcategories-list">
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcategory) => (
                    <div key={subcategory.id} className="subcategory-item">
                      <div className="subcategory-info" onClick={() => handleSubcategorySelect(subcategory)}>
                        <h4>{subcategory.name}</h4>
                        <p>{subcategory.description}</p>
                        <button className="view-details-btnn">
                          <Info size={16} />
                          <span>View Details</span>
                        </button>
                      </div>
                      <div className="subcategory-actions">
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSubcategoryModal(subcategory);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubcategory(subcategory.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-subcategories">
                    {searchSubcategory ? "No subcategories match your search" : "No subcategories found"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {categoryModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button className="close-modal-btn" onClick={closeCategoryModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {formError && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="category-name">Category Name</label>
                <input
                  id="category-name"
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className={formError && !categoryName.trim() ? "input-error" : ""}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category-description">Description</label>
                <textarea
                  id="category-description"
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className={formError && !categoryDescription.trim() ? "input-error" : ""}
                  rows={3}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeCategoryModal}>
                Cancel
              </button>
              <button className="save-btn" onClick={addOrUpdateCategory}>
                {editingCategory ? (
                  <>
                    <Check size={16} /> Update
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {subcategoryModal.isOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}</h3>
              <button className="close-modal-btn" onClick={closeSubcategoryModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {formError && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label>Parent Category</label>
                <input type="text" value={selectedCategory.name} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label htmlFor="subcategory-name">Subcategory Name</label>
                <input
                  id="subcategory-name"
                  type="text"
                  placeholder="Enter subcategory name"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className={formError && !subcategoryName.trim() ? "input-error" : ""}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subcategory-description">Description</label>
                <textarea
                  id="subcategory-description"
                  placeholder="Enter subcategory description"
                  value={subcategoryDescription}
                  onChange={(e) => setSubcategoryDescription(e.target.value)}
                  className={formError && !subcategoryDescription.trim() ? "input-error" : ""}
                  rows={3}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeSubcategoryModal}>
                Cancel
              </button>
              <button className="save-btn" onClick={addOrUpdateSubcategory}>
                {editingSubcategory ? (
                  <>
                    <Check size={16} /> Update
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Details Modal */}
      {detailsModal.isOpen && selectedSubcategory && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>Subcategory Details: {selectedSubcategory.name}</h3>
              <button className="close-modal-btn" onClick={detailsModal.close}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {isLoadingDetails ? (
                <div className="loading-indicator">Loading subcategory details...</div>
              ) : subcategoryDetails ? (
                <div className="subcategory-details-container">
                  <div className="details-section">
                    <h4>Basic Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{subcategoryDetails.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{subcategoryDetails.description}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">{formatDateTime(subcategoryDetails.created_at)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Parent Category:</span>
                        <span className="detail-value">
                          {categories.find((cat) => cat.id === subcategoryDetails.category_id)?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4>Products in this Subcategory</h4>
                    {isLoadingProducts ? (
                      <div className="loading-indicator">Loading products...</div>
                    ) : subcategoryProducts.length > 0 ? (
                      <>
                        <div className="subcategory-products">
                          {paginatedSubcategoryProducts.map((product) => (
                            <div key={product.id} className="product-item" onClick={() => handleProductSelect(product)}>
                              <div className="product-image">
                                <img src={product.image || No_image} alt={product.name} />
                              </div>
                              <div className="product-info">
                                <h5>{product.name}</h5>
                                <p className="product-description">{product.description}</p>
                                <div className="product-meta">
                                  <span className="product-price">{formatPrice(product.unit_price)}</span>
                                  <span className="product-stock">Stock: {product.quantity}</span>
                                </div>
                                <button className="view-product-btn">
                                  <Eye size={14} /> View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {subTotalPages > 1 && (
                          <div className="pagination">
                            <button onClick={subPrevPage} disabled={subCurrentPage === 1} className="pagination-btn">
                              <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: subTotalPages }, (_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => subGoToPage(i + 1)}
                                className={`pagination-btn ${subCurrentPage === i + 1 ? "active" : ""}`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            <button onClick={subNextPage} disabled={subCurrentPage === subTotalPages} className="pagination-btn">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="no-products">No products found in this subcategory</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="error-message">Failed to load subcategory details</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Products Modal */}
      {categoryProductsModal.isOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>Products in {selectedCategory.name}</h3>
              <button className="close-modal-btn" onClick={categoryProductsModal.close}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-container product-search">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="search-input"
                />
              </div>

              {isLoadingCategoryProducts ? (
                <div className="loading-indicator">Loading category products...</div>
              ) : filteredCategoryProducts.length > 0 ? (
                <div className="category-products-container">
                  <div className="category-products-grid">
                    {paginatedCategoryProducts.map((product) => (
                      <div key={product.id} className="product-card" onClick={() => handleProductSelect(product)}>
                        <div className="product-card-image">
                          <img src={product.image || No_image} alt={product.name} />
                          {product.on_promotion && <span className="promotion-tag">On Sale</span>}
                        </div>
                        <div className="product-card-content">
                          <h4 className="product-card-title">{product.name}</h4>
                          <p className="product-card-description">{product.description}</p>
                          <div className="product-card-details">
                            <div className="product-card-price">
                              {product.on_promotion ? (
                                <>
                                  <span className="original-price">{formatPrice(product.unit_price)}</span>
                                  <span className="sale-price">{formatPrice(product.promo_price)}</span>
                                </>
                              ) : (
                                <span>{formatPrice(product.unit_price)}</span>
                              )}
                            </div>
                            <div className="product-card-stock">
                              <span className={`stock-indicator ${product.quantity > 0 ? "in-stock" : "out-of-stock"}`}>
                                {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                              </span>
                            </div>
                          </div>
                          <button className="view-product-btn">
                            <Eye size={14} /> View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn">
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => goToPage(i + 1)}
                          className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-btn">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-products-message">
                  <Package size={48} />
                  <p>{searchCategory ? "No products match your search" : "No products found in this category"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {productDetailModal.isOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content product-detail-modal">
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="close-modal-btn" onClick={productDetailModal.close}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="product-detail-container">
                <div className="product-detail-image">
                  <img src={selectedProduct.image || No_image} alt={selectedProduct.name} />
                  {selectedProduct.on_promotion && <span className="promotion-tag large">On Sale</span>}
                </div>
                <div className="product-detail-info">
                  <h2 className="product-detail-title">{selectedProduct.name}</h2>
                  <p className="product-detail-description">{selectedProduct.description}</p>
                  <div className="product-detail-meta">
                    <div className="product-detail-price">
                      <span className="detail-label">Price:</span>
                      {selectedProduct.on_promotion ? (
                        <div className="price-container">
                          <span className="original-price large">{formatPrice(selectedProduct.unit_price)}</span>
                          <span className="sale-price large">{formatPrice(selectedProduct.promo_price)}</span>
                        </div>
                      ) : (
                        <span className="price-value">{formatPrice(selectedProduct.unit_price)}</span>
                      )}
                    </div>
                    <div className="product-detail-stock">
                      <span className="detail-label">Stock Status:</span>
                      <span className={`stock-indicator large ${selectedProduct.quantity > 0 ? "in-stock" : "out-of-stock"}`}>
                        {selectedProduct.quantity > 0 ? `${selectedProduct.quantity} in stock` : "Out of stock"}
                      </span>
                    </div>
                    {selectedProduct.expiry_date && (
                      <div className="product-detail-expiry">
                        <span className="detail-label">Expiry Date:</span>
                        <span className="expiry-value">{formatDate(selectedProduct.expiry_date)}</span>
                      </div>
                    )}
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

export default CategoryPage;

