import { useForm } from "../../hooks";
import { useNotification } from "../../context/NotificationContext";
import { authService } from "../../services";
import type { FormErrors } from "../../types";
import "./forgotPassword.css";

interface ForgotPasswordValues {
  email: string;
}

const validateEmail = (values: ForgotPasswordValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }
  return errors;
};

function ForgotPassword() {
  const notification = useNotification();

  const { values, errors, isSubmitting, submitError, handleChange, handleSubmit, reset } = useForm<ForgotPasswordValues>({
    initialValues: { email: "" },
    validate: validateEmail,
    onSubmit: async (formValues) => {
      await authService.requestPasswordReset(formValues.email);
      notification.success("Password reset link has been sent to your email");
      reset();
    },
  });

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      <p>Please enter your email to receive password reset instructions.</p>

      {submitError && <div className="message error">{submitError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={values.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
            disabled={isSubmitting}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className={isSubmitting ? "loading" : ""}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
