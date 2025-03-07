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
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (subcategory = null) => {
    setIsModalOpen(true);
    if (subcategory) {
      setIsEditing(true);
      setSelectedSubcategory(subcategory);
      setSubcategoryName(subcategory.name);
      setSubcategoryDescription(subcategory.description);
      setMainCategory(subcategory.category);
    } else {
      setIsEditing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubcategoryName("");
    setSubcategoryDescription("");
    setMainCategory(""); // Ensures category field is reset after closing modal
    setSelectedSubcategory(null);
    setIsEditing(false);
  };

  const addOrUpdateSubcategory = () => {
    if (
      !subcategoryName.trim() ||
      !subcategoryDescription.trim() ||
      !mainCategory.trim()
    )
      return;

    // Logging input values to debug
    console.log(
      "Adding/Updating subcategory:",
      subcategoryName,
      subcategoryDescription,
      mainCategory,
    );

    const isDuplicate = subcategories.some(
      (sub) =>
        sub.name.toLowerCase() === subcategoryName.toLowerCase() &&
        sub.id !== selectedSubcategory?.id,
    );
    if (isDuplicate) {
      alert("Subcategory name must be unique!");
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
                category: mainCategory,
              }
            : sub,
        ),
      );
    } else {
      const newSubcategory = {
        id: subcategories.length + 1,
        name: subcategoryName,
        description: subcategoryDescription,
        category: mainCategory,
      };
      setSubcategories([...subcategories, newSubcategory]);
    }
    closeModal();
  };

  const deleteSubcategory = (id) => {
    setSubcategories(subcategories.filter((sub) => sub.id !== id));
  };

  return (
    <div className="subcategory-container">
      <div className="subcategory-header">
        <h2 className="subcategory-title">Subcategory Manager</h2>
        <button
          className="subcategory-open-modal-btn"
          onClick={() => openModal()}
        >
          + Add Subcategory
        </button>
      </div>

      {isModalOpen && (
        <div className="subcategory-modal-overlay">
          <div className="subcategory-modal">
            <h2>{isEditing ? "Edit Subcategory" : "Create Subcategory"}</h2>
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
            <button className="" onClick={addOrUpdateSubcategory}>
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="subcategory-grid">
        {subcategories.map((subcategory) => (
          <div key={subcategory.id} className="subcategory-card">
            <h3>{subcategory.name}</h3>
            <p>{subcategory.description}</p>
            <p>Category: {subcategory.category}</p>
            <button className="Edit" onClick={() => openModal(subcategory)}>
              Edit
            </button>
            <button
              className="dlt"
              onClick={() => deleteSubcategory(subcategory.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subcategory;
