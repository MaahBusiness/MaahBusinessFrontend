import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navigation.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Stock Manager</Link>
      </div>
      <div className="nav-content">
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </li>
          <li className="profile-icon">
            <Link to="/profile/info">
              <FaUserCircle size={28} title="Profile" />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
