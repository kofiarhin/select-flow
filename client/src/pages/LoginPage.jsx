import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    const data = await login.mutateAsync(form);
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-page__panel">
          <div className="auth-page__content">
            <p className="auth-page__eyebrow">SelectFlow</p>
            <h1 className="auth-page__title">Welcome back</h1>
            <p className="auth-page__subtitle">
              Sign in to manage projects, review client selections, and deliver
              final images.
            </p>

            <form className="auth-form" onSubmit={submit}>
              <div className="auth-form__field">
                <label htmlFor="email" className="auth-form__label">
                  Email
                </label>
                <input
                  id="email"
                  className="auth-form__input"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="password" className="auth-form__label">
                  Password
                </label>
                <input
                  id="password"
                  className="auth-form__input"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <button
                className="auth-form__button"
                type="submit"
                disabled={login.isPending}
              >
                {login.isPending ? "Signing in..." : "Login"}
              </button>

              <p className="auth-form__footer">
                Don&apos;t have an account?{" "}
                <Link className="auth-form__link" to="/register">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
