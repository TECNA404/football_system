import React, { useEffect, useState } from "react";
import { getTeams, createTeam, deleteTeam, updateTeam, updateTeamName } from "../api/teamsApi";

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [name, setName] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Редагування імені
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const load = () => getTeams().then((r) => setTeams(r.data));

    useEffect(() => { load(); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogoFile(file || null);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await createTeam(name, logoFile);
            setName("");
            setLogoFile(null);
            setPreview(null);
            load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.name?.[0] || data?.detail || "Помилка при створенні.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpdate = async (id, e) => {
        const file = e.target.files[0];
        if (!file) return;
        await updateTeam(id, file);
        load();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Видалити команду?")) return;
        await deleteTeam(id);
        load();
    };

    const startEdit = (team) => {
        setEditingId(team.id);
        setEditingName(team.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleNameSave = async (id) => {
        if (!editingName.trim()) return;
        await updateTeamName(id, editingName.trim());
        setEditingId(null);
        load();
    };

    return (
        <div className="container mt-4">
            <h2>🏟️ Мої команди</h2>

            <form onSubmit={handleCreate} className="card p-3 mb-4">
                <div className="row g-2 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label">Назва команди</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Наприклад: Барса"
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Логотип (необов'язково)</label>
                        <input
                            className="form-control"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="col-md-1">
                        {preview && (
                            <img src={preview} alt="preview" width={48} height={48}
                                style={{ objectFit: "cover", borderRadius: 8 }} />
                        )}
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "..." : "Додати"}
                        </button>
                    </div>
                </div>
                {error && <div className="text-danger mt-2">{error}</div>}
            </form>

            {teams.length === 0 ? (
                <p className="text-muted">Команд ще немає. Створіть першу!</p>
            ) : (
                <div className="row g-3">
                    {teams.map((team) => (
                        <div key={team.id} className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body d-flex align-items-center gap-3">
                                    {/* Лого */}
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        {team.logo_url ? (
                                            <img
                                                src={team.logo_url}
                                                alt={team.name}
                                                width={60}
                                                height={60}
                                                style={{ borderRadius: "50%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 60, height: 60, borderRadius: "50%",
                                                background: "#3b82f6", color: "#fff",
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700, fontSize: 22, flexShrink: 0,
                                            }}>
                                                {team.name?.slice(0, 2).toUpperCase() || "⚽"}
                                            </div>
                                        )}
                                        {/* Кнопка заміни лого */}
                                        <label title="Змінити лого" style={{
                                            position: "absolute", bottom: -4, right: -4,
                                            background: "#0d6efd", borderRadius: "50%",
                                            width: 22, height: 22,
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer", fontSize: 12, color: "white",
                                        }}>
                                            ✏️
                                            <input type="file" accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) => handleLogoUpdate(team.id, e)} />
                                        </label>
                                    </div>

                                    {/* Інфо */}
                                    <div className="flex-grow-1">
                                        {editingId === team.id ? (
                                            <div className="d-flex gap-1">
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleNameSave(team.id);
                                                        if (e.key === "Escape") cancelEdit();
                                                    }}
                                                    autoFocus
                                                />
                                                <button className="btn btn-success btn-sm"
                                                    onClick={() => handleNameSave(team.id)}>✓</button>
                                                <button className="btn btn-secondary btn-sm"
                                                    onClick={cancelEdit}>✕</button>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center gap-2">
                                                <h5 className="mb-0">{team.name}</h5>
                                                <button
                                                    className="btn btn-link btn-sm p-0 text-muted"
                                                    title="Редагувати назву"
                                                    onClick={() => startEdit(team)}
                                                >✏️</button>
                                            </div>
                                        )}
                                        <small className="text-muted">
                                            {new Date(team.created_at).toLocaleDateString("uk-UA")}
                                        </small>
                                    </div>

                                    {/* Видалити */}
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(team.id)}
                                    >🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TeamsPage;
