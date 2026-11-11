
import { useState } from "react";
import apiClient, { getApiErrorMessage } from "../api/apiClient";
import AuthLayout from "../Components/AuthLayout";

function ForgotPassword({ onShowLogin, theme, toggleTheme }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMessage("");
    setResetLink("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/forgot-password", { email });

      setMessage(response.data.message);
      setResetLink(response.data.resetLink || "");
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Unable to process your request.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-form-eyebrow">ACCOUNT RECOVERY</p>
        <h1>Forgot Password?</h1>

        <p className="auth-form-subtitle">
          Enter your registered email address to generate
          a password reset link.
        </p>

        {message && (
          <div className="auth-message" role="status">{message}</div>
        )}

        <label htmlFor="forgot-email">Email Address</label>

        <input
          id="forgot-email"
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Generate Reset Link"}
        </button>

        {resetLink && (
          <div className="reset-link-container">
            <p>Development reset link:</p>

            <a href={resetLink}>
              Reset Your Password
            </a>
          </div>
        )}

        <p>
          Remember your password?{" "}
          <span
            role="button"
            tabIndex={0}
            onClick={onShowLogin}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onShowLogin();
              }
            }}
          >
            Login
          </span>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
