import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Паролі не співпадають.");
      return;
    }

    setLoading(true);
    try {
      // Реєстрація
      await axios.post("http://127.0.0.1:8000/api/users/register/", {
        username: form.username,
        password: form.password,
      });

      // Автологін після реєстрації
      const res = await axios.post("http://127.0.0.1:8000/api/users/token/", {
        username: form.username,
        password: form.password,
      });
      login(res.data.access, res.data.refresh, form.username);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) setError(`Логін: ${data.username[0]}`);
      else if (data?.password) setError(`Пароль: ${data.password[0]}`);
      else if (data?.detail) setError(data.detail);
      else setError("Помилка реєстрації.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h2 className="mb-4">📝 Реєстрація</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Логін</label>
          <input
            className="form-control"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Пароль</label>
          <input
            className="form-control"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Повторіть пароль</label>
          <input
            className="form-control"
            type="password"
            name="password2"
            autoComplete="new-password"
            value={form.password2}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Реєстрація..." : "Зареєструватись"}
        </button>
      </form>
      <p className="mt-3 text-center">
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
