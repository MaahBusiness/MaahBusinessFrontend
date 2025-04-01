import "./home.css";
import img from "../../assets/pexels-cottonbro-7019213.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="hero">
        <div className="hero_context">
          <h1>Welcome to Stock Management System</h1>
          <p>
            {" "}
            Manage your inventory efficiently with real-time tracking, easy
            updates, and seamless stock management. Get started today!
          </p>
          <button
            className="btn"
            onClick={() => navigate("/dashboard")}
            aria-label="Get Started"
          >
            Get Started
          </button>
        </div>
        <div className="hero_image">
          <img src={img} alt="Stock management dashboard preview" />
        </div>
      </div>
    </div>
  );
};

export default Home;
