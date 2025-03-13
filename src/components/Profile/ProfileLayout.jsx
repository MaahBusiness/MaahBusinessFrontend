import { Link, Outlet, useLocation } from "react-router-dom";
import "./Profile.css";

const ProfileLayout = () => {
  const location = useLocation();

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="profile-layout">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <p className="profile-subtitle">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="profile-wrapper">
        <nav className="profile-nav">
          <Link
            to="info"
            className={`profile-nav-link ${isActive("info") ? "active" : ""}`}
          >
            Profile Information
          </Link>
          <Link
            to="change-password"
            className={`profile-nav-link ${isActive("change-password") ? "active" : ""}`}
          >
            Change Password
          </Link>
        </nav>

        <div className="profile-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
