import React, { useEffect, useState } from "react";
import {
  getTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
} from "../api/tournamentsApi";

function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm] = useState({ name: "", year: "", description: "", is_public: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState("");

  const load = () => getTournaments().then((r) => setTournaments(r.data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreate = async (e) => {
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
      setShowForm(false);
      load();
    } catch (err) {
      const data = err.response?.data;
      if (data?.name) setError(`Назва: ${data.name[0]}`);
      else if (data?.year) setError(`Рік: ${data.year[0]}`);
      else setError("Помилка при створенні.");
    } finally {
      setLoading(false);
    }
  };

  // Відкрити редагування
  const handleEditOpen = (t) => {
    setEditId(t.id);
    setEditForm({
      name: t.name,
      year: t.year || "",
      description: t.description || "",
      is_public: t.is_public,
    });
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditSave = async (id) => {
    setEditError("");
    try {
      await updateTournament(id, {
        name: editForm.name,
        year: editForm.year ? parseInt(editForm.year) : null,
        description: editForm.description || "",
        is_public: editForm.is_public,
      });
      setEditId(null);
      load();
    } catch (err) {
      const data = err.response?.data;
      if (data?.name) setEditError(`Назва: ${data.name[0]}`);
      else setEditError("Помилка збереження.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити турнір і всі його матчі?")) return;
    await deleteTournament(id);
    load();
  };

  const publicCount = tournaments.filter((t) => t.is_public).length;
  const privateCount = tournaments.filter((t) => !t.is_public).length;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">🏆 Мої турніри</h2>
          <small className="text-muted">
            {publicCount} публічних · {privateCount} приватних
          </small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Скасувати" : "+ Новий турнір"}
        </button>
      </div>

      {/* Форма створення */}
      {showForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">Новий турнір</div>
          <div className="card-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label">Назва *</label>
                  <input className="form-control" name="name" value={form.name}
                    onChange={handleChange} placeholder="Ліга весни 2026" required />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Рік</label>
                  <input className="form-control" name="year" type="number"
                    min="2000" max="2100" value={form.year}
                    onChange={handleChange} placeholder="2026" />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Опис</label>
                  <input className="form-control" name="description"
                    value={form.description} onChange={handleChange}
                    placeholder="Необов'язково" />
                </div>
                <div className="col-12">
                  <div
                    className={`form-check p-3 rounded border ${form.is_public ? "border-success bg-success bg-opacity-10" : "border-secondary"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setForm((p) => ({ ...p, is_public: !p.is_public }))}
                  >
                    <input className="form-check-input" type="checkbox" name="is_public"
                      id="is_public" checked={form.is_public}
                      onChange={handleChange} onClick={(e) => e.stopPropagation()} />
                    <label className="form-check-label ms-2" htmlFor="is_public" style={{ cursor: "pointer" }}>
                      <strong>🌍 Зробити публічним</strong>
                      <span className="text-muted ms-2 small">
                        — матчі та таблицю зможуть переглядати всі без реєстрації
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Створення..." : "✓ Створити"}
                  </button>
                  <button className="btn btn-outline-secondary" type="button"
                    onClick={() => setShowForm(false)}>Скасувати</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список */}
      {tournaments.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: "3rem" }}>🏆</div>
          <p className="mt-2">Турнірів ще немає. Створіть перший!</p>
        </div>
      ) : (
        <div className="row g-3">
          {tournaments.map((t) => (
            <div key={t.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {editId === t.id ? (
                  /* ===== РЕЖИМ РЕДАГУВАННЯ ===== */
                  <div className="card-body">
                    <h6 className="text-primary mb-3">✏️ Редагування</h6>
                    {editError && (
                      <div className="alert alert-danger py-1 small">{editError}</div>
                    )}
                    <div className="mb-2">
                      <label className="form-label small mb-1">Назва *</label>
                      <input className="form-control form-control-sm" name="name"
                        value={editForm.name} onChange={handleEditChange} required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small mb-1">Рік</label>
                      <input className="form-control form-control-sm" name="year"
                        type="number" min="2000" max="2100"
                        value={editForm.year} onChange={handleEditChange} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small mb-1">Опис</label>
                      <input className="form-control form-control-sm" name="description"
                        value={editForm.description} onChange={handleEditChange} />
                    </div>
                    <div className="mb-3">
                      <div
                        className={`form-check p-2 rounded border small ${editForm.is_public ? "border-success bg-success bg-opacity-10" : "border-secondary"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setEditForm((p) => ({ ...p, is_public: !p.is_public }))}
                      >
                        <input className="form-check-input" type="checkbox"
                          name="is_public" checked={editForm.is_public}
                          onChange={handleEditChange}
                          onClick={(e) => e.stopPropagation()} />
                        <label className="form-check-label ms-1" style={{ cursor: "pointer" }}>
                          {editForm.is_public ? "🌍 Публічний" : "🔒 Приватний"}
                        </label>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm flex-grow-1"
                        onClick={() => handleEditSave(t.id)}>
                        💾 Зберегти
                      </button>
                      <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditId(null)}>
                        Скасувати
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ===== РЕЖИМ ПЕРЕГЛЯДУ ===== */
                  <>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title mb-1">{t.name}</h5>
                        <span className={`badge ${t.is_public ? "bg-success" : "bg-secondary"}`}>
                          {t.is_public ? "🌍 Публічний" : "🔒 Приватний"}
                        </span>
                      </div>
                      {t.year && <p className="text-muted small mb-1">📅 {t.year}</p>}
                      {t.description && (
                        <p className="card-text small text-muted">{t.description}</p>
                      )}
                      {t.is_public && (
                        <div className="mt-2 p-2 bg-light rounded small">
                          <span className="text-muted">🔗 Посилання:</span>{" "}
                          <a href={`/tournaments/public#${t.id}`}
                            target="_blank" rel="noopener noreferrer">
                            /tournaments/public#{t.id}
                          </a>
                          <button className="btn btn-link btn-sm p-0 ms-1"
                            onClick={() => navigator.clipboard.writeText(
                              `${window.location.origin}/tournaments/public#${t.id}`
                            )} title="Скопіювати">📋</button>
                        </div>
                      )}
                    </div>
                    <div className="card-footer d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {new Date(t.created_at).toLocaleDateString("uk-UA")}
                      </small>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEditOpen(t)}>
                          ✏️ Редагувати
                        </button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(t.id)}>
                          🗑
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TournamentsPage;
