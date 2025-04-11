"use client";

import { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const ProfileInfo = () => {
  // State to manage user information and page state
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    id: "",
    username: "",
    email: "",
    phone_number: "",
    role: "",
    is_active: false,
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      // Get token from localStorage (stored during signup/login)
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // First check if we have cached user data from signup
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          // Use cached data temporarily while we fetch the latest
          setUser(userData);
          setOriginalUser(userData);
        }

        // Fetch latest user information from API using the token from signup/login
        const response = await fetch(
          "http://localhost:8000/api/v1/user-info/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Handle response
        if (!response.ok) {
          const errorData = await response.json();

          // Check for token invalid error
          if (
            errorData.error &&
            errorData.error.includes("Token is invalid or expired")
          ) {
            // Clear invalid token and user data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            throw new Error("Your session has expired. Please log in again.");
          }

          throw new Error(errorData.detail || "Failed to fetch user data");
        }

        // Parse user data
        const userData = await response.json();

        // Update user state with fetched data
        setUser(userData);
        setOriginalUser(userData);

        // Update cached user data
        localStorage.setItem("user", JSON.stringify(userData));

        setErrorMessage("");
      } catch (error) {
        // Handle errors
        setErrorMessage(error.message);

        // If unauthorized or token expired, redirect to login
        if (
          error.message.includes("Unauthorized") ||
          error.message.includes("session has expired") ||
          error.message.includes("Token is invalid or expired")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        // Set loading to false
        setIsLoading(false);
      }
    };

    // Call fetch function
    fetchUserData();
  }, [navigate]);

  // Handle input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handle save profile changes
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Get token from localStorage (could be from signup or login)
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/update-user/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Check for token invalid error
        if (data.error && data.error.includes("Token is invalid or expired")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("Your session has expired. Please log in again.");
        }

        // Handle other validation errors from server
        let errorMsg = "Failed to update profile";
        if (data.detail) {
          errorMsg = data.detail;
        } else if (data.errors) {
          errorMsg = Object.values(data.errors).join(", ");
        }
        throw new Error(errorMsg);
      }

      // Update state with new data
      setUser(data);
      setOriginalUser(data);

      // Update cached user data
      localStorage.setItem("user", JSON.stringify(data));

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Update error:", error);
      setErrorMessage(
        error.message || "Failed to update profile. Please check your inputs.",
      );

      // Don't revert to original user if we're redirecting
      if (!error.message.includes("session has expired")) {
        setUser(originalUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    // Revert to original user data
    setUser(originalUser);
    setIsEditing(false);
  };

  // Logout handler
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/api/v1/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Even if logout fails, we'll still remove the token and navigate
      if (!response.ok) {
        console.error("Logout failed on server");
      }
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      // Always remove token and user data, then navigate to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // Render loading state
  if (isLoading && !user.username) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-info-container">
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>User Profile</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="profile-edit-button"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Success message display */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {/* Error message display */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Editing form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">USERNAME</label>
              <input
                type="text"
                id="username"
                name="username"
                value={user.username || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">PHONE NUMBER</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={user.phone_number || ""}
                onChange={handleChange}
              />
            </div>

            {/* Save and Cancel buttons */}
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // Profile details view
          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-label">USERNAME</span>
              <span className="detail-value">{user.username || "Not set"}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">EMAIL</span>
              <span className="detail-value">{user.email || "Not set"}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">PHONE NUMBER</span>
              <span className="detail-value">
                {user.phone_number || "Not set"}
              </span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">ROLE</span>
              <span className="detail-value role-badge">
                {user.role || "Not set"}
              </span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">ACCOUNT STATUS</span>
              <span
                className={`detail-value status-badge ${user.is_active ? "active" : "inactive"}`}
              >
                {user.is_active ? "Active" : "Inactive"}
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
};

export default ProfileInfo;
