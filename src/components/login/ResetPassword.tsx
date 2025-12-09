import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks";
import { useNotification } from "../../context/NotificationContext";
import { authService } from "../../services";
import type { FormErrors } from "../../types";
import "./resetPassword.css";

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

const validatePasswords = (values: ResetPasswordValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const notification = useNotification();

  const { values, errors, isSubmitting, submitError, handleChange, handleSubmit } = useForm<ResetPasswordValues>({
    initialValues: { password: "", confirmPassword: "" },
    validate: validatePasswords,
    onSubmit: async (formValues) => {
      if (!token) throw new Error("Invalid reset token");
      await authService.confirmPasswordReset(token, formValues.password);
      notification.success("Password has been successfully reset!");
      setTimeout(() => navigate("/login"), 2000);
    },
  });

  return (
    <div className="reset-password">
      <h2>Reset Your Password</h2>

      {submitError && <div className="error-message">{submitError}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={values.password}
          onChange={handleChange}
          disabled={isSubmitting}
          className={errors.password ? "input-error" : ""}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={values.confirmPassword}
          onChange={handleChange}
          disabled={isSubmitting}
          className={errors.confirmPassword ? "input-error" : ""}
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
