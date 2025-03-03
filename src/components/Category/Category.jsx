import { useState } from "react";
import "./category.css";

const Category = () => {
  // Static category data
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", description: "Devices and gadgets" },
    { id: 2, name: "Clothing", description: "Men and Women fashion" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryName("");
    setCategoryDescription("");
  };
  const addCategory = () => {
    if (categoryName.trim() && categoryDescription.trim()) {
      const newCategory = {
        id: categories.length + 1,
        name: categoryName,
        description: categoryDescription,
      };
      setCategories([...categories, newCategory]);
      closeModal();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Category Manager</h2>
        <button className="open-modal-btn" onClick={openModal}>
          + Add Category
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Category</h2>
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
            <div className="modal-buttons">
              <button className="create-btn" onClick={addCategory}>
                Create
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${selectedCategory?.id === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
