import { useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import { useForm } from "../../hooks";
import { authService } from "../../services";
import type { FormErrors } from "../../types";
import "./Profile.css";

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const validatePassword = (values: ChangePasswordValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

function ChangePassword() {
  const notification = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { values, errors, isSubmitting, submitError, handleChange, handleSubmit, reset } = useForm<ChangePasswordValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: validatePassword,
    onSubmit: async (formValues) => {
      try {
        await authService.updateUser({
          current_password: formValues.currentPassword,
          new_password: formValues.newPassword,
        });
        notification.success("Password updated successfully!");
        reset();
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { current_password?: string } }; message?: string };
        const errorMsg = axiosError.response?.data?.current_password || axiosError.message || "Failed to update password";
        setModalMessage(errorMsg);
        setShowModal(true);
        throw error;
      }
    },
  });

  return (
    <div className="password-container">
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Change Password</h3>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Enter your current password"
              value={values.currentPassword}
              onChange={handleChange}
              className={errors.currentPassword ? "input-error" : ""}
              disabled={isSubmitting}
            />
            {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              value={values.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? "input-error" : ""}
              disabled={isSubmitting}
            />
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={values.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="profile-modal">
          <div className="profile-modal-content error">
            <h3>{modalMessage}</h3>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangePassword;
