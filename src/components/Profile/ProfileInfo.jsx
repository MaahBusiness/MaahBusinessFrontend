import { useState } from "react";
import "./Profile.css";

const ProfileInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "John Paul",
    email: "johnpaul@example.com",
    number: "+237 677 977 899",
    role: "Admin",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handle save changes
  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Here, you could send the updated user data to an API or database
    console.log("Profile updated:", user);
  };

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

        {isEditing ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="number">Phone Number</label>
              <input
                type="text"
                id="number"
                name="number"
                value={user.number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={user.role}
                onChange={handleChange}
                required
                disabled
                className="input-disabled"
              />
              <small>Role cannot be changed</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                Save Changes
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
          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{user.name}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{user.number}</span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">Role</span>
              <span className="detail-value role-badge">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
