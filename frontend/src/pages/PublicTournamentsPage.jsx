import React, { useEffect, useState } from "react";
import {
  getPublicTournaments,
  getPublicMatches,
  getPublicStandings,
} from "../api/tournamentsApi";

function PublicTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [tab, setTab] = useState("matches"); // 'matches' | 'standings'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPublicTournaments().then((res) => setTournaments(res.data));
  }, []);

  const handleSelect = async (t) => {
    setSelected(t);
    setLoading(true);
    const [mRes, sRes] = await Promise.all([
      getPublicMatches(t.id),
      getPublicStandings(t.id),
    ]);
    setMatches(mRes.data);
    setStandings(sRes.data);
    setLoading(false);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString("uk-UA") : "—";

  return (
    <div className="container mt-4">
      <h2>🌍 Публічні турніри</h2>
      <p className="text-muted">Доступно без реєстрації</p>

      {tournaments.length === 0 ? (
        <p className="text-muted">Публічних турнірів поки немає.</p>
      ) : (
        <div className="row g-3 mb-4">
          {tournaments.map((t) => (
            <div key={t.id} className="col-md-4">
              <div
                className={`card h-100 ${selected?.id === t.id ? "border-primary shadow" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleSelect(t)}
              >
                <div className="card-body">
                  <h5 className="card-title">{t.name}</h5>
                  <p className="card-text text-muted small">
                    {t.year && <span>📅 {t.year}<br /></span>}
                    {t.description && <span>{t.description}<br /></span>}
                    <span>Організатор: <strong>{t.owner}</strong></span>
                  </p>
                </div>
                <div className="card-footer">
                  <button className="btn btn-outline-primary btn-sm w-100">
                    {selected?.id === t.id ? "✓ Обрано" : "Переглянути"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <>
          <h4 className="mb-3">📋 {selected.name}</h4>

          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "matches" ? "active" : ""}`}
                onClick={() => setTab("matches")}
              >⚽ Матчі</button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "standings" ? "active" : ""}`}
                onClick={() => setTab("standings")}
              >📊 Таблиця</button>
            </li>
          </ul>

          {loading ? (
            <p className="text-muted">Завантаження...</p>
          ) : tab === "matches" ? (
            matches.length === 0 ? (
              <p className="text-muted">Матчів ще немає.</p>
            ) : (
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Домашня</th>
                    <th className="text-center">Рахунок</th>
                    <th>Гостьова</th>
                    <th>Дата</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.home_team}</strong></td>
                      <td className="text-center fw-bold fs-5">
                        {m.home_score !== null && m.away_score !== null
                          ? `${m.home_score} : ${m.away_score}`
                          : "—"}
                      </td>
                      <td><strong>{m.away_team}</strong></td>
                      <td>{fmt(m.played_at)}</td>
                      <td>
                        {m.is_finished
                          ? <span className="badge bg-success">Завершено</span>
                          : <span className="badge bg-warning text-dark">Заплановано</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            standings.length === 0 ? (
              <p className="text-muted">Завершених матчів немає.</p>
            ) : (
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th><th>Команда</th><th>І</th><th>В</th>
                    <th>Н</th><th>П</th><th>ГЗ</th><th>ГП</th><th>РГ</th><th>О</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr key={row.team_id} className={i === 0 ? "table-success" : ""}>
                      <td>{i + 1}{i === 0 && " 🏆"}</td>
                      <td><strong>{row.team_name}</strong></td>
                      <td>{row.played}</td>
                      <td>{row.wins}</td>
                      <td>{row.draws}</td>
                      <td>{row.losses}</td>
                      <td>{row.goals_for}</td>
                      <td>{row.goals_against}</td>
                      <td>{row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}</td>
                      <td><strong>{row.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </>
      )}
    </div>
  );
}

export default PublicTournamentsPage;
