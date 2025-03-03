import React, { useState } from "react";
import "./Profile.css";

const ProfileInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "John paul",
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

  // Handle save changes (simulating saving)
  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Here, you could send the updated user data to an API or database
    console.log("Profile updated:", user);
  };

  return (
    <div className="profile-container">
      <div className="profile-info">
        <h2>User Profile</h2>

        {isEditing ? (
          <form onSubmit={handleSave} className="profile-edit-form">
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Phone Number:</label>
              <input
                type="text"
                name="number"
                value={user.number}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Role:</label>
              <input
                type="text"
                name="role"
                value={user.role}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone Number:</strong> {user.number}
            </p>
            <p className="role">
              <strong>Role:</strong> {user.role}
            </p>
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
