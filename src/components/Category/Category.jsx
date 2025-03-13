import { useState } from "react";
import "./category.css";

const Category = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", description: "Devices and gadgets" },
    { id: 2, name: "Clothing", description: "Men and Women fashion" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (category = null) => {
    setIsModalOpen(true);
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description);
    } else {
      setIsEditing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryName("");
    setCategoryDescription("");
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const addOrUpdateCategory = () => {
    if (categoryName.trim() && categoryDescription.trim()) {
      const isDuplicate = categories.some(
        (cat) =>
          cat.name.toLowerCase() === categoryName.toLowerCase() &&
          cat.id !== selectedCategory?.id,
      );
      if (isDuplicate) {
        alert("Category name must be unique!");
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
          id: categories.length + 1,
          name: categoryName,
          description: categoryDescription,
        };
        setCategories([...categories, newCategory]);
      }
      closeModal();
    }
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <h2 className="category-title">Category Manager</h2>
        <button className="category-open-modal-btn" onClick={() => openModal()}>
          + Add Category
        </button>
      </div>

      {isModalOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal">
            <h2>{isEditing ? "Edit Category" : "Create New Category"}</h2>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <textarea
              placeholder="Category Description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
            ></textarea>
            <div className="category-modal-buttons">
              <button className="Edit" onClick={addOrUpdateCategory}>
                {isEditing ? "Update" : "Create"}
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="category-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <div className="category-card-buttons">
              <button className="Edit" onClick={() => openModal(category)}>
                Edit
              </button>
              <button
                className="dlt"
                onClick={() => deleteCategory(category.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
