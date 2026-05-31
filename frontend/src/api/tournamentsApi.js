import api from "./axios";
import axios from "axios";

// Публічний клієнт — без токена, для перегляду без реєстрації
const publicApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// ─── Приватні (потрібна авторизація) ───────────────────────────

// Отримати всі турніри поточного користувача
export const getTournaments = () => api.get("/tournaments/");

// Створити турнір
export const createTournament = (data) => api.post("/tournaments/", data);

// Оновити турнір (часткове оновлення)
export const updateTournament = (id, data) => api.patch(`/tournaments/${id}/`, data);

// Видалити турнір
export const deleteTournament = (id) => api.delete(`/tournaments/${id}/`);

// ─── Публічні (без реєстрації) ─────────────────────────────────

// Список всіх публічних турнірів
export const getPublicTournaments = () =>
  publicApi.get("/tournaments/public/");

// Матчі публічного турніру
export const getPublicMatches = (tournamentId) =>
  publicApi.get(`/tournaments/public/${tournamentId}/matches/`);

// Таблиця публічного турніру
export const getPublicStandings = (tournamentId) =>
  publicApi.get(`/tournaments/public/${tournamentId}/standings/`);

export const getPublicTournamentMatches = getPublicMatches;
export const getPublicTournamentStandings = getPublicStandings;