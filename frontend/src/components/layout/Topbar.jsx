import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <button className="icon-btn topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar-spacer" />

      <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light/dark mode">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="topbar-user" ref={menuRef}>
        <button className="user-pill" onClick={() => setMenuOpen((o) => !o)}>
          <span className="avatar-badge" style={{ background: user?.avatar_color || "#6C5CE7" }}>
            {user?.initials || "?"}
          </span>
          <span className="user-pill-name">{user?.first_name || user?.username}</span>
          <ChevronDown size={14} />
        </button>

        {menuOpen && (
          <div className="user-menu">
            <button onClick={() => { setMenuOpen(false); navigate("/settings"); }}>
              <UserIcon size={15} /> Profile &amp; Settings
            </button>
            <button onClick={handleLogout} className="user-menu-danger">
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
