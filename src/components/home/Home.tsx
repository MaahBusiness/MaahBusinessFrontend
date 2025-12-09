import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
const heroImg = "/assets/hero.jpg";

function Home() {
  const navigate = useNavigate();

  // Add subtle animation effect when component mounts
  useEffect(() => {
    const heroElement = document.querySelector(".hero");
    if (heroElement) {
      (heroElement as HTMLElement).style.opacity = "0";
      setTimeout(() => {
        (heroElement as HTMLElement).style.opacity = "1";
        (heroElement as HTMLElement).style.transition = "opacity 0.8s ease-in-out";
      }, 100);
    }
  }, []);

  return (
    <div>
      <div className="hero">
        <div className="hero_context">
          <h1>Streamline Your Inventory Management</h1>
          <p>
            Take control of your stock with our powerful management system.
            Track inventory in real-time, generate detailed reports, and make
            data-driven decisions to optimize your business operations.
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
          <img
            src={heroImg || "/placeholder.svg"}
            alt="Stock management dashboard preview"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;

