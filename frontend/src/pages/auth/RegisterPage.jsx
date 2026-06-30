import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../api/client";

const initialForm = {
  username: "", email: "", first_name: "", last_name: "",
  password: "", password_confirm: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success("Account created — welcome to LifeOS!");
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const fieldErrors = {};
        Object.entries(err.data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ form: err.message || "Could not create account." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Get started" title="Create your account" subtitle="Set up your personal operating system in under a minute.">
      <form onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <FormField label="First name" error={errors.first_name}>
            <input type="text" name="first_name" value={form.first_name} onChange={onChange} autoFocus />
          </FormField>
          <FormField label="Last name" error={errors.last_name}>
            <input type="text" name="last_name" value={form.last_name} onChange={onChange} />
          </FormField>
        </div>

        <FormField label="Username" error={errors.username}>
          <input type="text" name="username" value={form.username} onChange={onChange} autoComplete="username" required />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <input type="email" name="email" value={form.email} onChange={onChange} autoComplete="email" required />
        </FormField>

        <div className="form-row">
          <FormField label="Password" error={errors.password}>
            <input type="password" name="password" value={form.password} onChange={onChange} autoComplete="new-password" required />
          </FormField>
          <FormField label="Confirm password" error={errors.password_confirm}>
            <input type="password" name="password_confirm" value={form.password_confirm} onChange={onChange} autoComplete="new-password" required />
          </FormField>
        </div>

        {errors.form && <p className="form-error" style={{ marginBottom: 14 }}>{errors.form}</p>}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
          Create account
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
