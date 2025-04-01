"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import "./category.css";

const Category = () => {
  // Categories state
  const [categories, setCategories] = useState([]);

  // Subcategories state
  const [subcategories, setSubcategories] = useState([]);

  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Selected subcategory state
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Subcategory details state
  const [subcategoryDetails, setSubcategoryDetails] = useState(null);

  // Subcategory products state
  const [subcategoryProducts, setSubcategoryProducts] = useState([]);

  // Category products state
  const [categoryProducts, setCategoryProducts] = useState([]);

  // Loading states
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] =
    useState(false);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCategoryProductsModalOpen, setIsCategoryProductsModalOpen] =
    useState(false);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState({
    show: false,
    text: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

  // Add these state variables after the other state declarations
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [isLoadingCategoryDetails, setIsLoadingCategoryDetails] =
    useState(false);

  const apiBaseUrl = "http://localhost:8000/api/v1/categories";
  const productApiBaseUrl = "http://localhost:8000/api/v1/product";

  // Fetch categories and subcategories on component mount or when refreshData changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const response = await axios.get(`${apiBaseUrl}/categories/`);
        console.log("Categories fetched successfully:", response.data.results);
        setCategories(response.data.results || []);

        // Fetch subcategories
        try {
          const subResponse = await axios.get(`${apiBaseUrl}/subcategories/`);
          console.log("Subcategories fetched successfully:", subResponse.data);
          setSubcategories(subResponse.data.results || []);
        } catch (subError) {
          console.error("Error fetching subcategories:", subError);
          setSubcategories([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setSubcategories([]);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshData]);

  // Fetch subcategory details when a subcategory is selected
  const fetchSubcategoryDetails = async (subcategoryId) => {
    if (!subcategoryId) return;

    setIsLoadingDetails(true);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/${subcategoryId}/subcategory/detail/`,
      );
      console.log("Subcategory details fetched successfully:", response.data);
      setSubcategoryDetails(response.data);
      setIsLoadingDetails(false);
    } catch (error) {
      console.error("Error fetching subcategory details:", error);
      setSubcategoryDetails(null);
      setIsLoadingDetails(false);
    }
  };

  // Fetch products for a subcategory
  const fetchSubcategoryProducts = async (subcategoryId) => {
    if (!subcategoryId) return;

    setIsLoadingProducts(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/sub/products/`, {
        params: { subcategory_id: subcategoryId },
      });
      console.log("Subcategory products fetched successfully:", response.data);
      setSubcategoryProducts(response.data.results || []);
      setIsLoadingProducts(false);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);
      setSubcategoryProducts([]);
      setIsLoadingProducts(false);
    }
  };

  // Fetch products for a category
  const fetchCategoryProducts = async (categoryId) => {
    if (!categoryId) return;

    setIsLoadingCategoryProducts(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/products/`, {
        params: { category_id: categoryId },
      });
      console.log("Category products fetched successfully:", response.data);
      setCategoryProducts(response.data.results || []);
      setIsLoadingCategoryProducts(false);
    } catch (error) {
      console.error("Error fetching category products:", error);

      // Fallback to fetching from product API if category API fails
      try {
        const productResponse = await axios.get(
          `${productApiBaseUrl}/products/`,
        );
        const filteredProducts = productResponse.data.results.filter(
          (product) => product.category_id === categoryId,
        );
        console.log("Products filtered by category:", filteredProducts);
        setCategoryProducts(filteredProducts);
      } catch (productError) {
        console.error("Error fetching from product API:", productError);
        setCategoryProducts([]);
      }

      setIsLoadingCategoryProducts(false);
    }
  };

  // Fetch category details
  const fetchCategoryDetails = async (categoryId) => {
    if (!categoryId) return;

    setIsLoadingCategoryDetails(true);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/${categoryId}/category/detail/`,
      );
      console.log("Category details fetched successfully:", response.data);
      setCategoryDetails(response.data);
      setIsLoadingCategoryDetails(false);
    } catch (error) {
      console.error("Error fetching category details:", error);
      setCategoryDetails(null);
      setIsLoadingCategoryDetails(false);
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    fetchSubcategoryDetails(subcategory.id);
    fetchSubcategoryProducts(subcategory.id);
    setIsDetailsModalOpen(true);
  };

  // Handle viewing category products
  const handleViewCategoryProducts = () => {
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory.id);
      setIsCategoryProductsModalOpen(true);
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

  // Category modal functions
  const openCategoryModal = (category = null) => {
    setIsCategoryModalOpen(true);
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
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategory(null);
    setFormError("");
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  const closeCategoryProductsModal = () => {
    setIsCategoryProductsModalOpen(false);
    setCategoryProducts([]);
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
      (cat) =>
        cat.name &&
        cat.name.toLowerCase() === categoryName.toLowerCase() &&
        cat.id !== editingCategory?.id,
    );

    if (isDuplicate) {
      setFormError("Category name must be unique!");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category via API
        const categoryData = {
          name: categoryName,
          description: categoryDescription,
        };

        await axios.put(
          `${apiBaseUrl}/${editingCategory.id}/category/update/`,
          categoryData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("Category updated successfully");

        // Refresh categories from API
        setRefreshData((prev) => prev + 1);
        showStatusMessage("Category updated successfully!");
      } else {
        // Create a new category via API
        const categoryData = {
          name: categoryName,
          description: categoryDescription,
        };

        const response = await axios.post(
          `${apiBaseUrl}/category/create/`,
          categoryData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("Category created successfully:", response.data);

        // Refresh categories from API
        setRefreshData((prev) => prev + 1);
        showStatusMessage("Category created successfully!");
      }
      closeCategoryModal();
    } catch (error) {
      console.error("Error creating/updating category:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to process category. Please try again.",
      );
    }
  };

  const deleteCategory = async (id) => {
    // Check if category has subcategories
    const hasSubcategories = subcategories.some(
      (sub) => sub.category_id === id,
    );

    if (hasSubcategories) {
      alert(
        "Cannot delete category that has subcategories. Please delete the subcategories first.",
      );
      return;
    }

    // Check if category has products
    try {
      const response = await axios.get(`${productApiBaseUrl}/products/`);
      const hasProducts = response.data.results.some(
        (product) => product.category_id === id,
      );

      if (hasProducts) {
        alert(
          "Cannot delete category that has products. Please remove or reassign the products first.",
        );
        return;
      }
    } catch (error) {
      console.error("Error checking for products:", error);
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // Delete category via API
        await axios.delete(`${apiBaseUrl}/${id}/category/delete/`);

        // Update local state
        setCategories(categories.filter((cat) => cat.id !== id));
        setSelectedCategory(null); // Reset selected category if it was deleted
        showStatusMessage("Category deleted successfully!", "warning");
      } catch (error) {
        console.error("Error deleting category:", error);
        showStatusMessage(
          "Failed to delete category. Please try again.",
          "error",
        );
      }
    }
  };

  // Subcategory modal functions
  const openSubcategoryModal = (categoryId, subcategory = null) => {
    setIsSubcategoryModalOpen(true);

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
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSubcategoryName("");
    setSubcategoryDescription("");
    setEditingSubcategory(null);
    setFormError("");
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

    const isDuplicate = subcategories.some(
      (sub) =>
        sub.name &&
        sub.name.toLowerCase() === subcategoryName.toLowerCase() &&
        sub.category_id === selectedCategory.id &&
        sub.id !== editingSubcategory?.id,
    );

    if (isDuplicate) {
      setFormError(
        "A subcategory with this name already exists in this category!",
      );
      return;
    }

    try {
      if (editingSubcategory) {
        // Update existing subcategory via API
        const subcategoryData = {
          name: subcategoryName,
          description: subcategoryDescription,
          category_id: selectedCategory.id,
        };

        const response = await axios.put(
          `${apiBaseUrl}/${editingSubcategory.id}/subcategory/update/`,
          subcategoryData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("Subcategory updated successfully:", response.data);

        // Update the subcategory in local state
        const updatedSubcategory = response.data;
        setSubcategories(
          subcategories.map((sub) =>
            sub.id === editingSubcategory.id ? updatedSubcategory : sub,
          ),
        );

        showStatusMessage("Subcategory updated successfully!");
      } else {
        // Create a new subcategory via API
        const subcategoryData = {
          name: subcategoryName,
          description: subcategoryDescription,
          category_id: selectedCategory.id,
        };

        const response = await axios.post(
          `${apiBaseUrl}/subcategory/create/`,
          subcategoryData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("Subcategory created successfully:", response.data);

        // Add the new subcategory to the local state
        const newSubcategory = response.data;
        setSubcategories([...subcategories, newSubcategory]);

        showStatusMessage("Subcategory created successfully!");
      }
      closeSubcategoryModal();
    } catch (error) {
      console.error("Error creating/updating subcategory:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to process subcategory. Please try again.",
      );
    }
  };

  const deleteSubcategory = async (id) => {
    // Check if subcategory has products
    try {
      const response = await axios.get(`${productApiBaseUrl}/products/`);
      const hasProducts = response.data.results.some(
        (product) => product.subcategory_id === id,
      );

      if (hasProducts) {
        alert(
          "Cannot delete subcategory that has products. Please remove or reassign the products first.",
        );
        return;
      }
    } catch (error) {
      console.error("Error checking for products:", error);
    }

    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        // Delete subcategory via API
        await axios.delete(`${apiBaseUrl}/${id}/subcategory/delete/`);

        // Update local state
        setSubcategories(subcategories.filter((sub) => sub.id !== id));
        showStatusMessage("Subcategory deleted successfully!", "warning");
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        showStatusMessage(
          "Failed to delete subcategory. Please try again.",
          "error",
        );
      }
    }
  };

  // Update the handleCategorySelect function to fetch category details
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchCategoryDetails(category.id);
    // Reset subcategory selection when changing categories
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  // Update the handleBackToCategories function to reset category details
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryDetails(null);
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    return `$${Number.parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="category-dashboard">
      {/* Status Message */}
      {statusMessage.show && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="category-sidebar">
        <div className="sidebar-headerr">
          <h2>Categories</h2>
          <button
            className="add-category-btn"
            onClick={() => openCategoryModal()}
          >
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="category-list">
          {isLoading ? (
            <div className="loading-indicator">Loading categories...</div>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${selectedCategory?.id === category.id ? "active" : ""}`}
              >
                <div
                  className="category-item-content"
                  onClick={() => handleCategorySelect(category)}
                >
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">
                    {
                      subcategories.filter(
                        (sub) => sub.category_id === category.id,
                      ).length
                    }{" "}
                    subcategories
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
          </div>
        ) : (
          <div className="selected-category-details">
            <div className="category-details-header">
              <button className="back-btn" onClick={handleBackToCategories}>
                <ArrowLeft size={16} /> Back to Categories
              </button>
              <div className="category-actions">
                <button
                  className="view-products-btn"
                  onClick={handleViewCategoryProducts}
                >
                  <ShoppingBag size={16} /> View Products
                </button>
                <button
                  className="edit-btn"
                  onClick={() => openCategoryModal(selectedCategory)}
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  className="add-subcategory-btn"
                  onClick={() => openSubcategoryModal(selectedCategory.id)}
                >
                  <Plus size={16} /> Add Subcategory
                </button>
              </div>
            </div>

            <div className="category-info">
              {isLoadingCategoryDetails ? (
                <div className="loading-indicator">
                  Loading category details...
                </div>
              ) : categoryDetails ? (
                <div className="category-details-container">
                  <h2>{categoryDetails.name}</h2>
                  <p className="category-description">
                    {categoryDetails.description}
                  </p>

                  <div className="category-meta-info">
                    <div className="category-meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">
                        {formatDate(categoryDetails.created_at)}
                      </span>
                    </div>
                    {categoryDetails.updated_at && (
                      <div className="category-meta-item">
                        <span className="meta-label">Last Updated:</span>
                        <span className="meta-value">
                          {formatDate(categoryDetails.updated_at)}
                        </span>
                      </div>
                    )}
                    <div className="category-meta-item">
                      <span className="meta-label">Subcategories:</span>
                      <span className="meta-value">
                        {
                          subcategories.filter(
                            (sub) => sub.category_id === selectedCategory.id,
                          ).length
                        }
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
              </div>

              <div className="subcategories-list">
                {subcategories
                  .filter((sub) => sub.category_id === selectedCategory.id)
                  .map((subcategory) => (
                    <div key={subcategory.id} className="subcategory-item">
                      <div
                        className="subcategory-info"
                        onClick={() => handleSubcategorySelect(subcategory)}
                      >
                        <h4>{subcategory.name}</h4>
                        <p>{subcategory.description}</p>
                        <button className="view-details-btn">
                          <Info size={14} /> View Details
                        </button>
                      </div>
                      <div className="subcategory-actions">
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSubcategoryModal(
                              selectedCategory.id,
                              subcategory,
                            );
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
                  ))}
                {subcategories.filter(
                  (sub) => sub.category_id === selectedCategory.id,
                ).length === 0 && (
                  <p className="no-subcategories">No subcategories found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
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
                  className={
                    formError && !categoryName.trim() ? "input-error" : ""
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-description">Description</label>
                <textarea
                  id="category-description"
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className={
                    formError && !categoryDescription.trim()
                      ? "input-error"
                      : ""
                  }
                  rows="3"
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
      {isSubcategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingSubcategory
                  ? "Edit Subcategory"
                  : "Add New Subcategory"}
              </h3>
              <button
                className="close-modal-btn"
                onClick={closeSubcategoryModal}
              >
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
                <input
                  type="text"
                  value={selectedCategory.name}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subcategory-name">Subcategory Name</label>
                <input
                  id="subcategory-name"
                  type="text"
                  placeholder="Enter subcategory name"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className={
                    formError && !subcategoryName.trim() ? "input-error" : ""
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="subcategory-description">Description</label>
                <textarea
                  id="subcategory-description"
                  placeholder="Enter subcategory description"
                  value={subcategoryDescription}
                  onChange={(e) => setSubcategoryDescription(e.target.value)}
                  className={
                    formError && !subcategoryDescription.trim()
                      ? "input-error"
                      : ""
                  }
                  rows="3"
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
      {isDetailsModalOpen && selectedSubcategory && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>Subcategory Details: {selectedSubcategory.name}</h3>
              <button className="close-modal-btn" onClick={closeDetailsModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {isLoadingDetails ? (
                <div className="loading-indicator">
                  Loading subcategory details...
                </div>
              ) : subcategoryDetails ? (
                <div className="subcategory-details-container">
                  <div className="details-section">
                    <h4>Basic Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">
                          {subcategoryDetails.name}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">
                          {subcategoryDetails.description}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">
                          {formatDate(subcategoryDetails.created_at)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Parent Category:</span>
                        <span className="detail-value">
                          {categories.find(
                            (cat) => cat.id === subcategoryDetails.category_id,
                          )?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4>Products in this Subcategory</h4>
                    {isLoadingProducts ? (
                      <div className="loading-indicator">
                        Loading products...
                      </div>
                    ) : subcategoryProducts.length > 0 ? (
                      <div className="subcategory-products">
                        {subcategoryProducts.map((product) => (
                          <div key={product.id} className="product-item">
                            <div className="product-image">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                              />
                            </div>
                            <div className="product-info">
                              <h5>{product.name}</h5>
                              <p className="product-description">
                                {product.description}
                              </p>
                              <div className="product-meta">
                                <span className="product-price">
                                  {formatPrice(product.unit_price)}
                                </span>
                                <span className="product-stock">
                                  Stock: {product.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-products">
                        No products found in this subcategory
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="error-message">
                  Failed to load subcategory details
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Products Modal */}
      {isCategoryProductsModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>Products in {selectedCategory.name}</h3>
              <button
                className="close-modal-btn"
                onClick={closeCategoryProductsModal}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {isLoadingCategoryProducts ? (
                <div className="loading-indicator">
                  Loading category products...
                </div>
              ) : categoryProducts.length > 0 ? (
                <div className="category-products-container">
                  <div className="category-products-grid">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="product-card">
                        <div className="product-card-image">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                          />
                          {product.on_promotion && (
                            <span className="promotion-tag">On Sale</span>
                          )}
                        </div>
                        <div className="product-card-content">
                          <h4 className="product-card-title">{product.name}</h4>
                          <p className="product-card-description">
                            {product.description}
                          </p>
                          <div className="product-card-details">
                            <div className="product-card-price">
                              {product.on_promotion ? (
                                <>
                                  <span className="original-price">
                                    {formatPrice(product.unit_price)}
                                  </span>
                                  <span className="sale-price">
                                    {formatPrice(product.promo_price)}
                                  </span>
                                </>
                              ) : (
                                <span>{formatPrice(product.unit_price)}</span>
                              )}
                            </div>
                            <div className="product-card-stock">
                              <span
                                className={`stock-indicator ${product.quantity > 0 ? "in-stock" : "out-of-stock"}`}
                              >
                                {product.quantity > 0
                                  ? `${product.quantity} in stock`
                                  : "Out of stock"}
                              </span>
                            </div>
                          </div>
                          <div className="product-card-subcategory">
                            {product.subcategory_id ? (
                              <span>
                                {subcategories.find(
                                  (sub) => sub.id === product.subcategory_id,
                                )?.name || "Unknown subcategory"}
                              </span>
                            ) : (
                              <span>No subcategory</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-products-message">
                  <Package size={48} />
                  <p>No products found in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
