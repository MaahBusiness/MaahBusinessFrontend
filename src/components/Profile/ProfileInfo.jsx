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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      // Get token from local storage
      const token = localStorage.getItem("token");

      // Redirect to login if no token
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Fetch user information
        const response = await fetch(
          "http://localhost:8000/api/v1/user-info/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Corrected Bearer token
            },
          },
        );

        // Handle response
        if (!response.ok) {
          // Throw error if response is not successful
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch user data");
        }

        // Parse user data
        const userData = await response.json();

        // Update user state with fetched data
        setUser(userData);
        setErrorMessage("");
      } catch (error) {
        // Handle errors
        setErrorMessage(error.message);

        // If unauthorized, remove token and redirect to login
        if (error.message.includes("Unauthorized")) {
          localStorage.removeItem("token");
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

    // Get token from local storage
    const token = localStorage.getItem("token");

    try {
      // Send update request
      const response = await fetch(
        "http://localhost:8000/api/v1/user/update/",
        {
          method: "PUT",
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

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      // Exit editing mode
      setIsEditing(false);
      setErrorMessage("");
    } catch (error) {
      // Handle errors
      setErrorMessage(error.message);
    } finally {
      // Set loading to false
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Render loading state
  if (isLoading) {
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

        {/* Error message display */}
        {errorMessage && <p className="error">{errorMessage}</p>}

        {/* Editing form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="profile-form">
            {/* Dynamically render input fields */}
            {Object.entries(user)
              .filter(([key]) => !["id", "is_active", "password"].includes(key))
              .map(([key, value]) => (
                <div key={key} className="form-group">
                  <label htmlFor={key}>
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    required
                    disabled={key === "role"}
                  />
                  {key === "role" && <small>Role cannot be changed</small>}
                </div>
              ))}

            {/* Save and Cancel buttons */}
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // Profile details view
          <div className="profile-details">
            {Object.entries(user)
              .filter(([key]) => !["id", "is_active", "password"].includes(key))
              .map(([key, value]) => (
                <div key={key} className="profile-detail-item">
                  <span className="detail-label">
                    {key.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className={`detail-value ${key === "role" ? "role-badge" : ""}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="logout">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
