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
    <form className="auth-form" onSubmit={submit}>
      <h1>Register</h1>
      <input
        placeholder="name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Create account</button>
      <Link to="/login">Login</Link>
    </form>
  );
};

export default RegisterPage;
