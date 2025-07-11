"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { Button } from "@mui/material";
import { API_URL } from "../../utils";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (user?.role === "manager") {
  //       navigate("/ArchiveManager");
  //     } else {
  //       navigate("/");
  //     }
  //   }
  // }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid Credentials. Please try again.",
        );
      }

      // Store the token in localStorage
      localStorage.setItem("token", data.access);
      console.log("Login successful, token stored");

      // If the login response includes user data, store it
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("User data stored from login response");

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        // If no user data in response, fetch it separately
        try {
          const userResponse = await fetch(`${API_URL}/user-info/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("User data fetched and stored after login");

            // Redirect based on role
            if (userData.role === "manager") {
              navigate("/ArchiveManager");
            } else {
              navigate("/");
            }
          }
        } catch (userError) {
          console.error("Error fetching user data after login:", userError);
          navigate("/"); // Default redirect if user data fetch fails
        }
      }

      setErrorMessage("");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-login-container">
      <h2 className="auth-login-title">Sign In</h2>
      <form onSubmit={handleSubmit} className="auth-login-form">
        <p className="auth-label">Enter Username</p>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="auth-input"
        />
        <p className="auth-label">Enter Password</p>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          style={{ margin: "20px 0" }}
          fullWidth
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        {errorMessage && (
          <p className="auth-error" style={{ marginBottom: 20 }}>
            {errorMessage}
          </p>
        )}

        <p className="auth-link-text">
          <Link to="/">
            <span className="auth-link">Back to home</span>
          </Link>
        </p>
        <p className="auth-link-text">
          Forgot your password?{" "}
          <Link to="/forgot-password">
            <span className="auth-link">Reset it</span>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
