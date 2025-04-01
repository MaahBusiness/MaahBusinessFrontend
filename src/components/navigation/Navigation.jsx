import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBell, FaSignOutAlt } from "react-icons/fa";
import "./Navigation.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      setIsLoggedIn(!!token);
      setUsername(storedUsername || "");
    };

    // Initial check
    checkAuthStatus();

    // Listen for storage events (in case token is added/removed in another tab)
    window.addEventListener("storage", checkAuthStatus);

    // Fetch notification count from API
    const fetchNotifications = async () => {
      try {
        if (isLoggedIn) {
          setNotificationCount();
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, [isLoggedIn]);

  // Function to handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setNotificationCount(0);
    navigate("/login");
  }, [navigate]);

  return (
    <nav className="navbar">
      <div className="nav-brand"></div>

      <div className="nav-content">
        <ul>
          {!isLoggedIn && (
            // Show these links only when user is NOT logged in
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup" className="signup-link">
                  Sign Up
                </Link>
              </li>
            </>
          )}

          {/* Notification icon - visible only when logged in */}
          {isLoggedIn && (
            <li className="notification-icon">
              <Link to="/notifications">
                <div className="notification-container">
                  <FaBell size={24} title="Notifications" />
                  {notificationCount > 0 && (
                    <span className="notification-badge">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )}

          {/* Profile icon - changes behavior based on login status */}
          <li className="profile-icon">
            {isLoggedIn ? (
              <Link to="/profile/info" title={`Profile: ${username}`}>
                <FaUserCircle size={28} />
              </Link>
            ) : (
              <Link to="/login" title="Sign in to view profile">
                <FaUserCircle size={28} />
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
