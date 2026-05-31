import api from "./axios";

// Отримати всі матчі (можна фільтрувати по турніру)
export const getMatches = (tournamentId = null) => {
  const params = tournamentId ? { tournament: tournamentId } : {};
  return api.get("/matches/", { params });
};

// Створити матч
export const createMatch = (data) => api.post("/matches/", data);

// Оновити матч (рахунок, статус)
export const updateMatch = (id, data) => api.patch(`/matches/${id}/`, data);

// Видалити матч
export const deleteMatch = (id) => api.delete(`/matches/${id}/`);