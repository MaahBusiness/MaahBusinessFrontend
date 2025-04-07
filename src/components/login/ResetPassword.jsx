import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setError("");
    setSuccessMessage("");

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/password-reset-confirm/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: password,
          }),
        },
      );

      // Try to parse response as JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { detail: "Unexpected server response" };
      }

      if (!response.ok) {
        // Handle error response
        const errorMessage =
          data && typeof data === "object"
            ? Object.values(data).join(" ")
            : "Failed to reset password";

        throw new Error(errorMessage);
      }

      // Success
      setSuccessMessage("Password has been successfully reset!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password">
      <h2>Reset Your Password</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
