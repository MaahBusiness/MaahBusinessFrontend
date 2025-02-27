import { useState, useEffect } from "react";
import "./productDetail.css";

const ProductDetail = ({ productData, onDelete }) => {
  const sampleProduct = {
    image: "https://via.placeholder.com/150",
    name: "Gaming Laptop",
    description:
      "High-performance gaming laptop with a powerful GPU and fast processor.",
    unit_price: 120000,
    quantity: 20,
    min_quantity: 1,
    expiry_date: "2025-12-31",
    is_expired: false,
    on_promotion: true,
    promo_price: 100000,
    promotion_start_date: "2025-01-01",
    promotion_end_date: "2025-06-30",
    category_id: "123",
    subcategory_id: "456",
  };

  const [product, setProduct] = useState(sampleProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!productData) {
      fetch("/api/product")
        .then((response) => response.json())
        .then((data) => setProduct(data));
    }
  }, [productData]);

  // Handle editing the product fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  // Toggle editing state
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setEditedProduct(product);
  };

  // Save the edited product
  const handleSave = () => {
    setProduct(editedProduct);
    setIsEditing(false);
  };

  // Show delete confirmation modal
  const handleDeleteClick = () => {
    setShowModal(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    setShowModal(false);
    if (onDelete) {
      onDelete(product.id); // Assuming the product has an 'id' field
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowModal(false);
  };

  return (
    <div className="product-card">
      {product ? (
        <div className="card">
          <img src={product.image} alt={product.name} />
          <div className="card-details">
            <h2>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedProduct.name}
                  onChange={handleEditChange}
                />
              ) : (
                product.name
              )}
            </h2>

            <p>
              <strong>Description:</strong>{" "}
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedProduct.description}
                  onChange={handleEditChange}
                />
              ) : (
                product.description
              )}
            </p>

            <p>
              <strong>Price:</strong>{" "}
              {isEditing ? (
                <input
                  type="number"
                  name="unit_price"
                  value={editedProduct.unit_price}
                  onChange={handleEditChange}
                />
              ) : (
                product.unit_price
              )}{" "}
              XFA
            </p>

            <p>
              <strong>Quantity:</strong>{" "}
              {isEditing ? (
                <input
                  type="number"
                  name="quantity"
                  value={editedProduct.quantity}
                  onChange={handleEditChange}
                />
              ) : (
                product.quantity
              )}
            </p>

            <p>
              <strong>Min Quantity:</strong>{" "}
              {isEditing ? (
                <input
                  type="number"
                  name="min_quantity"
                  value={editedProduct.min_quantity}
                  onChange={handleEditChange}
                />
              ) : (
                product.min_quantity
              )}
            </p>

            <p>
              <strong>Expiry Date:</strong>{" "}
              {isEditing ? (
                <input
                  type="date"
                  name="expiry_date"
                  value={editedProduct.expiry_date}
                  onChange={handleEditChange}
                />
              ) : (
                product.expiry_date
              )}
            </p>

            <p>
              <strong>Is Expired:</strong>{" "}
              {isEditing ? (
                <select
                  name="is_expired"
                  value={editedProduct.is_expired}
                  onChange={handleEditChange}
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              ) : product.is_expired ? (
                "Yes"
              ) : (
                "No"
              )}
            </p>

            <p>
              <strong>On Promotion:</strong>{" "}
              {isEditing ? (
                <select
                  name="on_promotion"
                  value={editedProduct.on_promotion}
                  onChange={handleEditChange}
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              ) : product.on_promotion ? (
                "Yes"
              ) : (
                "No"
              )}
            </p>

            {product.on_promotion && (
              <>
                <p>
                  <strong>Promotion Price:</strong>{" "}
                  {isEditing ? (
                    <input
                      type="number"
                      name="promo_price"
                      value={editedProduct.promo_price}
                      onChange={handleEditChange}
                    />
                  ) : (
                    product.promo_price
                  )}{" "}
                  XFA
                </p>

                <p>
                  <strong>Promotion Start Date:</strong>{" "}
                  {isEditing ? (
                    <input
                      type="date"
                      name="promotion_start_date"
                      value={editedProduct.promotion_start_date}
                      onChange={handleEditChange}
                    />
                  ) : (
                    product.promotion_start_date
                  )}
                </p>

                <p>
                  <strong>Promotion End Date:</strong>{" "}
                  {isEditing ? (
                    <input
                      type="date"
                      name="promotion_end_date"
                      value={editedProduct.promotion_end_date}
                      onChange={handleEditChange}
                    />
                  ) : (
                    product.promotion_end_date
                  )}
                </p>
              </>
            )}

            <p>
              <strong>Category ID:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="category_id"
                  value={editedProduct.category_id}
                  onChange={handleEditChange}
                />
              ) : (
                product.category_id
              )}
            </p>

            <p>
              <strong>Subcategory ID:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="subcategory_id"
                  value={editedProduct.subcategory_id}
                  onChange={handleEditChange}
                />
              ) : (
                product.subcategory_id
              )}
            </p>

            <div className="buttons">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="edit">
                    Save
                  </button>
                  <button onClick={toggleEdit} className="delete">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={toggleEdit} className="edit">
                    Edit
                  </button>
                  <button onClick={handleDeleteClick} className="delete">
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading product details...</p>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this product?</p>
            <button onClick={confirmDelete} className="confirm">
              Yes, Delete
            </button>
            <button onClick={cancelDelete} className="cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
