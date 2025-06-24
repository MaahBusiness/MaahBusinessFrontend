"use client";

import "./home.css";
import img from "../../../public/assets/hero.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainContent from "../MainContend";

const Home = () => {
  const navigate = useNavigate();

  // Add subtle animation effect when component mounts
  useEffect(() => {
    const heroElement = document.querySelector(".hero");
    if (heroElement) {
      heroElement.style.opacity = "0";
      setTimeout(() => {
        heroElement.style.opacity = "1";
        heroElement.style.transition = "opacity 0.8s ease-in-out";
      }, 100);
    }
  }, []);

  return (
    <MainContent>
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
            src={img || "/placeholder.svg"}
            alt="Stock management dashboard preview"
          />
        </div>
      </div>
    </MainContent>
  );
};

export default Home;
