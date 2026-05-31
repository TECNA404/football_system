import React, { useState } from "react";
import { createTournament } from "../api/tournamentsApi";

function TournamentForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", year: "", description: "", is_public: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createTournament({
        name: form.name,
        year: form.year ? parseInt(form.year) : null,
        description: form.description || "",
        is_public: form.is_public,
      });
      setForm({ name: "", year: "", description: "", is_public: false });
      onCreated && onCreated();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.name?.[0] || data?.year?.[0] || "Помилка при створенні.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-3 border-primary">
      <h6 className="text-primary mb-3">+ Новий турнір</h6>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="row g-2">
        <div className="col-md-5">
          <label className="form-label small mb-1">Назва *</label>
          <input className="form-control form-control-sm" name="name"
            value={form.name} onChange={handleChange}
            placeholder="Ліга весни 2026" required />
        </div>
        <div className="col-md-2">
          <label className="form-label small mb-1">Рік</label>
          <input className="form-control form-control-sm" name="year"
            type="number" min="2000" max="2100"
            value={form.year} onChange={handleChange} placeholder="2026" />
        </div>
        <div className="col-md-5">
          <label className="form-label small mb-1">Опис</label>
          <input className="form-control form-control-sm" name="description"
            value={form.description} onChange={handleChange} placeholder="Необов'язково" />
        </div>
        <div className="col-12">
          <div
            className={`form-check p-2 rounded border small ${form.is_public ? "border-success bg-success bg-opacity-10" : "border-secondary"}`}
            style={{ cursor: "pointer" }}
            onClick={() => setForm((p) => ({ ...p, is_public: !p.is_public }))}
          >
            <input className="form-check-input" type="checkbox" name="is_public"
              checked={form.is_public} onChange={handleChange}
              onClick={(e) => e.stopPropagation()} />
            <label className="form-check-label ms-2" style={{ cursor: "pointer" }}>
              <strong>🌍 Публічний</strong>
              <span className="text-muted ms-1">— доступно без реєстрації</span>
            </label>
          </div>
        </div>
        <div className="col-12">
          <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
            {loading ? "Створення..." : "✓ Створити"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default TournamentForm;
