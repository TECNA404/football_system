import React from "react";
import { deleteTeam } from "../api/teamsApi";

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='55%25' font-size='20' text-anchor='middle' dominant-baseline='middle'%3E⚽%3C/text%3E%3C/svg%3E";
function TeamList({ teams, onRefresh }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Видалити команду?")) return;
    await deleteTeam(id);
    onRefresh && onRefresh();
  };

  if (!teams || teams.length === 0)
    return <p className="text-muted text-center py-3">Команд ще немає.</p>;

  return (
    <div className="row g-2">
      {teams.map((t) => (
        <div key={t.id} className="col-md-4 col-lg-3">
          <div className="card d-flex flex-row align-items-center p-2 gap-2">
            <img
              src={t.logo_url || FALLBACK}
              alt={t.name}
              width={40} height={40}
              style={{ objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              onError={(e) => { e.target.src = FALLBACK; }}
            />
            <div className="flex-grow-1 overflow-hidden">
              <div className="fw-semibold text-truncate">{t.name}</div>
              <small className="text-muted">
                {new Date(t.created_at).toLocaleDateString("uk-UA")}
              </small>
            </div>
            <button className="btn btn-outline-danger btn-sm"
              onClick={() => handleDelete(t.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TeamList;
