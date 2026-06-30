import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../api/auth";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";

const AVATAR_COLORS = ["#f5a623", "#2dd4bf", "#a78bfa", "#fb7185", "#34d399", "#60a5fa"];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    daily_goal_minutes: user?.daily_goal_minutes || 120,
    avatar_color: user?.avatar_color || "#f5a623",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const onProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((f) => ({ ...f, [name]: name === "daily_goal_minutes" ? Number(value) : value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile(profileForm);
      updateUser(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setSavingPw(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success("Password changed.");
      setPwForm({ old_password: "", new_password: "" });
    } catch (err) {
      setPwError(err.message || "Could not change password.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your profile, preferences, and account security.</p>
        </div>
      </div>

      <div className="settings-grid">
        <Card>
          <h3 className="card-title">Appearance</h3>
          <div className="theme-row">
            <div>
              <p className="settings-row-label">Theme</p>
              <p className="settings-row-hint">Switch between light and dark mode.</p>
            </div>
            <button className="theme-switch" onClick={toggleTheme}>
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === "dark" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="card-title">Profile</h3>
          <form onSubmit={saveProfile}>
            <div className="form-row">
              <FormField label="First name">
                <input type="text" name="first_name" value={profileForm.first_name} onChange={onProfileChange} />
              </FormField>
              <FormField label="Last name">
                <input type="text" name="last_name" value={profileForm.last_name} onChange={onProfileChange} />
              </FormField>
            </div>
            <FormField label="Bio">
              <textarea name="bio" value={profileForm.bio} onChange={onProfileChange} rows={3} />
            </FormField>
            <FormField label="Daily focus goal (minutes)" hint="Used by the AI Coach to gauge your daily productivity target.">
              <input type="number" name="daily_goal_minutes" min="0" value={profileForm.daily_goal_minutes} onChange={onProfileChange} />
            </FormField>
            <FormField label="Avatar color">
              <div className="color-swatch-row">
                {AVATAR_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`color-swatch ${profileForm.avatar_color === c ? "color-swatch-active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setProfileForm((f) => ({ ...f, avatar_color: c }))}
                    aria-label={`Choose ${c}`}
                  />
                ))}
              </div>
            </FormField>
            <Button type="submit" variant="primary" loading={savingProfile}>Save profile</Button>
          </form>
        </Card>

        <Card>
          <h3 className="card-title">Change password</h3>
          <form onSubmit={savePassword}>
            <FormField label="Current password">
              <input
                type="password" value={pwForm.old_password}
                onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))}
                autoComplete="current-password" required
              />
            </FormField>
            <FormField label="New password">
              <input
                type="password" value={pwForm.new_password}
                onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                autoComplete="new-password" required
              />
            </FormField>
            {pwError && <p className="form-error" style={{ marginBottom: 12 }}>{pwError}</p>}
            <Button type="submit" variant="secondary" loading={savingPw}>Update password</Button>
          </form>
        </Card>

        <Card>
          <h3 className="card-title">Account</h3>
          <dl className="account-meta">
            <div><dt>Username</dt><dd>{user?.username}</dd></div>
            <div><dt>Email</dt><dd>{user?.email}</dd></div>
            <div><dt>Joined</dt><dd>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "—"}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
