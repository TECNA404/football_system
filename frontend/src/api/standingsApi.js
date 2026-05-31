import api from "./axios";

// Отримати таблицю по турніру (відсортовано: очки → різниця → голи)
export const getStandings = (tournamentId) =>
  api.get("/standings/", { params: { tournament: tournamentId } });

// Перерахувати таблицю вручну (якщо є така кнопка)
export const recalculateStandings = (tournamentId) =>
  api.post(`/standings/recalculate/`, { tournament: tournamentId });