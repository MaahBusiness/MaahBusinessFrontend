import { useState } from "react";
import "./forgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage({ text: "", type: "" });

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setMessage({ text: "Processing request...", type: "info" });

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      let data;
      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (e) {
          data = { detail: "Unexpected server response" };
        }
      } else {
        data = { detail: "Server error occurred" };
      }

      if (!response.ok) {
        if (
          response.status === 500 &&
          data.detail?.includes("MultipleObjectsReturned")
        ) {
          throw new Error(
            "Multiple accounts found with this email. Please contact support.",
          );
        }

        let errorMessage =
          data && typeof data === "object"
            ? Object.values(data).join(" ")
            : "Failed to send reset link";

        throw new Error(errorMessage);
      }

      setMessage({
        text: "Password reset link has been sent to your email",
        type: "success",
      });
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      setMessage({
        text: error.message || "Something went wrong. Please try again later.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      <p>Please enter your email to receive password reset instructions.</p>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "input-error" : ""}
            disabled={isLoading}
          />
          {error && <span className="error-text">{error}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={isLoading ? "loading" : ""}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
