import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./signup.css";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      } else {
        if (!hasManagerPermission()) {
          navigate("/login");
          return;
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  // Create axios instance with authentication headers
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // Get current user role
  const hasManagerPermission = async () => {
    try {
      const authAxios = getAuthAxios();
      var currentUserRole = "";

      // Try to get the user info from localStorage first
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.role) {
            currentUserRole = parsedUser.role;
            console.log(
              "Current user role set from localStorage:",
              parsedUser.role,
            );
            return currentUserRole === "manager";
          }
        }
      } catch (localStorageError) {
        console.error(
          "Error getting user from localStorage:",
          localStorageError,
        );
      }

      // Try the user-info endpoint as a fallback
      try {
        const userInfoResponse = await authAxios.get(
          "https://victbackendmanagement.onrender.com/api/v1/user-info/",
        );
        console.log("User info data:", userInfoResponse.data);

        if (userInfoResponse.data && userInfoResponse.data.role) {
          currentUserRole = userInfoResponse.data.role;
          console.log("Current user role set to:", userInfoResponse.data.role);
          return currentUserRole === "manager";
        }
      } catch (userInfoError) {
        console.error(
          "Error fetching from /user-info/ endpoint:",
          userInfoError,
        );
      }

      // If we couldn't determine the role, set a default
      console.warn(
        "Could not determine user role from any source, defaulting to non-manager",
      );
      currentUserRole = "cashier"; // Default to non-manager role
      return currentUserRole === "manager";
    } catch (err) {
      console.error("Error fetching current user:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
      }
    }
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    role: "manager",
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessages, setModalErrorMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setModalErrorMessages([]);

    try {
      const response = await fetch(
        "https://victbackendmanagement.onrender.com/api/v1/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (typeof data === "object") {
          const errorMessages = Object.entries(data).flatMap(([key, value]) => {
            if (Array.isArray(value)) {
              return value;
            } else if (typeof value === "string") {
              return [`${key}: ${value}`];
            }
            return [];
          });

          setModalErrorMessages(errorMessages);
        } else {
          setModalErrorMessages(["Registration failed. Please try again."]);
        }
        throw new Error("Registration failed.");
      }

      // Store token in localStorage
      let authToken = null;
      if (data.token) {
        authToken = data.token;
        localStorage.setItem("token", authToken);
        console.log("Token stored successfully:", authToken);
      } else if (data.access) {
        // Some APIs return token as 'access'
        authToken = data.access;
        localStorage.setItem("token", authToken);
        console.log("Token stored successfully:", authToken);
      } else {
        console.warn("No token received from registration API");
      }

      // Process and store user data
      let userData = {};
      if (data.user) {
        userData = data.user;
      } else {
        // If the API doesn't return user data, store what we have from the form
        userData = {
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          role: formData.role,
          is_active: formData.is_active,
        };
      }

      // Store user profile data in localStorage for immediate access
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User data stored:", userData);

      // If we have a token, attempt to fetch the complete user profile
      if (authToken) {
        try {
          const profileResponse = await fetch(
            "https://victbackendmanagement.onrender.com/api/v1/user-info/",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            },
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            localStorage.setItem("user", JSON.stringify(profileData));
            console.log("Complete profile data stored:", profileData);
          }
        } catch (profileError) {
          console.warn(
            "Could not fetch complete profile after signup:",
            profileError,
          );
          // Continue with what we have - not a critical error
        }
      }

      // Redirect to profile page or home page
      navigate("/profile"); // Consider redirecting directly to profile page
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="auth-signup-container">
      <form onSubmit={handleSubmit} className="auth-signup-form">
        <h2 className="auth-signup-title">Sign Up</h2>
        <p className="auth-label">Enter Username</p>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
          className="auth-input"
        />
        <p className="auth-label">Enter Email</p>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="auth-input"
        />
        <p className="auth-label">Enter Number</p>
        <input
          type="number"
          name="phone_number"
          placeholder="Enter Phone"
          value={formData.phone_number}
          onChange={(e) =>
            setFormData({ ...formData, phone_number: e.target.value })
          }
          className="auth-input"
        />
        <p className="auth-label">Enter Password</p>
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          className="auth-input"
        />
        <p className="auth-label">Confirm Password</p>
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password || ""}
          onChange={(e) =>
            setFormData({ ...formData, confirm_password: e.target.value })
          }
          required
          className="auth-input"
        />
        <p className="auth-label">Select Role</p>
        <select
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
          className="auth-select"
        >
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
          <option value="stock_keeper">Stock Keeper</option>
          <option value="wholesale_client">Wholesale Client</option>
          <option value="sales_agent">Sales Agent</option>
        </select>
        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
        <p className="auth-link-text">
          Already have an account?{" "}
          <Link to="/login">
            <span className="auth-link">Sign in</span>
          </Link>
        </p>
      </form>

      {errorMessage && <p className="auth-error">{errorMessage}</p>}

      {modalErrorMessages.length > 0 && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <h3 className="auth-modal-title">Error Messages</h3>
            <ul className="auth-modal-list">
              {modalErrorMessages.map((msg, index) => (
                <li key={index} className="auth-modal-item">
                  {msg}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModalErrorMessages([])}
              className="auth-modal-close-btn"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
