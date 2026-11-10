
import { useState } from "react";
import axios from "axios";

function ForgotPassword({ onShowLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setResetLink("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMessage(response.data.message);
      setResetLink(response.data.resetLink || "");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password?</h1>

        <p>
          Enter your registered email address to generate
          a password reset link.
        </p>

        {message && (
          <div className="auth-message">{message}</div>
        )}

        <label>Email Address</label>

        <input
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
          <span onClick={onShowLogin}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
