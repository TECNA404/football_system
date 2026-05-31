import api from "./axios";

// Отримати всі команди поточного користувача
export const getTeams = () => api.get("/teams/");

// Створити команду (з логотипом або без)
export const createTeam = (name, logoFile = null) => {
  const form = new FormData();
  form.append("name", name);
  if (logoFile) form.append("logo", logoFile);
  return api.post("/teams/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateTeam = (id, logoFile) => {
  const form = new FormData();
  if (logoFile) form.append("logo", logoFile);
  return api.patch(`/teams/${id}/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const updateTeamName = (id, name) => {
    const form = new FormData();
    form.append("name", name);
    return api.patch(`/teams/${id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// Видалити команду
export const deleteTeam = (id) => api.delete(`/teams/${id}/`);
