import React, { useState, useEffect } from "react";
import { getTeams } from "../api/teamsApi";
import { createMatch } from "../api/matchesApi";

function MatchForm({ tournamentId, onCreated }) {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    home_team: "",
    away_team: "",
    home_score: "",
    away_score: "",
    played_at: "",
    is_finished: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTeams().then((r) => setTeams(r.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.home_team === form.away_team) {
      setError("Команди не можуть бути однаковими.");
      return;
    }
    setLoading(true);
    try {
      await createMatch({
        tournament: tournamentId,
        home_team: parseInt(form.home_team),
        away_team: parseInt(form.away_team),
        home_score: form.home_score !== "" ? parseInt(form.home_score) : null,
        away_score: form.away_score !== "" ? parseInt(form.away_score) : null,
        played_at: form.played_at,
        is_finished: form.is_finished,
      });
      setForm({
        home_team: "", away_team: "",
        home_score: "", away_score: "",
        played_at: "", is_finished: false,
      });
      onCreated && onCreated();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.non_field_errors?.[0] ||
        data?.home_team?.[0] ||
        data?.away_team?.[0] ||
        data?.played_at?.[0] ||
        "Помилка при створенні матчу."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-3 border-primary">
      <h6 className="text-primary mb-3">+ Додати матч</h6>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="row g-2 align-items-end">
        {/* Команда господарів */}
        <div className="col-md-3">
          <label className="form-label small mb-1">🏠 Господарі *</label>
          <select className="form-select form-select-sm" name="home_team"
            value={form.home_team} onChange={handleChange} required>
            <option value="">Оберіть команду</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Рахунок */}
        <div className="col-md-2">
          <label className="form-label small mb-1">Рахунок</label>
          <div className="d-flex gap-1 align-items-center">
            <input className="form-control form-control-sm text-center" name="home_score"
              type="number" min="0" value={form.home_score}
              onChange={handleChange} placeholder="—" style={{ width: 50 }} />
            <span>:</span>
            <input className="form-control form-control-sm text-center" name="away_score"
              type="number" min="0" value={form.away_score}
              onChange={handleChange} placeholder="—" style={{ width: 50 }} />
          </div>
        </div>

        {/* Команда гостей */}
        <div className="col-md-3">
          <label className="form-label small mb-1">✈️ Гості *</label>
          <select className="form-select form-select-sm" name="away_team"
            value={form.away_team} onChange={handleChange} required>
            <option value="">Оберіть команду</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Дата */}
        <div className="col-md-2">
          <label className="form-label small mb-1">📅 Дата *</label>
          <input className="form-control form-control-sm" name="played_at"
            type="datetime-local" value={form.played_at}
            onChange={handleChange} required />
        </div>

        {/* Завершено */}
        <div className="col-md-1">
          <div className="form-check mt-3">
            <input className="form-check-input" type="checkbox" name="is_finished"
              id="is_finished" checked={form.is_finished} onChange={handleChange} />
            <label className="form-check-label small" htmlFor="is_finished">
              Фінал
            </label>
          </div>
        </div>

        <div className="col-md-1">
          <button className="btn btn-primary btn-sm w-100" type="submit" disabled={loading}>
            {loading ? "..." : "✓"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default MatchForm;
