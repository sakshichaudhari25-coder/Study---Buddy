import { useState } from "react";
import apiClient, { getApiErrorMessage } from "../api/apiClient";

function Profile({ user, onProfileUpdate, onBack }) {
  const [name, setName] = useState(user.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Please enter your current password");
      return;
    }

    const updateData = { name: name.trim() };
    if (newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    try {
      setLoading(true);
      const response = await apiClient.put("/auth/profile", updateData, {
        requiresAuth: true,
      });

      onProfileUpdate(response.data.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully!");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update profile."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <div className="profile-heading">
          <div className="profile-avatar" aria-hidden="true">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <h1>My Profile</h1>
          <p>Manage your personal account information.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>Personal Information</h2>

          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            maxLength={80}
            autoComplete="name"
            required
          />

          <label htmlFor="profile-email">Email Address</label>
          <input
            id="profile-email"
            type="email"
            value={user.email}
            autoComplete="email"
            disabled
          />

          <div className="profile-divider"></div>

          <h2>Change Password</h2>
          <p className="profile-hint">
            Leave these fields empty if you don&apos;t want to change your password.
          </p>

          <label htmlFor="profile-current-password">Current Password</label>
          <input
            id="profile-current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter current password"
            autoComplete="current-password"
          />

          <label htmlFor="profile-new-password">New Password</label>
          <input
            id="profile-new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            minLength={6}
          />

          <label htmlFor="profile-confirm-password">Confirm New Password</label>
          <input
            id="profile-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />

          {message && (
            <div className="profile-success" role="status">
              {message}
            </div>
          )}

          {error && (
            <div className="profile-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="profile-save-button"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
