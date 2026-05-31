import React, { useEffect, useState } from "react";
import { getStandings, recalculateStandings } from "../api/standingsApi";
import { getTournaments } from "../api/tournamentsApi";

function getTiebreakNote(row, allRows) {
  const tied = allRows.filter(
    (r) =>
      r.team !== row.team &&
      r.points === row.points &&
      r.goal_difference === row.goal_difference &&
      r.goals_for === row.goals_for
  );
  if (tied.length === 0) return null;
  const rival = tied[0];
  const myIdx = allRows.findIndex((r) => r.team === row.team);
  const rivalIdx = allRows.findIndex((r) => r.team === rival.team);
  if (myIdx < rivalIdx) return "↑ алфавітний порядок";
  return null;
}

function StandingsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getTournaments().then((res) => setTournaments(res.data));
  }, []);

  const loadStandings = (tid) => {
    if (!tid) { setStandings([]); return; }
    setLoading(true);
    setError("");
    getStandings(tid)
      .then((res) => setStandings(res.data))
      .catch(() => setError("Не вдалося завантажити таблицю."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStandings(selectedTournament);
  }, [selectedTournament]);

  const handleRecalculate = async () => {
    if (!selectedTournament) return;
    setRecalcLoading(true);
    setRecalcMsg("");
    try {
      const res = await recalculateStandings(selectedTournament);
      setRecalcMsg(res.data.detail);
      loadStandings(selectedTournament);
    } catch {
      setRecalcMsg("Помилка перерахунку.");
    } finally {
      setRecalcLoading(false);
      setTimeout(() => setRecalcMsg(""), 4000);
    }
  };

  const winner = standings.length > 0 ? standings[0] : null;

  const hasTie = standings.some(
    (row, i) =>
      i > 0 &&
      standings[i - 1].points === row.points &&
      standings[i - 1].goal_difference === row.goal_difference &&
      standings[i - 1].goals_for === row.goals_for
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">📊 Таблиця турніру</h2>
        {selectedTournament && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleRecalculate}
            disabled={recalcLoading}
          >
            {recalcLoading ? "⏳ Рахую..." : "🔄 Перерахувати"}
          </button>
        )}
      </div>

      {recalcMsg && (
        <div className="alert alert-info py-2 small">{recalcMsg}</div>
      )}

      <div className="mb-4">
        <select
          className="form-select w-auto"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">Оберіть турнір</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}{t.year ? ` (${t.year})` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-muted">Завантаження...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && standings.length === 0 && selectedTournament && (
        <div className="text-center py-4 text-muted">
          <div style={{ fontSize: "2rem" }}>⚽</div>
          <p>Завершених матчів ще немає.<br />
            Додайте матчі та натисніть <strong>🔄 Перерахувати</strong>.
          </p>
        </div>
      )}

      {/* Банер переможця */}
      {winner && standings.length > 1 && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: "1.5rem" }}>🏆</span>
          <div>
            <strong>{winner.team_name}</strong> лідирує
            {winner.points !== standings[1]?.points ? (
              <span className="text-muted ms-1">
                ({winner.points} очок — на {winner.points - standings[1].points} більше)
              </span>
            ) : winner.goal_difference !== standings[1]?.goal_difference ? (
              <span className="text-muted ms-1">
                (рівні очки, краща різниця: {winner.goal_difference > 0 ? "+" : ""}
                {winner.goal_difference})
              </span>
            ) : (
              <span className="text-muted ms-1">(рівні показники)</span>
            )}
          </div>
        </div>
      )}

      {hasTie && (
        <div className="alert alert-warning py-2 small">
          ⚠️ Деякі команди мають однакові показники
        </div>
      )}

      {standings.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Команда</th>
                  <th title="Зіграно ігор">І</th>
                  <th title="Виграші">В</th>
                  <th title="Нічиї">Н</th>
                  <th title="Поразки">П</th>
                  <th title="Голів забито">ГЗ</th>
                  <th title="Голів пропущено">ГП</th>
                  <th title="Різниця голів">РГ</th>
                  <th title="Очки">О</th>
                  <th>Примітка</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, index) => {
                  const note = getTiebreakNote(row, standings);
                  const isWinner = index === 0;
                  const isTied =
                    (index < standings.length - 1 &&
                      standings[index + 1].points === row.points &&
                      standings[index + 1].goal_difference === row.goal_difference &&
                      standings[index + 1].goals_for === row.goals_for) ||
                    (index > 0 &&
                      standings[index - 1].points === row.points &&
                      standings[index - 1].goal_difference === row.goal_difference &&
                      standings[index - 1].goals_for === row.goals_for);

                  return (
                    <tr
                      key={row.id}
                      className={
                        isWinner ? "table-success" : isTied ? "table-warning" : ""
                      }
                    >
                      <td>{index + 1}{isWinner && standings.length > 1 && " 🏆"}</td>
                      <td><strong>{row.team_name}</strong></td>
                      {/* ✅ Правильні назви полів із серіалайзера */}
                      <td>{row.played}</td>
                      <td>{row.won}</td>
                      <td>{row.drawn}</td>
                      <td>{row.lost}</td>
                      <td>{row.goals_for}</td>
                      <td>{row.goals_against}</td>
                      <td>
                        {row.goal_difference > 0
                          ? `+${row.goal_difference}`
                          : row.goal_difference}
                      </td>
                      <td><strong>{row.points}</strong></td>
                      <td className="text-muted small">
                        {note
                          ? <span className="text-success fw-semibold">{note}</span>
                          : isTied
                          ? <span className="text-warning">= рівні</span>
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-muted small mt-1">
            І — ігри · В — виграші · Н — нічиї · П — поразки ·
            ГЗ — голи забиті · ГП — голи пропущені · РГ — різниця · О — очки
          </div>
          <div className="text-muted small">
            * Рівність: 1) різниця голів → 2) голів забито → 3) алфавіт
          </div>
        </>
      )}
    </div>
  );
}

export default StandingsPage;
