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
import SubCategory from "./components/Subcategory/Subcategory";
import Dashboard from "./components/Dashboard/Dashboard";
import ProductDetail from "./components/Products/ProductDetail";

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
            <Route path="/ProductDetail" element={<ProductDetail />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/category" element={<Category />} />
              <Route path="/subcategory" element={<SubCategory />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
