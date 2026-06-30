import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/goals.css";
import "./styles/tasks.css";
import "./styles/ai-coach.css";
import "./styles/settings.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
