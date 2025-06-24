"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBell, FaSignOutAlt } from "react-icons/fa";
import "./Navigation.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
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

        const response = await fetch(
          "https://victbackendmanagement.onrender.com/api/v1/notification/my-notifications/?status=UNREAD",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Check if data is an array or has a count property
          const unreadCount = Array.isArray(data)
            ? data.filter((n) => n.status === "UNREAD").length
            : data.count || 0;

          setNotificationCount(unreadCount);
          localStorage.setItem("notificationCount", unreadCount.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isLoggedIn]);

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      setIsLoggedIn(!!token);
      setUsername(storedUsername || "");
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
    let interval;
    if (isLoggedIn) {
      interval = setInterval(fetchNotificationCount, 60000); // Check every minute
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn, fetchNotificationCount]);

  // Function to handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("notificationCount");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setNotificationCount(0);
    navigate("/login");
  }, [navigate]);

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
              <li
                className={`profile-icon ${location.pathname.startsWith("/profile") ? "active" : ""}`}
              >
                <Link to="/profile/info" title={`Profile: ${username}`}>
                  <FaUserCircle size={28} />
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
