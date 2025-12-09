import { NavLink, Outlet } from "react-router-dom";
import { User, Lock } from "lucide-react";
import "./Profile.css";

function ProfileLayout() {
  return (
    <div className="profile-layout">
      <div className="profile-sidebar">
        <h2>Profile Settings</h2>
        <nav className="profile-nav">
          <NavLink
            to="/profile/info"
            className={({ isActive }) => `profile-nav-link ${isActive ? "active" : ""}`}
          >
            <User size={18} />
            <span>Profile Info</span>
          </NavLink>
          <NavLink
            to="/profile/change-password"
            className={({ isActive }) => `profile-nav-link ${isActive ? "active" : ""}`}
          >
            <Lock size={18} />
            <span>Change Password</span>
          </NavLink>
        </nav>
      </div>
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
}

export default ProfileLayout;
