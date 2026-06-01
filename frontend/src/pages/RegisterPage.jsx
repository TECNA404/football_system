import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { publicApi } from "../api/axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../components/AuthContext";
import { getApiErrorMessage } from "../utils/apiUtils";

function RegisterPage() {
  const { t, i18n } = useTranslation();
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
      setError(i18n.language === 'uk' ? "Паролі не співпадають." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Реєстрація
      await publicApi.post("/users/register/", {
        username: form.username,
        password: form.password,
      });

      // Автологін після реєстрації
      const res = await publicApi.post("/users/token/", {
        username: form.username,
        password: form.password,
      });
      login(res.data.access, res.data.refresh, form.username);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 animate-fade-in" style={{ maxWidth: 450 }}>
      <div className="card auth-card shadow-lg border-0">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <span className="display-4">📝</span>
            <h2 className="fw-bold mt-2">{t('auth.register_title')}</h2>
            <p className="text-muted">Football System</p>
          </div>

          {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold text-muted small">{t('auth.username')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">👤</span>
                <input
                  className="form-control bg-light border-start-0"
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={t('auth.username')}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold text-muted small">{t('auth.password')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">🔒</span>
                <input
                  className="form-control bg-light border-start-0"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold text-muted small">{i18n.language === 'uk' ? 'Повторіть пароль' : 'Repeat password'}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">🔒</span>
                <input
                  className="form-control bg-light border-start-0"
                  type="password"
                  name="password2"
                  autoComplete="new-password"
                  value={form.password2}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
              </div>
            </div>
            <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('common.loading')}
                </>
              ) : t('auth.register_btn')}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-muted small">
              {t('auth.has_account')} <Link to="/login" className="text-primary fw-bold text-decoration-none">{t('auth.login_title')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
