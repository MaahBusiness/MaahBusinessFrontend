import { Link } from "react-router-dom";
import "./Navigation.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
