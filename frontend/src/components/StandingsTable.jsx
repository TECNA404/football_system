import React from "react";

function StandingsTable({ standings }) {
  if (!standings || standings.length === 0)
    return <p className="text-muted text-center py-3">Таблиця порожня — додайте завершені матчі.</p>;

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle text-center">
        <thead className="table-dark">
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th className="text-start">Команда</th>
            <th title="Ігри">І</th>
            <th title="Перемоги">П</th>
            <th title="Нічиї">Н</th>
            <th title="Поразки">Пор</th>
            <th title="Голи забиті">ГЗ</th>
            <th title="Голи пропущені">ГП</th>
            <th title="Різниця голів">±</th>
            <th title="Очки" className="text-warning">Оч</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, index) => (
            <tr key={s.id}
              className={
                index === 0 ? "table-success fw-bold" :
                index === 1 ? "table-warning" :
                index === 2 ? "table-info" : ""
              }>
              <td>{index + 1}</td>
              <td className="text-start">
                {index === 0 && "🥇 "}
                {index === 1 && "🥈 "}
                {index === 2 && "🥉 "}
                {s.team_name}
              </td>
              <td>{s.games_played}</td>
              <td className="text-success">{s.wins}</td>
              <td>{s.draws}</td>
              <td className="text-danger">{s.losses}</td>
              <td>{s.goals_for}</td>
              <td>{s.goals_against}</td>
              <td className={s.goal_difference > 0 ? "text-success" :
                             s.goal_difference < 0 ? "text-danger" : ""}>
                {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
              </td>
              <td className="fw-bold fs-5">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StandingsTable;
