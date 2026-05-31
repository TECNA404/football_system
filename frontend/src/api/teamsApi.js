import api from "./axios";

// Отримати всі команди поточного користувача
export const getTeams = () => api.get("/teams/");

// Створити команду (з логотипом або без)
export const createTeam = (name, logoFile = null, logoUrl = null) => {
  const form = new FormData();
  form.append("name", name);
  if (logoFile) form.append("logo", logoFile);
  else if (logoUrl) form.append("logo", logoUrl);

  return api.post("/teams/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateTeam = (id, logoFile, logoUrl = null) => {
  if (logoFile) {
    const form = new FormData();
    form.append("logo", logoFile);
    return api.patch(`/teams/${id}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  if (logoUrl !== null) {
    return api.patch(`/teams/${id}/`, { logo: logoUrl });
  }
  return Promise.resolve({ data: { message: "No data provided" } });
};
export const updateTeamName = (id, name) => {
    return api.patch(`/teams/${id}/`, { name });
};
export const updateTeamDescription = (id, description) => {
    return api.patch(`/teams/${id}/`, { description });
};

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
    const form = new FormData();
    form.append("team", teamId);
    form.append("name", name);
    form.append("experience_years", experience);
    if (photoFile) form.append("photo", photoFile);
    else if (photoUrl) form.append("photo", photoUrl);
    
    return api.post("/teams/coaches/", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateCoach = (coachId, name, experience, photoFile = null, photoUrl = null, description = null) => {
    const form = new FormData();
    form.append("name", name);
    form.append("experience_years", experience);
    if (description !== null) form.append("description", description);
    if (photoFile) form.append("photo", photoFile);
    else if (photoUrl) form.append("photo", photoUrl);

    return api.patch(`/teams/coaches/${coachId}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// Гравці
export const addPlayer = (teamId, name, number, position, photoFile = null, photoUrl = null) => {
    const form = new FormData();
    form.append("team", teamId);
    form.append("name", name);
    form.append("number", number);
    form.append("position", position);
    if (photoFile) form.append("photo", photoFile);
    else if (photoUrl) form.append("photo", photoUrl);

    return api.post("/teams/players/", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updatePlayer = (playerId, name, number, position, photoFile = null, photoUrl = null, description = null) => {
    const form = new FormData();
    form.append("name", name);
    form.append("number", number);
    form.append("position", position);
    if (description !== null) form.append("description", description);
    if (photoFile) form.append("photo", photoFile);
    else if (photoUrl) form.append("photo", photoUrl);

    return api.patch(`/teams/players/${playerId}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const deletePlayer = (playerId) =>
    api.delete(`/teams/players/${playerId}/`);
