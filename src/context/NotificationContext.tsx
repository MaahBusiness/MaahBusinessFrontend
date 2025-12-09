import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface ToastNotification {
  id: number;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationContextValue {
  notifications: ToastNotification[];
  addNotification: (notification: Partial<ToastNotification> & { message: string }) => number;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
  success: (message: string, options?: Partial<ToastNotification>) => number;
  error: (message: string, options?: Partial<ToastNotification>) => number;
  warning: (message: string, options?: Partial<ToastNotification>) => number;
  info: (message: string, options?: Partial<ToastNotification>) => number;
  // Aliases for compatibility
  showSuccess: (message: string, options?: Partial<ToastNotification>) => number;
  showError: (message: string, options?: Partial<ToastNotification>) => number;
  showWarning: (message: string, options?: Partial<ToastNotification>) => number;
  showInfo: (message: string, options?: Partial<ToastNotification>) => number;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Partial<ToastNotification> & { message: string }) => {
      const id = Date.now() + Math.random();
      const newNotification: ToastNotification = {
        id,
        type: "info",
        duration: 3000,
        ...notification,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification after duration
      if (newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    [removeNotification]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different types
  const success = useCallback(
    (message: string, options: Partial<ToastNotification> = {}) => {
      return addNotification({ message, type: "success", ...options });
    },
    [addNotification]
  );

  const error = useCallback(
    (message: string, options: Partial<ToastNotification> = {}) => {
      return addNotification({ message, type: "error", duration: 5000, ...options });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message: string, options: Partial<ToastNotification> = {}) => {
      return addNotification({ message, type: "warning", ...options });
    },
    [addNotification]
  );

  const info = useCallback(
    (message: string, options: Partial<ToastNotification> = {}) => {
      return addNotification({ message, type: "info", ...options });
    },
    [addNotification]
  );

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
    // Aliases for compatibility
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

// Toast notification container component
interface NotificationContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: number) => void;
}

function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-toast-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast notification-toast-${notification.type}`}
          onClick={() => onRemove(notification.id)}
        >
          <span className="notification-toast-message">{notification.message}</span>
          <button
            className="notification-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

export default NotificationContext;
