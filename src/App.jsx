import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import "./app.css";
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

const Layout = () => (
  <div>
    <Navbar />
    <Sidebar />
    <Outlet />
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="dashboard-container">
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/category" element={<Category />} />
              <Route path="/Invoice" element={<Invoice />} />
              <Route path="/ArchiveManager" element={<ArchiveManager />} />
              <Route path="/Notification" element={<Notification />} />

              <Route path="/profile" element={<ProfileLayout />}>
                <Route path="info" element={<ProfileInfo />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
