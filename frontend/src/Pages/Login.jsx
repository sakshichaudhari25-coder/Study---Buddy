
import { useState } from "react";
import apiClient, { getApiErrorMessage } from "../api/apiClient";
import AuthLayout, { AuthIcon } from "../Components/AuthLayout";

function Login({ onLogin, onShowRegister, onShowForgotPassword, theme, toggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const useDemoCredentials = () => {
    setEmail("demo@studybuddy.com");
    setPassword("Demo@123");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-form-eyebrow">WELCOME BACK</p>
        <h1>Welcome Back!</h1>
        <p className="auth-form-subtitle">Sign in to continue your learning journey.</p>

        {message && <div className="auth-message" role="alert">{message}</div>}

        <label htmlFor="login-email">Email Address</label>
        <div className="auth-input-wrap">
          <AuthIcon name="mail" className="auth-field-icon" />
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label htmlFor="login-password">Password</label>

        <div className="password-wrapper">
          <AuthIcon name="lock" className="auth-field-icon" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="forgot-password-link">
          <span
            role="button"
            tabIndex={0}
            onClick={onShowForgotPassword}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onShowForgotPassword();
              }
            }}
          >
            Forgot Password?
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="auth-demo-card">
          <div className="auth-demo-heading">
            <span className="auth-demo-icon"><AuthIcon name="checklist" /></span>
            <span><strong>Demo account</strong><small>Example credentials, not verified on this backend</small></span>
          </div>
          <dl>
            <div><dt>Email</dt><dd>demo@studybuddy.com</dd></div>
            <div><dt>Password</dt><dd>Demo@123</dd></div>
          </dl>
          <button
            type="button"
            className="auth-demo-fill"
            onClick={useDemoCredentials}
          >
            Use Demo Credentials
          </button>
        </div>

        <p>
          Don't have an account?{" "}
          <span
            role="button"
            tabIndex={0}
            onClick={onShowRegister}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onShowRegister();
              }
            }}
          >
            Register
          </span>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
