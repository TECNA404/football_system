import api from "./axios";
import { buildFormData, multipartConfig } from "../utils/apiUtils";

// Отримати всі команди поточного користувача
export const getTeams = () => api.get("/teams/");

// Створити команду (з логотипом або без)
export const createTeam = (name, logoFile = null, logoUrl = null) => {
  const form = buildFormData({
    name,
    logo: logoFile || logoUrl,
  });

  return api.post("/teams/", form, multipartConfig);
};

export const updateTeam = (id, logoFile, logoUrl = null) => {
  if (logoFile || logoUrl !== null) {
    const form = buildFormData({ logo: logoFile || logoUrl });
    return api.patch(`/teams/${id}/`, form, multipartConfig);
  }
  return Promise.resolve({ data: { message: "No data provided" } });
};

export const updateTeamName = (id, name) => api.patch(`/teams/${id}/`, { name });
export const updateTeamDescription = (id, description) => api.patch(`/teams/${id}/`, { description });

// Видалити команду
export const deleteTeam = (id) => api.delete(`/teams/${id}/`);

// Отримати команду за ID
export const getTeam = (id) => api.get(`/teams/${id}/`);

// Отримати тренера за ID
export const getCoach = (id) => api.get(`/teams/coaches/${id}/`);

// Отримати гравця за ID
export const getPlayer = (id) => api.get(`/teams/players/${id}/`);

// Тренери
export const createCoach = (teamId, name, experience, photoFile = null, photoUrl = null) => {
    const form = buildFormData({
        team: teamId,
        name,
        experience_years: experience,
        photo: photoFile || photoUrl,
    });

    return api.post("/teams/coaches/", form, multipartConfig);
};

export const updateCoach = (coachId, name, experience, photoFile = null, photoUrl = null, description = null) => {
    const form = buildFormData({
        name,
        experience_years: experience,
        description,
        photo: photoFile || photoUrl,
    });

    return api.patch(`/teams/coaches/${coachId}/`, form, multipartConfig);
};

// Гравці
export const addPlayer = (teamId, name, number, position, photoFile = null, photoUrl = null) => {
    const form = buildFormData({
        team: teamId,
        name,
        number,
        position,
        photo: photoFile || photoUrl,
    });

    return api.post("/teams/players/", form, multipartConfig);
};

export const updatePlayer = (playerId, name, number, position, photoFile = null, photoUrl = null, description = null) => {
    const form = buildFormData({
        name,
        number,
        position,
        description,
        photo: photoFile || photoUrl,
    });

    return api.patch(`/teams/players/${playerId}/`, form, multipartConfig);
};

export const deletePlayer = (playerId) =>
    api.delete(`/teams/players/${playerId}/`);
