import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { notificationService } from "../../services";
import "./Navigation.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [username, setUsername] = useState("");
  const location = useLocation();

  // Function to fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      if (isLoggedIn) {
        // First try to get from localStorage (set by Notification component)
        const storedCount = localStorage.getItem("notificationCount");
        if (storedCount !== null) {
          setNotificationCount(Number.parseInt(storedCount, 10));
          return;
        }

        // Fallback to API if needed
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await notificationService.getNotifications("UNREAD");
        const unreadCount = data.count || data.results?.length || 0;
        setNotificationCount(unreadCount);
        localStorage.setItem("notificationCount", unreadCount.toString());
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isLoggedIn]);

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUsername(user.username || "");
        } catch {
          setUsername("");
        }
      }
    };

    const handleStorageChange = () => {
      checkAuthStatus();
      fetchNotificationCount();
    };

    // Initial check
    checkAuthStatus();
    fetchNotificationCount();

    // Listen for storage events (in case token is added/removed in another tab)
    window.addEventListener("storage", handleStorageChange);

    // Also poll for notifications periodically when logged in
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoggedIn) {
      interval = setInterval(fetchNotificationCount, 60000); // Check every minute
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn, fetchNotificationCount]);

  // Check if we're on the notification page
  const isNotificationPage = location.pathname === "/Notification";

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
            <>
              <li
                className={`notification ${isNotificationPage ? "active" : ""}`}
              >
                <Link to="/Notification">
                  <div className="notification-containerr">
                    <FaBell size={22} title="Notifications" />
                    {notificationCount > 0 && (
                      <span className="notification-badge">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            </>
          )}
          {/* Profile icon - changes behavior based on login status */}
          <li
            className={`profile-icon ${location.pathname.startsWith("/profile") ? "active" : ""}`}
          >
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
}

export default Navbar;

