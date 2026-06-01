import React, { useState } from "react";
import { updateMatch, deleteMatch } from "../api/matchesApi";
import { confirmAction } from "../utils/uiUtils";

function MatchList({ matches, onRefresh }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");

  const openEdit = (m) => {
    setEditId(m.id);
    setEditForm({
      home_score: m.home_score ?? "",
      away_score: m.away_score ?? "",
      is_finished: m.is_finished,
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (id) => {
    try {
      await updateMatch(id, {
        home_score: editForm.home_score !== "" ? Number.parseInt(editForm.home_score) : null,
        away_score: editForm.away_score !== "" ? Number.parseInt(editForm.away_score) : null,
        is_finished: editForm.is_finished,
      });
      setEditId(null);
      onRefresh?.();
    } catch {
      setError("Помилка збереження.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirmAction("Видалити матч?")) return;
    await deleteMatch(id);
    onRefresh?.();
  };

  if (!matches || matches.length === 0)
    return <p className="text-muted small text-center py-3">Матчів ще немає.</p>;

  const getResultBadge = (m) => {
    if (!m.is_finished || m.home_score == null) return null;
    if (m.home_score > m.away_score)
      return <span className="badge bg-primary ms-1">П</span>;
    if (m.home_score < m.away_score)
      return <span className="badge bg-danger ms-1">П</span>;
    return <span className="badge bg-secondary ms-1">Н</span>;
  };

  return (
    <div>
      {error && <div className="alert alert-danger py-1 small">{error}</div>}
      <table className="table table-sm table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Дата</th>
            <th className="text-end">Господарі</th>
            <th className="text-center">Рахунок</th>
            <th>Гості</th>
            <th className="text-center">Статус</th>
            <th className="text-center">Дії</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id}>
              {editId === m.id ? (
                /* РЕЖИМ РЕДАГУВАННЯ */
                <>
                  <td colSpan={2} className="text-muted small">
                    {new Date(m.played_at).toLocaleDateString("uk-UA")}
                    <br />
                    <strong>{m.home_team_name}</strong>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center align-items-center">
                      <input className="form-control form-control-sm text-center p-0"
                        name="home_score" type="number" min="0"
                        value={editForm.home_score} onChange={handleChange}
                        style={{ width: 44 }} />
                      <span>:</span>
                      <input className="form-control form-control-sm text-center p-0"
                        name="away_score" type="number" min="0"
                        value={editForm.away_score} onChange={handleChange}
                        style={{ width: 44 }} />
                    </div>
                  </td>
                  <td>
                    <strong>{m.away_team_name}</strong>
                    <div className="form-check mt-1">
                      <input className="form-check-input" type="checkbox"
                        name="is_finished" checked={editForm.is_finished}
                        onChange={handleChange} id={`fin-${m.id}`} />
                      <label className="form-check-label small" htmlFor={`fin-${m.id}`}>
                        Завершено
                      </label>
                    </div>
                  </td>
                  <td />
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-success btn-sm"
                        onClick={() => handleSave(m.id)}>💾</button>
                      <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditId(null)}>✕</button>
                    </div>
                  </td>
                </>
              ) : (
                /* РЕЖИМ ПЕРЕГЛЯДУ */
                <>
                  <td className="text-muted small">
                    {new Date(m.played_at).toLocaleDateString("uk-UA", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="text-end fw-semibold">{m.home_team_name}</td>
                  <td className="text-center">
                    <span className={`badge fs-6 ${m.is_finished ? "bg-dark" : "bg-light text-dark border"}`}>
                      {m.home_score ?? "?"} : {m.away_score ?? "?"}
                    </span>
                    {getResultBadge(m)}
                  </td>
                  <td className="fw-semibold">{m.away_team_name}</td>
                  <td className="text-center">
                    {m.is_finished
                      ? <span className="badge bg-success">✓ Завершено</span>
                      : <span className="badge bg-warning text-dark">⏳ Очікується</span>}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-outline-primary btn-sm"
                        onClick={() => openEdit(m)}>✏️</button>
                      <button className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(m.id)}>🗑</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MatchList;
