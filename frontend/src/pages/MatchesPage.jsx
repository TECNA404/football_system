import React, { useEffect, useState } from "react";
import { getMatches, createMatch, updateMatch, deleteMatch } from "../api/matchesApi";
import { getTournaments } from "../api/tournamentsApi";
import { getTeams } from "../api/teamsApi";

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [form, setForm] = useState({
    tournament: "",
    home_team: "",
    away_team: "",
    played_at: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getTournaments(), getTeams()]).then(([tRes, tmRes]) => {
      setTournaments(tRes.data);
      setTeams(tmRes.data);
    });
  }, []);

  useEffect(() => {
    getMatches(selectedTournament || undefined).then((res) =>
      setMatches(res.data)
    );
  }, [selectedTournament]);

  const reload = () =>
    getMatches(selectedTournament || undefined).then((res) =>
      setMatches(res.data)
    );

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createMatch({
        tournament: parseInt(form.tournament),
        home_team: parseInt(form.home_team),
        away_team: parseInt(form.away_team),
        played_at: new Date(form.played_at).toISOString(),
      });
      setForm({ tournament: "", home_team: "", away_team: "", played_at: "" });
      reload();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Помилка при створенні матчу.");
    }
  };

  const handleFinish = async (match) => {
    const home = prompt("Голів домашня команда:", match.home_score ?? "0");
    if (home === null) return;
    const away = prompt("Голів гостьова команда:", match.away_score ?? "0");
    if (away === null) return;
    await updateMatch(match.id, {
      home_score: parseInt(home),
      away_score: parseInt(away),
      is_finished: true,
    });
    reload();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити матч?")) return;
    await deleteMatch(id);
    reload();
  };

  const formatDate = (dt) =>
    dt ? new Date(dt).toLocaleString("uk-UA") : "—";

  return (
    <div className="container mt-4">
      <h2>⚽ Матчі</h2>

      {/* Фільтр по турніру */}
      <div className="mb-3">
        <select
          className="form-select w-auto"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">Всі турніри</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}{t.year ? ` (${t.year})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Форма створення */}
      <form onSubmit={handleCreate} className="border rounded p-3 mb-4 bg-light">
        <h5>Новий матч</h5>
        <div className="row g-2">
          <div className="col-md-3">
            <select
              className="form-select"
              value={form.tournament}
              onChange={(e) => setForm({ ...form, tournament: e.target.value })}
              required
            >
              <option value="">Турнір</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={form.home_team}
              onChange={(e) => setForm({ ...form, home_team: e.target.value })}
              required
            >
              <option value="">Домашня команда</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={form.away_team}
              onChange={(e) => setForm({ ...form, away_team: e.target.value })}
              required
            >
              <option value="">Гостьова команда</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="datetime-local"
              className="form-control"
              value={form.played_at}
              onChange={(e) => setForm({ ...form, played_at: e.target.value })}
              required
            />
          </div>
        </div>
        {error && <div className="text-danger mt-2 small">{error}</div>}
        <button className="btn btn-primary mt-3">Додати матч</button>
      </form>

      {/* Таблиця матчів */}
      {matches.length === 0 ? (
        <p className="text-muted">Матчів ще немає.</p>
      ) : (
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Турнір</th>
              <th>Домашня</th>
              <th className="text-center">Рахунок</th>
              <th>Гостьова</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{m.tournament_name}</td>
                <td>{m.home_team_name}</td>
                <td className="text-center fw-bold">
                  {m.home_score !== null && m.away_score !== null
                    ? `${m.home_score} : ${m.away_score}`
                    : "—"}
                </td>
                <td>{m.away_team_name}</td>
                <td>{formatDate(m.played_at)}</td>
                <td>
                  {m.is_finished ? (
                    <span className="badge bg-success">Завершено</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Заплановано</span>
                  )}
                </td>
                <td>
                  {!m.is_finished && (
                    <button
                      className="btn btn-sm btn-outline-success me-1"
                      onClick={() => handleFinish(m)}
                    >
                      Рахунок
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(m.id)}
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MatchesPage;

