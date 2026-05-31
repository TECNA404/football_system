import React from "react";
import { deleteTournament } from "../api/tournamentsApi";

function TournamentList({ tournaments, onRefresh, onSelect, selectedId }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Видалити турнір і всі його матчі?")) return;
    await deleteTournament(id);
    onRefresh && onRefresh();
  };

  if (!tournaments || tournaments.length === 0)
    return <p className="text-muted text-center py-3">Турнірів ще немає.</p>;

  return (
    <div className="list-group">
      {tournaments.map((t) => (
        <div
          key={t.id}
          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center
            ${selectedId === t.id ? "active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => onSelect && onSelect(t)}
        >
          <div>
            <div className="fw-semibold">
              {t.name}
              {t.year && <span className="ms-2 small text-muted">({t.year})</span>}
            </div>
            <small>
              <span className={`badge ${t.is_public ? "bg-success" : "bg-secondary"} me-1`}>
                {t.is_public ? "🌍 Публічний" : "🔒 Приватний"}
              </span>
              {t.description && <span className="text-muted">{t.description}</span>}
            </small>
          </div>
          <button
            className={`btn btn-sm ${selectedId === t.id ? "btn-light" : "btn-outline-danger"}`}
            onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}

export default TournamentList;
