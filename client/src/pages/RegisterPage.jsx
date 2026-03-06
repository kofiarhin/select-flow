import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useRegister();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();

    const data = await register.mutateAsync(form);
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-page__panel">
          <div className="auth-page__content">
            <p className="auth-page__eyebrow">SelectFlow</p>
            <h1 className="auth-page__title">Create your account</h1>
            <p className="auth-page__subtitle">
              Set up your workspace to upload galleries, collect selections, and
              deliver polished finals.
            </p>

            <form className="auth-form" onSubmit={submit}>
              <div className="auth-form__field">
                <label htmlFor="name" className="auth-form__label">
                  Name
                </label>
                <input
                  id="name"
                  className="auth-form__input"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

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
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <button
                className="auth-form__button"
                type="submit"
                disabled={register.isPending}
              >
                {register.isPending ? "Creating account..." : "Create account"}
              </button>

              <p className="auth-form__footer">
                Already have an account?{" "}
                <Link className="auth-form__link" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
