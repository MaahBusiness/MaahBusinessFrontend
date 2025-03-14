import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>
      <div className="sidebar-content">
        <ul>
          <li className={isActive("/") ? "active" : ""}>
            <Link to="/">Home</Link>
          </li>
          <li className={isActive("/dashboard") ? "active" : ""}>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className={isActive("/products") ? "active" : ""}>
            <Link to="/products">Products</Link>
          </li>
          <li className={isActive("/reports") ? "active" : ""}>
            <Link to="/reports">Reports</Link>
          </li>
          <li className={isActive("/category") ? "active" : ""}>
            <Link to="/category">Category</Link>
          </li>
          <li className={isActive("/Invoice") ? "active" : ""}>
            <Link to="/Invoice">Invoice</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
