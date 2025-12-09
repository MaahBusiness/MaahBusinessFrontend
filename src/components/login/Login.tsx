import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { useForm } from "../../hooks";
import { authService } from "../../services";
import type { LoginCredentials, FormErrors } from "../../types";
import "./login.css";

const validateLogin = (values: LoginCredentials): FormErrors => {
  const errors: FormErrors = {};
  if (!values.username) errors.username = "Username is required";
  if (!values.password) errors.password = "Password is required";
  return errors;
};

function Login() {
  const navigate = useNavigate();
  const notification = useNotification();

  const { values, errors, isSubmitting, submitError, handleChange, handleSubmit } = useForm<LoginCredentials>({
    initialValues: { username: "", password: "" },
    validate: validateLogin,
    onSubmit: async (formValues) => {
      const response = await authService.login(formValues);

      // Store token
      const token = response.access || response.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Get user data
      let userData = response.user;
      if (!userData) {
        userData = await authService.getUserInfo();
      }
      localStorage.setItem("user", JSON.stringify(userData));

      notification.success("Login successful!");

      // Redirect based on role
      if (userData?.role === "manager") {
        navigate("/ArchiveManager");
      } else {
        navigate("/");
      }
    },
  });

  return (
    <div className="auth-login-container">
      <h2 className="auth-login-title">Login</h2>
      <form onSubmit={handleSubmit} className="auth-login-form">
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
        {errors.username && <p className="auth-field-error">{errors.username}</p>}

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
        {errors.password && <p className="auth-field-error">{errors.password}</p>}

        <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {submitError && <p className="auth-error">{submitError}</p>}

        <p className="auth-link-text">
          I don't have an account?{" "}
          <Link to="/signup">
            <span className="auth-link">Sign up</span>
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
}

export default Login;
