import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back!");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setErrors({ form: err.message || "Invalid credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to LifeOS" subtitle="Pick up right where you left off.">
      <form onSubmit={onSubmit} noValidate>
        <FormField label="Username or email">
          <input
            type="text" name="username" value={form.username} onChange={onChange}
            autoComplete="username" required autoFocus
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password" name="password" value={form.password} onChange={onChange}
            autoComplete="current-password" required
          />
        </FormField>

        {errors.form && <p className="form-error" style={{ marginBottom: 14 }}>{errors.form}</p>}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
          Log in
        </Button>
      </form>

      <p className="auth-switch">
        New to LifeOS? <Link to="/register">Create an account</Link>
      </p>

      <p className="auth-demo-hint">
        Tip: run the seed script in the README to get a demo account with sample data.
      </p>
    </AuthLayout>
  );
}
