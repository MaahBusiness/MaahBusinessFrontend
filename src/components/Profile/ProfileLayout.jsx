import { Link, Outlet } from "react-router-dom";
import "./Profile.css";

const ProfileLayout = () => {
  return (
    <div className="profile-container">
      <h2>Profile Settings</h2>
      <nav className="profile-nav">
        <Link to="info">Profile Info</Link>
        <Link to="change-password">Change Password</Link>
      </nav>
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
