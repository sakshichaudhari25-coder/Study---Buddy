
import { useState } from "react";
import apiClient, { getApiErrorMessage } from "../api/apiClient";
import AuthLayout from "../Components/AuthLayout";

function ResetPassword({ onShowLogin, theme, toggleTheme }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = window.location.pathname.split("/").pop();
  const hasToken = Boolean(token && token !== "reset-password");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");

    if (!hasToken) {
      setMessage("This password reset link is incomplete. Request a new link.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage(response.data.message || "Password reset successfully!");
      setSuccess(true);
    } catch (error) {
      setMessage(
        getApiErrorMessage(
          error,
          "Unable to reset password. The link may be invalid or expired."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      <div className="auth-card">
        <p className="auth-form-eyebrow">ACCOUNT RECOVERY</p>
        <h2>Reset Password</h2>
        <p className="auth-form-subtitle">Enter your new password below.</p>

        {success ? (
          <>
            <p className="auth-message">{message}</p>
            <button type="button" onClick={onShowLogin}>
              Back to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="reset-password">New Password</label>
            <div className="password-wrapper">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide new password" : "Show new password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <label htmlFor="confirm-reset-password">Confirm New Password</label>
            <div className="password-wrapper">
              <input
                id="confirm-reset-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>

            {message && <p className="auth-message" role="alert">{message}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

export default ResetPassword;
