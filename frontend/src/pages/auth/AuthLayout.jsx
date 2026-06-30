import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="auth-screen">
      <button className="icon-btn auth-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-panel-visual">
        <div className="auth-visual-content">
          <span className="brand-mark auth-brand-mark">L</span>
          <h1>LifeOS</h1>
          <p>Your personal operating system — goals, tasks, and an AI coach that actually knows what's on your plate.</p>
          <ul className="auth-feature-list">
            <li>Track goals with milestones and deadlines</li>
            <li>Organize tasks — list or kanban</li>
            <li>Get AI-driven daily focus recommendations</li>
            <li>Ask the AI Coach what needs your attention</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel-form">
        <div className="auth-form-inner">
          {eyebrow && <span className="auth-eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
