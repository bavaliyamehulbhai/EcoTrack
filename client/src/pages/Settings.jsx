import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";
import DashboardLayout from "../layouts/DashboardLayout";

function Settings() {
  const { user, loading, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = { name };
      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      await refreshUser();
      
      setPassword("");
      setConfirmPassword("");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile save failed", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading settings profile...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px", maxWidth: "600px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <h1 className="welcome-title" style={{ fontSize: "28px" }}>⚙️ Profile Settings</h1>
            <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
              Update your account credentials, display name, and password.
            </p>
          </div>

          {/* Form Card */}
          <div className="welcome-card" style={{ textAlign: "left", padding: "30px", marginBottom: "0" }}>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address (Locked)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                    background: "rgba(255,255,255,0.02)"
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-name">Display Name</label>
                <input
                  id="settings-name"
                  type="text"
                  placeholder="Your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label>Theme Preference</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`quick-action-btn ${theme === "dark" ? "primary" : "secondary"}`}
                    style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                  >
                    🌑 Dark Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`quick-action-btn ${theme === "light" ? "primary" : "secondary"}`}
                    style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                  >
                    ☀️ Light Theme
                  </button>
                </div>
              </div>

              <div style={{ margin: "24px 0", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "var(--text-h)", fontSize: "14px", fontWeight: "600" }}>
                  🔐 Change Password (Optional)
                </h4>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="settings-pwd">New Password</label>
                  <input
                    id="settings-pwd"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="settings-confirm">Confirm New Password</label>
                  <input
                    id="settings-confirm"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={isSaving} style={{ marginTop: "10px" }}>
                {isSaving ? "Saving changes..." : "Save Settings"}
              </button>
            </form>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default Settings;
