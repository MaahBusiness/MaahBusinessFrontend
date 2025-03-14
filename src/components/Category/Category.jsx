"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./category.css";

const Category = () => {
  // Categories state
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", description: "Devices and gadgets" },
    { id: 2, name: "Clothing", description: "Men and Women fashion" },
  ]);

  // Subcategories state
  const [subcategories, setSubcategories] = useState([
    {
      id: 1,
      name: "Smartphones",
      description: "Mobile phones and accessories",
      categoryId: 1,
    },
    {
      id: 2,
      name: "Laptops",
      description: "Portable computers",
      categoryId: 1,
    },
    {
      id: 3,
      name: "Men's Wear",
      description: "Clothing for men",
      categoryId: 2,
    },
    {
      id: 4,
      name: "Women's Wear",
      description: "Clothing for women",
      categoryId: 2,
    },
  ]);

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState({});

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [parentCategoryId, setParentCategoryId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");

  // Category modal functions
  const openCategoryModal = (category = null) => {
    setIsCategoryModalOpen(true);
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description);
    } else {
      setIsEditing(false);
      setCategoryName("");
      setCategoryDescription("");
    }
    setFormError("");
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryName("");
    setCategoryDescription("");
    setSelectedCategory(null);
    setIsEditing(false);
    setFormError("");
  };

  const addOrUpdateCategory = () => {
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
        cat.name.toLowerCase() === categoryName.toLowerCase() &&
        cat.id !== selectedCategory?.id,
    );

    if (isDuplicate) {
      setFormError("Category name must be unique!");
      return;
    }

    if (isEditing) {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, name: categoryName, description: categoryDescription }
            : cat,
        ),
      );
    } else {
      const newCategory = {
        id:
          categories.length > 0
            ? Math.max(...categories.map((c) => c.id)) + 1
            : 1,
        name: categoryName,
        description: categoryDescription,
      };
      setCategories([...categories, newCategory]);

      // Auto-expand the new category
      setExpandedCategories((prev) => ({
        ...prev,
        [newCategory.id]: true,
      }));
    }
    closeCategoryModal();
  };

  const deleteCategory = (id) => {
    // Check if category has subcategories
    const hasSubcategories = subcategories.some((sub) => sub.categoryId === id);

    if (hasSubcategories) {
      alert(
        "Cannot delete category that has subcategories. Please delete the subcategories first.",
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  // Subcategory modal functions
  const openSubcategoryModal = (categoryId, subcategory = null) => {
    setIsSubcategoryModalOpen(true);
    setParentCategoryId(categoryId);

    if (subcategory) {
      setIsEditing(true);
      setSelectedSubcategory(subcategory);
      setSubcategoryName(subcategory.name);
      setSubcategoryDescription(subcategory.description);
    } else {
      setIsEditing(false);
      setSubcategoryName("");
      setSubcategoryDescription("");
    }
    setFormError("");
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSubcategoryName("");
    setSubcategoryDescription("");
    setParentCategoryId(null);
    setSelectedSubcategory(null);
    setIsEditing(false);
    setFormError("");
  };

  const addOrUpdateSubcategory = () => {
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
        sub.name.toLowerCase() === subcategoryName.toLowerCase() &&
        sub.id !== selectedSubcategory?.id,
    );

    if (isDuplicate) {
      setFormError("Subcategory name must be unique!");
      return;
    }

    if (isEditing) {
      setSubcategories(
        subcategories.map((sub) =>
          sub.id === selectedSubcategory.id
            ? {
                ...sub,
                name: subcategoryName,
                description: subcategoryDescription,
              }
            : sub,
        ),
      );
    } else {
      const newSubcategory = {
        id:
          subcategories.length > 0
            ? Math.max(...subcategories.map((s) => s.id)) + 1
            : 1,
        name: subcategoryName,
        description: subcategoryDescription,
        categoryId: parentCategoryId,
      };
      setSubcategories([...subcategories, newSubcategory]);
    }
    closeSubcategoryModal();
  };

  const deleteSubcategory = (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      setSubcategories(subcategories.filter((sub) => sub.id !== id));
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Add this helper function to get subcategory count
  const getSubcategoryCount = (categoryId) => {
    return subcategories.filter((sub) => sub.categoryId === categoryId).length;
  };

  return (
    <div className="category-manager-container">
      <div className="category-manager-header">
        <h2>Category Management</h2>
        <button className="add-button" onClick={() => openCategoryModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>
              No categories found. Create your first category to get started.
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const categorySubcategories = subcategories.filter(
              (sub) => sub.categoryId === category.id,
            );
            const isExpanded = expandedCategories[category.id];

            // Update the category card rendering to include the required indicator
            return (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-title-wrapper">
                      <h3 className="category-title">{category.name}</h3>
                    </div>
                    <p className="category-description">
                      {category.description}
                    </p>
                  </div>
                  <div className="category-actions">
                    <button
                      className="expand-btn"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => openCategoryModal(category)}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="subcategories-section">
                    <div className="subcategories-header">
                      <div className="subcategories-title-wrapper">
                        <h4>Subcategories</h4>
                        <span className="optional-badge">
                          Optional for products
                        </span>
                      </div>
                      <button
                        className="add-subcategory-btn"
                        onClick={() => openSubcategoryModal(category.id)}
                      >
                        <Plus size={16} /> Add Subcategory
                      </button>
                    </div>

                    {categorySubcategories.length === 0 ? (
                      <div className="subcategory-empty-state">
                        <p>No subcategories found for this category.</p>
                      </div>
                    ) : (
                      <div className="subcategories-list">
                        {categorySubcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="subcategory-item"
                          >
                            <div className="subcategory-info">
                              <h5 className="subcategory-name">
                                {subcategory.name}
                              </h5>
                              <p className="subcategory-description">
                                {subcategory.description}
                              </p>
                            </div>
                            <div className="subcategory-actions">
                              <button
                                className="subcategory-btn edit"
                                onClick={() =>
                                  openSubcategoryModal(category.id, subcategory)
                                }
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="subcategory-btn delete"
                                onClick={() =>
                                  deleteSubcategory(subcategory.id)
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
              <button className="close-modal-btn" onClick={closeCategoryModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}

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
                {isEditing ? (
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
              <h3>{isEditing ? "Edit Subcategory" : "Add New Subcategory"}</h3>
              <button
                className="close-modal-btn"
                onClick={closeSubcategoryModal}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}

              <div className="form-group">
                <label>Parent Category</label>
                <input
                  type="text"
                  value={getCategoryName(parentCategoryId)}
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
                {isEditing ? (
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
    </div>
  );
};

export default Category;
