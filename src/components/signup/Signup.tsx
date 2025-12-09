import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { useForm } from "../../hooks";
import { authService } from "../../services";
import type { RegisterData, UserRole, FormErrors } from "../../types";
import "./signup.css";

interface SignupFormValues extends Omit<RegisterData, "role"> {
  role: UserRole;
}

const INITIAL_VALUES: SignupFormValues = {
  username: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
  role: "manager",
  is_active: true,
};

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "stock_keeper", label: "Stock Keeper" },
  { value: "wholesale_client", label: "Wholesale Client" },
  { value: "sales_agent", label: "Sales Agent" },
];

const validateSignup = (values: SignupFormValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.username?.trim()) {
    errors.username = "Username is required";
  }

  if (!values.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!values.confirm_password) {
    errors.confirm_password = "Please confirm your password";
  } else if (values.password !== values.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }

  return errors;
};

function Signup() {
  const navigate = useNavigate();
  const notification = useNotification();
  const [modalErrors, setModalErrors] = useState<string[]>([]);

  const { values, errors, isSubmitting, submitError, handleChange, handleSubmit } = useForm<SignupFormValues>({
    initialValues: INITIAL_VALUES,
    validate: validateSignup,
    onSubmit: async (formValues) => {
      // Remove confirm_password before sending to API
      const { confirm_password, ...registrationData } = formValues;

      try {
        const response = await authService.register(registrationData);

        // Store token if provided
        const token = response.access || response.token;
        if (token) {
          localStorage.setItem("token", token);
        }

        // Store user data
        let userData = response.user || {
          username: registrationData.username,
          email: registrationData.email,
          phone_number: registrationData.phone_number,
          role: registrationData.role,
          is_active: registrationData.is_active,
        };

        // Try to fetch complete profile if we have a token
        if (token) {
          try {
            userData = await authService.getUserInfo();
          } catch {
            // Use basic user data
          }
        }

        localStorage.setItem("user", JSON.stringify(userData));
        notification.success("Registration successful!");
        navigate("/profile/info");
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: Record<string, unknown> } };
        // Handle validation errors from API
        if (axiosError.response?.data && typeof axiosError.response.data === "object") {
          const errorMessages = Object.entries(axiosError.response.data).flatMap(([key, value]) => {
            if (Array.isArray(value)) return value as string[];
            if (typeof value === "string") return [`${key}: ${value}`];
            return [];
          });

          if (errorMessages.length > 0) {
            setModalErrors(errorMessages);
          }
        }
        throw error;
      }
    },
  });

  const closeErrorModal = () => setModalErrors([]);

  return (
    <div className="auth-signup-container">
      <form onSubmit={handleSubmit} className="auth-signup-form">
        <h2 className="auth-signup-title">Sign Up</h2>

        <p className="auth-label">Enter Username</p>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={values.username}
          onChange={handleChange}
          required
          className={`auth-input ${errors.username ? "input-error" : ""}`}
        />
        {errors.username && <span className="auth-field-error">{errors.username}</span>}

        <p className="auth-label">Enter Email</p>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={values.email}
          onChange={handleChange}
          required
          className={`auth-input ${errors.email ? "input-error" : ""}`}
        />
        {errors.email && <span className="auth-field-error">{errors.email}</span>}

        <p className="auth-label">Enter Number</p>
        <input
          type="text"
          name="phone_number"
          placeholder="Enter Phone"
          value={values.phone_number || ""}
          onChange={handleChange}
          className="auth-input"
        />

        <p className="auth-label">Enter Password</p>
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={values.password}
          onChange={handleChange}
          required
          className={`auth-input ${errors.password ? "input-error" : ""}`}
        />
        {errors.password && <span className="auth-field-error">{errors.password}</span>}

        <p className="auth-label">Confirm Password</p>
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={values.confirm_password || ""}
          onChange={handleChange}
          required
          className={`auth-input ${errors.confirm_password ? "input-error" : ""}`}
        />
        {errors.confirm_password && <span className="auth-field-error">{errors.confirm_password}</span>}

        <p className="auth-label">Select Role</p>
        <select name="role" value={values.role} onChange={handleChange} required className="auth-select">
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        <p className="auth-link-text">
          Already have an account?{" "}
          <Link to="/login">
            <span className="auth-link">Sign in</span>
          </Link>
        </p>
      </form>

      {submitError && <p className="auth-error">{submitError}</p>}

      {modalErrors.length > 0 && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <h3 className="auth-modal-title">Error Messages</h3>
            <ul className="auth-modal-list">
              {modalErrors.map((msg, index) => (
                <li key={index} className="auth-modal-item">
                  {msg}
                </li>
              ))}
            </ul>
            <button onClick={closeErrorModal} className="auth-modal-close-btn">
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
