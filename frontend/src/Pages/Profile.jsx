
import { useState } from "react";
import axios from "axios";

function Profile({ user, onProfileUpdate, onBack }) {
  const [name, setName] = useState(user.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

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

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onProfileUpdate(response.data.user);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update profile"
      );
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
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <h1>My Profile</h1>
          <p>Manage your personal account information.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>Personal Information</h2>

          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
          />

          <div className="profile-divider"></div>

          <h2>Change Password</h2>
          <p className="profile-hint">
            Leave these fields empty if you don't want to change your password.
          </p>

          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />

          {message && (
            <div className="profile-success">{message}</div>
          )}

          {error && (
            <div className="profile-error">{error}</div>
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
