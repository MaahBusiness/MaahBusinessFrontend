import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./app.css";
import "./styles/notifications.css";

// Components
import Navbar from "./components/navigation/Navigation";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import Products from "./components/Products/Products";
import Reports from "./components/Reports/Reports";
import Category from "./components/Category/Category";
import Dashboard from "./components/Dashboard/Dashboard";
import Invoice from "./components/invoice/Invoice";
import Notification from "./components/Notification/Notification";
import ArchiveManager from "./components/invoice/ArchiveManager";
import ProfileLayout from "./components/Profile/ProfileLayout";
import ProfileInfo from "./components/Profile/ProfileInfo";
import ChangePassword from "./components/Profile/ChangePassword";
import ForgotPassword from "./components/login/ForgotPassword";
import ResetPassword from "./components/login/ResetPassword";

// Context Providers
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";

// Loaders
import {
  guestOnlyLoader,
  requireAuthLoader,
  productsLoader,
  categoryLoader,
  invoiceLoader,
  archivedInvoicesLoader,
  dashboardLoader,
} from "./loaders";

// Error Boundary Component
function ErrorBoundary() {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page or go back to the home page.</p>
      <a href="/">Go Home</a>
    </div>
  );
}

// Loading Component
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

// Root Layout with Context Providers
function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    </AuthProvider>
  );
}

// Authenticated Layout with Navbar and Sidebar
function AuthenticatedLayout() {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <Outlet />
    </div>
  );
}

// Router configuration
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Guest routes (no navbar/sidebar)
      {
        path: "/login",
        element: <Login />,
        loader: guestOnlyLoader,
      },
      {
        path: "/signup",
        element: <Signup />,
        loader: guestOnlyLoader,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPassword />,
      },
      // Authenticated routes (with navbar/sidebar)
      {
        element: <AuthenticatedLayout />,
        children: [
          {
            path: "/",
            element: <Home />,
            loader: requireAuthLoader,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
            loader: dashboardLoader,
          },
          {
            path: "/products",
            element: <Products />,
            loader: productsLoader,
          },
          {
            path: "/reports",
            element: <Reports />,
            loader: requireAuthLoader,
          },
          {
            path: "/category",
            element: <Category />,
            loader: categoryLoader,
          },
          {
            path: "/Invoice",
            element: <Invoice />,
            loader: invoiceLoader,
          },
          {
            path: "/ArchiveManager",
            element: <ArchiveManager />,
            loader: archivedInvoicesLoader,
          },
          {
            path: "/Notification",
            element: <Notification />,
            loader: requireAuthLoader,
          },
          {
            path: "/profile",
            element: <ProfileLayout />,
            loader: requireAuthLoader,
            children: [
              {
                path: "info",
                element: <ProfileInfo />,
              },
              {
                path: "change-password",
                element: <ChangePassword />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <RouterProvider router={router} fallbackElement={<Loading />} />
      </div>
    </div>
  );
}

export default App;
