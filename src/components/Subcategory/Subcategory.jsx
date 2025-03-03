import { useState } from "react";
import "./subcategory.css";

const Subcategory = () => {
  const [subcategories, setSubcategories] = useState([
    {
      id: 1,
      name: "Electronics",
      description: "Devices and gadgets",
      category: "Electronics",
    },
    {
      id: 2,
      name: "Clothing",
      description: "Men and Women fashion",
      category: "Clothing",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addCategory = () => {
    if (
      !subcategoryName.trim() ||
      !subcategoryDescription.trim() ||
      !mainCategory.trim()
    )
      return;

    const newSubcategory = {
      id: subcategories.length + 1,
      name: subcategoryName,
      description: subcategoryDescription,
      category: mainCategory,
    };

    setSubcategories([...subcategories, newSubcategory]);
    setSubcategoryName("");
    setSubcategoryDescription("");
    setMainCategory("");
    closeModal();
  };

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Subcategory</h2>
        <button className="open-modal-btn-sub" onClick={openModal}>
          + Add Subcategory
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Subcategory</h2>
            <input
              type="text"
              placeholder="Subcategory Name"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
            />
            <textarea
              placeholder="Subcategory Description"
              value={subcategoryDescription}
              onChange={(e) => setSubcategoryDescription(e.target.value)}
            ></textarea>
            <input
              type="text"
              placeholder="Category"
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value)}
            />
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
        {subcategories.map((subcategory) => (
          <div
            key={subcategory.id}
            className={`subcategory-card  ${
              selectedCategory?.id === subcategory.id ? "lable_Ctg" : ""
            }`}
            onClick={() => setSelectedCategory(subcategory)}
          >
            <h3>{subcategory.name}</h3>
            <p>{subcategory.description}</p>
            <p className="ctt">
              <span className="lable_Ctg">Category:</span>{" "}
              {subcategory.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subcategory;
