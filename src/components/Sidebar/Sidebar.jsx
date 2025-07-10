import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaTachometerAlt,
  FaBoxOpen,
  FaChartBar,
  FaListAlt,
  FaFileInvoice,
} from "react-icons/fa";
import "./sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Sidebar Toggle Button - Only appears on mobile */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Vict Management </h2>
        </div>
        <div className="sidebar-content">
          <ul>
            <li className={isActive("/dashboard") ? "active" : ""}>
              <Link to="/dashboard" onClick={toggleSidebar}>
                <FaTachometerAlt className="icon" /> Dashboard
              </Link>
            </li>
            <li className={isActive("/products") ? "active" : ""}>
              <Link to="/products" onClick={toggleSidebar}>
                <FaBoxOpen className="icon" /> Products
              </Link>
            </li>
            <li className={isActive("/reports") ? "active" : ""}>
              <Link to="/reports" onClick={toggleSidebar}>
                <FaChartBar className="icon" /> Reports
              </Link>
            </li>
            <li className={isActive("/category") ? "active" : ""}>
              <Link to="/category" onClick={toggleSidebar}>
                <FaListAlt className="icon" /> Category
              </Link>
            </li>
            <li className={isActive("/Invoice") ? "active" : ""}>
              <Link to="/Invoice" onClick={toggleSidebar}>
                <FaFileInvoice className="icon" /> Invoice
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
