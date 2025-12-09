import { useState, useEffect } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { useForm } from "../../hooks";
import { authService } from "../../services";
import type { User, FormErrors } from "../../types";
import type { AuthLoaderData } from "../../loaders";
import "./Profile.css";

interface ProfileFormValues {
  username: string;
  email: string;
  phone_number: string;
}

function ProfileInfo() {
  const navigate = useNavigate();
  const notification = useNotification();
  const loaderData = useLoaderData() as AuthLoaderData;
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(loaderData?.user || null);

  const { values, errors, isSubmitting, handleChange, handleSubmit, resetTo } = useForm<ProfileFormValues>({
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    },
    onSubmit: async (formValues) => {
      const updatedUser = await authService.updateUser({
        username: formValues.username,
        email: formValues.email,
        phone_number: formValues.phone_number,
      });
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      notification.success("Profile updated successfully!");
      setIsEditing(false);
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      resetTo({
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user, resetTo]);

  const handleCancel = () => {
    resetTo({
      username: user?.username || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with logout even if API fails
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("notificationCount");
    notification.info("You have been logged out");
    navigate("/login");
  };

  return (
    <div className="profile-info-container">
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>User Profile</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="profile-edit-button">
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">USERNAME</label>
              <input
                type="text"
                id="username"
                name="username"
                value={values.username}
                onChange={handleChange}
                required
                className={errors.username ? "input-error" : ""}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                required
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">PHONE NUMBER</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={values.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={handleCancel} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-label">USERNAME</span>
              <span className="detail-value">{user?.username || "Not set"}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">EMAIL</span>
              <span className="detail-value">{user?.email || "Not set"}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">PHONE NUMBER</span>
              <span className="detail-value">{user?.phone_number || "Not set"}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">ROLE</span>
              <span className="detail-value role-badge">{user?.role || "Not set"}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">ACCOUNT STATUS</span>
              <span className={`detail-value status-badge ${user?.is_active ? "active" : "inactive"}`}>
                {user?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="logout">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileInfo;
