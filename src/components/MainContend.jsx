import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MainContent = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
    };
    fetchUserData();
  }, [navigate]);

  return <div className="mainContent">{children}</div>;
};

export default MainContent;
