
import { useState } from "react";
import apiClient, { getApiErrorMessage } from "../api/apiClient";
import AuthLayout, { AuthIcon } from "../Components/AuthLayout";

function Register({ onShowLogin, theme, toggleTheme }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setLoading(true);

    try {
      await apiClient.post("/auth/register", { name, email, password });

      setMessage("Registration successful! Please login.");

      setTimeout(() => {
        onShowLogin();
      }, 1000);
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-form-eyebrow">GET STARTED</p>
        <h1>Create Your Account</h1>
        <p className="auth-form-subtitle">Start organizing your studies today.</p>

        {message && <div className="auth-message" role="status">{message}</div>}

        <label htmlFor="register-name">Full Name</label>
        <div className="auth-input-wrap">
          <AuthIcon name="checklist" className="auth-field-icon" />
          <input
            id="register-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <label htmlFor="register-email">Email Address</label>
        <div className="auth-input-wrap">
          <AuthIcon name="mail" className="auth-field-icon" />
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label htmlFor="register-password">Password</label>

        <div className="password-wrapper">
          <AuthIcon name="lock" className="auth-field-icon" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <AuthIcon name={showPassword ? "eyeOff" : "eye"} />
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p>
          Already have an account?{" "}
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
            Sign In
          </span>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
