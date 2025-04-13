"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/login/", {
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
      } else {
        // If no user data in response, fetch it separately
        try {
          const userResponse = await fetch(
            "http://localhost:8000/api/v1/user-info/",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.access}`,
              },
            },
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("User data fetched and stored after login");
          }
        } catch (userError) {
          console.error("Error fetching user data after login:", userError);
        }
      }

      // Redirect to home
      navigate("/");
      setErrorMessage("");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <p className="Lab">Enter Username</p>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <p className="Lab">Enter Password</p>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="loginbtn" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <p>
          I don't have an account?{" "}
          <Link to="/signup">
            <span>Sign up</span>
          </Link>
        </p>
        <p>
          Forgot your password?{" "}
          <Link to="/forgot-password">
            <span>Reset it</span>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
