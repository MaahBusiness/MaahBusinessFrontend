"use client";

import { useState, useEffect } from "react";
import "./Profile.css";
import { API_URL } from "../../utils";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      //navigate("/login") // Removed navigate as it's not defined and we're in a client component
      console.warn("User not logged in. Redirect to login page."); // Placeholder for redirection
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Clear success message when user starts typing again
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to change your password");
      }

      const response = await fetch(`${API_URL}/update-user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to update password";
        if (data.detail) {
          errorMsg = data.detail;
        } else if (data.errors) {
          errorMsg = Object.values(data.errors).join(", ");
        } else if (data.current_password) {
          errorMsg = data.current_password;
        }
        throw new Error(errorMsg);
      }

      // Show success message in the form
      setSuccessMessage("Password updated successfully!");

      // Clear form fields
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setModalType("error");
      setModalMessage(
        error.message || "Failed to update password. Please try again.",
      );
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="password-container">
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Change Password</h3>
        </div>

        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onChange={handleChange}
              className={errors.currentPassword ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="profile-modal">
          <div className={`profile-modal-content ${modalType}`}>
            <h3>{modalMessage}</h3>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
