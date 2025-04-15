"use client";

import { useState, useEffect, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaBox,
  FaSpinner,
  FaArchive,
  FaSyncAlt,
} from "react-icons/fa";
import "./notification.css";

const Notification = ({ isDropdown = false }) => {
  // State
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // Modal states
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveMonths, setArchiveMonths] = useState(3);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Add this function near the top of your component
  const updateNavbarNotificationCount = () => {
    // Dispatch a custom event that Navbar will listen for
    window.dispatchEvent(new Event("notificationsUpdated"));
  };

  // Fetch notifications
  const fetchNotifications = async (resetList = true) => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the new API endpoint
      let apiUrl = `http://localhost:8000/api/v1/notification/notifications/`;

      // Add query parameters
      const params = new URLSearchParams();

      // Add page size
      params.append("page_size", pageSize.toString());

      // Add status filter if not showing all
      if (filter !== "all" && filter !== "ALL") {
        params.append("status", filter.toUpperCase());
      }

      // Add page parameter if paginating
      if (currentPage > 1) {
        params.append("page", currentPage.toString());
      }

      // Append params to URL if there are any
      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();

      // Handle pagination response structure
      const fetchedNotifications = data.results || data;

      // Sort notifications by date (newest first) and status (unread first)
      const sortedNotifications = [...fetchedNotifications].sort((a, b) => {
        // First sort by status (UNREAD first)
        if (a.status === "UNREAD" && b.status !== "UNREAD") return -1;
        if (a.status !== "UNREAD" && b.status === "UNREAD") return 1;

        // Then sort by date (newest first)
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      // Update notifications state
      setNotifications(
        resetList
          ? sortedNotifications
          : [...notifications, ...sortedNotifications],
      );

      // Check if there are more pages
      setHasMore(data.next !== null);

      // Update unread count in localStorage for navbar
      fetchUnreadCount();
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single notification
  const fetchNotificationDetails = async (id) => {
    if (!token || !id) return null;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/notification/notification/?notif_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.notif_id &&
          errorData.notif_id.includes("This field is required.")
        ) {
          throw new Error("Notification ID is required");
        }
        throw new Error("Failed to fetch notification details");
      }

      return await response.json();
    } catch (err) {
      console.error("Error fetching notification details:", err);
      showStatusMessage(
        err.message || "Failed to fetch notification details",
        "error",
      );
      return null;
    }
  };

  // Update the viewNotificationDetails function to automatically mark notifications as read and open the modal
  const viewNotificationDetails = async (notification, event) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      // If we need to fetch more details
      if (notification.id) {
        const details = await fetchNotificationDetails(notification.id);

        if (details) {
          setSelectedNotification(details);
        } else {
          setSelectedNotification(notification);
        }
      } else {
        setSelectedNotification(notification);
      }

      setIsViewModalOpen(true);

      // If the notification is unread, mark it as read
      if (notification.status === "UNREAD") {
        await markAsRead(notification.id);
      }
    } catch (err) {
      console.error("Error viewing notification details:", err);
      showStatusMessage("Failed to load notification details", "error");
    }
  };

  // Update the markAsRead function to immediately update the UI and notify the navbar
  const markAsRead = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }

    if (!token) return;

    try {
      // Update local state immediately for better UX
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, status: "READ" }
            : notification,
        ),
      );

      // Update unread count in localStorage
      const newUnreadCount = notifications.filter(
        (n) => n.id !== id && n.status === "UNREAD",
      ).length;
      localStorage.setItem("notificationCount", newUnreadCount.toString());

      // Dispatch storage event for navbar to pick up the change
      window.dispatchEvent(new Event("storage"));

      const response = await fetch(
        `http://localhost:8000/api/v1/notification/mark-read/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notif_id: id,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update unread count in localStorage
      fetchUnreadCount();

      showStatusMessage("Notification marked as read", "success");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      showStatusMessage("Failed to mark notification as read", "error");

      // Revert the local state change if the API call failed
      setNotifications(
        notifications.map((notification) =>
          notification.id === id && notification.status === "READ"
            ? { ...notification, status: "UNREAD" }
            : notification,
        ),
      );
    }
  };

  // Update the markAllAsRead function to immediately update the UI and notify the navbar
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      // Update local state immediately for better UX
      setNotifications(
        notifications.map((notification) =>
          notification.status === "UNREAD"
            ? { ...notification, status: "READ" }
            : notification,
        ),
      );

      // Update unread count in localStorage
      localStorage.setItem("notificationCount", "0");

      // Dispatch storage event for navbar to pick up the change
      window.dispatchEvent(new Event("storage"));

      const response = await fetch(
        `http://localhost:8000/api/v1/notification/mark-all-read/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      showStatusMessage("All notifications marked as read", "success");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      showStatusMessage("Failed to mark all notifications as read", "error");

      // Revert the local state change if the API call failed
      fetchNotifications(true);
    }
  };

  // Update the fetchUnreadCount function to ensure it only counts UNREAD notifications
  const fetchUnreadCount = async () => {
    try {
      // Always fetch fresh data from API for unread notifications
      const response = await fetch(
        "http://localhost:8000/api/v1/notification/my-notifications/?status=UNREAD",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Set count based on the API response
        const unreadCount = Array.isArray(data) ? data.length : data.count || 0;

        // Update both state and localStorage
        localStorage.setItem("notificationCount", unreadCount.toString());

        // Dispatch storage event for navbar to pick up the change
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("notificationsUpdated"));
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Archive notification
  const archiveNotification = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }

    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/notification/archive/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notif_id: id, // Using the correct parameter name as per API docs
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to archive notification: ${errorData.notif_id ? errorData.notif_id.join(", ") : "Unknown error"}`,
        );
      }

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, status: "ARCHIVED" }
            : notification,
        ),
      );

      // Update unread count if needed
      const wasUnread =
        notifications.find((n) => n.id === id)?.status === "UNREAD";
      if (wasUnread) {
        fetchUnreadCount();
      }

      showStatusMessage("Notification archived successfully", "success");
    } catch (err) {
      console.error("Error archiving notification:", err);
      showStatusMessage(
        err.message || "Failed to archive notification",
        "error",
      );
    }
  };

  // Archive old notifications
  const archiveOldNotifications = async () => {
    setArchiveLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/notification/archive-old/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ months: archiveMonths }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to archive old notifications");
      }

      const data = await response.json();

      // Refresh notifications list
      setCurrentPage(1);
      fetchNotifications(true);

      // Close modal and show success message
      setShowArchiveModal(false);
      showStatusMessage(
        `Successfully archived ${data.count || "all"} old notifications`,
        "success",
      );
    } catch (err) {
      console.error("Error archiving old notifications:", err);
      showStatusMessage("Failed to archive old notifications", "error");
    } finally {
      setArchiveLoading(false);
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Show status message
  const showStatusMessage = (message, type) => {
    setStatusMessage({ show: true, message, type });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setStatusMessage({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Toggle notification dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      // Fetch fresh notifications when opening
      setCurrentPage(1);
      fetchNotifications(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications on mount and when filter changes
  useEffect(() => {
    // Fetch notifications and unread count on mount
    fetchNotifications();
    fetchUnreadCount();

    // Set up interval to periodically check for new notifications
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      // Update notification count when component unmounts
      const unreadCount = notifications.filter(
        (n) => n.status === "UNREAD",
      ).length;
      localStorage.setItem("notificationCount", unreadCount.toString());
      updateNavbarNotificationCount();
    };
  }, []);

  // Fetch more notifications when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchNotifications(false);
    }
  }, [currentPage]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "CRITICAL_STOCK":
        return <FaExclamationTriangle className="notification-icon critical" />;
      case "EXPIRED":
        return <FaCalendarAlt className="notification-icon expired" />;
      case "NEAR_EXPIRY":
        return <FaClock className="notification-icon warning" />;
      default:
        return <FaBox className="notification-icon" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      // If less than 24 hours ago, show relative time
      if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
        return formatDistanceToNow(date, { addSuffix: true });
      }

      // Otherwise show formatted date
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (err) {
      return dateString;
    }
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    if (filter === "all" || filter === "ALL") {
      return notifications.filter((n) => n.status !== "ARCHIVED");
    }
    return notifications.filter((n) => n.status === filter.toUpperCase());
  };

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => notification.status === "UNREAD",
  ).length;

  // Render notification dropdown for header
  if (isDropdown) {
    return (
      <div className="notification-center" ref={dropdownRef}>
        <button
          className={`notification-trigger ${isDropdownOpen ? "active" : ""}`}
          onClick={toggleDropdown}
          aria-label="Notifications"
        >
          <FaBell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {isDropdownOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                <button
                  className="mark-all-read"
                  onClick={markAllAsRead}
                  disabled={!notifications.some((n) => n.status === "UNREAD")}
                >
                  <FaCheckCircle size={14} /> Mark all as read
                </button>
                <button
                  className="close-notifications"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaTimesCircle size={18} />
                </button>
              </div>
            </div>

            <div className="notification-filters">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === "UNREAD" ? "active" : ""}`}
                onClick={() => setFilter("UNREAD")}
              >
                Unread
              </button>
              <button
                className="filter-btn"
                onClick={() => setShowArchiveModal(true)}
              >
                Archive
              </button>
            </div>

            <div className="notification-list">
              {isLoading ? (
                <div className="notification-loading">
                  <FaSpinner className="spin" size={24} />
                  <p>Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="notification-error">
                  <FaExclamationTriangle size={24} />
                  <p>{error}</p>
                </div>
              ) : getFilteredNotifications().length === 0 ? (
                <div className="notification-empty">
                  <FaBell size={24} />
                  <p>No notifications to display</p>
                </div>
              ) : (
                getFilteredNotifications().map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.status.toLowerCase()}`}
                    onClick={(e) => viewNotificationDetails(notification, e)}
                  >
                    <div className="notification-icon-container">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-product">
                          {notification.product_name || "System Notification"}
                        </span>
                        <span className="notification-time">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="notification-actions">
                      <button
                        className="archive-btn"
                        onClick={(e) => archiveNotification(notification.id, e)}
                        title="Archive"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={loadMore}
                    className="load-more-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="spin" /> Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        {renderModals()}
      </div>
    );
  }

  // Render full notification page
  return (
    <div className="notification-page">
      {statusMessage.show && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="notification-container">
        <div className="notification-header">
          <h1>Notifications</h1>
          <div className="notification-actions">
            <button
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              disabled={!notifications.some((n) => n.status === "UNREAD")}
            >
              <FaCheckCircle /> Mark all as read
            </button>
            <button
              className="archive-old-btn"
              onClick={() => setShowArchiveModal(true)}
            >
              <FaArchive /> Archive Old
            </button>
            <button
              className="refresh-btn"
              onClick={() => {
                setCurrentPage(1);
                fetchNotifications(true);
              }}
            >
              <FaSyncAlt /> Refresh
            </button>
          </div>
        </div>

        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "UNREAD" ? "active" : ""}`}
            onClick={() => {
              setFilter("UNREAD");
              setCurrentPage(1);
            }}
          >
            Unread
          </button>
          <button
            className={`filter-btn ${filter === "READ" ? "active" : ""}`}
            onClick={() => {
              setFilter("READ");
              setCurrentPage(1);
            }}
          >
            Read
          </button>
          <button
            className={`filter-btn ${filter === "ARCHIVED" ? "active" : ""}`}
            onClick={() => {
              setFilter("ARCHIVED");
              setCurrentPage(1);
            }}
          >
            Archived
          </button>
        </div>

        <div className="notification-list">
          {isLoading && currentPage === 1 ? (
            <div className="notification-loading">
              <FaSpinner className="spin" size={24} />
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="notification-error">
              <FaExclamationTriangle size={24} />
              <p>{error}</p>
            </div>
          ) : getFilteredNotifications().length === 0 ? (
            <div className="notification-empty">
              <FaBell size={24} />
              <p>No notifications to display</p>
            </div>
          ) : (
            <>
              {getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.status.toLowerCase()}`}
                  onClick={(e) => viewNotificationDetails(notification, e)}
                >
                  <div className="notification-icon-container">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-product">
                        {notification.product_name || "System Notification"}
                      </span>
                      <span className="notification-time">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    {notification.status !== "ARCHIVED" && (
                      <button
                        className="archive-btn"
                        onClick={(e) => archiveNotification(notification.id, e)}
                        title="Archive"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={loadMore}
                    className="load-more-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="spin" /> Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {renderModals()}
    </div>
  );

  // Helper function to render modals
  function renderModals() {
    return (
      <>
        {/* Archive Old Notifications Modal */}
        {showArchiveModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Archive Old Notifications</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowArchiveModal(false)}
                >
                  <FaTimesCircle />
                </button>
              </div>
              <div className="modal-body">
                <p>Archive notifications older than:</p>
                <div className="archive-months-selector">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={archiveMonths}
                    onChange={(e) =>
                      setArchiveMonths(
                        Math.max(
                          1,
                          Math.min(12, Number.parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="months-input"
                  />
                  <span className="months-label">months</span>
                </div>
                <p className="archive-warning">
                  <FaExclamationTriangle className="warning-icon" />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowArchiveModal(false)}
                  disabled={archiveLoading}
                >
                  Cancel
                </button>
                <button
                  className="archive-btn"
                  onClick={archiveOldNotifications}
                  disabled={archiveLoading}
                >
                  {archiveLoading ? (
                    <>
                      <FaSpinner className="spin" /> Archiving...
                    </>
                  ) : (
                    <>
                      <FaArchive /> Archive
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Details Modal */}
        {isViewModalOpen && selectedNotification && (
          <div className="modal-overlay">
            <div className="modal-content notification-details-modal">
              <div className="modal-header">
                <h3>Notification Details</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  <FaTimesCircle />
                </button>
              </div>
              <div className="modal-body">
                <div className="notification-detail-item">
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">
                    {selectedNotification.product_name || "System Notification"}
                  </span>
                </div>
                <div className="notification-detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">
                    {selectedNotification.notification_type}
                  </span>
                </div>
                <div className="notification-detail-item">
                  <span className="detail-label">Message:</span>
                  <span className="detail-value">
                    {selectedNotification.message}
                  </span>
                </div>
                <div className="notification-detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {formatDate(selectedNotification.created_at)}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                {selectedNotification.status !== "ARCHIVED" && (
                  <button
                    className="archive-btn"
                    onClick={() => {
                      archiveNotification(selectedNotification.id);
                      setIsViewModalOpen(false);
                    }}
                  >
                    <FaArchive /> Archive
                  </button>
                )}
                <button
                  className="close-btn"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default Notification;
