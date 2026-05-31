import { useState, useEffect } from "react";
import { 
    getTeams, createTeam, deleteTeam, updateTeam, updateTeamName, updateTeamDescription,
    createCoach, updateCoach, addPlayer, updatePlayer, deletePlayer 
} from "../api/teamsApi";

export const useTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadTeams = async () => {
        setLoading(true);
        try {
            const response = await getTeams();
            setTeams(response.data);
        } catch (err) {
            setError("Помилка при завантаженні команд.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeams();
    }, []);

    const handleCreateTeam = async (name, logoFile, logoUrl = null) => {
        setError("");
        setLoading(true);
        try {
            await createTeam(name, logoFile, logoUrl);
            await loadTeams();
            return { success: true };
        } catch (err) {
            const data = err.response?.data;
            const message = data?.name?.[0] || data?.detail || "Помилка при створенні.";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async (id) => {
        try {
            await deleteTeam(id);
            await loadTeams();
            return { success: true };
        } catch (err) {
            setError("Помилка при видаленні команди.");
            return { success: false };
        }
    };

    const handleUpdateLogo = async (id, file, url = null) => {
        try {
            await updateTeam(id, file, url);
            await loadTeams();
            return { success: true };
        } catch (err) {
            const data = err.response?.data;
            const message = data?.logo?.[0] || data?.detail || "Помилка при оновленні логотипу.";
            setError(message);
            return { success: false, error: message };
        }
    };

    const handleUpdateName = async (id, newName) => {
        try {
            await updateTeamName(id, newName);
            await loadTeams();
            return { success: true };
        } catch (err) {
            setError("Помилка при оновленні назви.");
            return { success: false };
        }
    };
    
    const handleUpdateDescription = async (id, description) => {
        try {
            await updateTeamDescription(id, description);
            await loadTeams();
            return { success: true };
        } catch (err) {
            setError("Помилка при оновленні опису.");
            return { success: false };
        }
    };

    const handleCoachAction = async (teamId, coachId, name, experience, photoFile = null, photoUrl = null, description = null) => {
        try {
            if (coachId) {
                await updateCoach(coachId, name, experience, photoFile, photoUrl, description);
            } else {
                await createCoach(teamId, name, experience, photoFile, photoUrl); // Note: createCoach doesn't have description yet, but it's okay for now
            }
            await loadTeams();
            return { success: true };
        } catch (err) {
            return { success: false, error: "Помилка при збереженні тренера" };
        }
    };

    const handleAddPlayer = async (teamId, name, number, position, photoFile = null, photoUrl = null) => {
        try {
            await addPlayer(teamId, name, number, position, photoFile, photoUrl);
            await loadTeams();
            return { success: true };
        } catch (err) {
            return { success: false, error: "Помилка при додаванні гравця" };
        }
    };

    const handleUpdatePlayer = async (playerId, name, number, position, photoFile = null, photoUrl = null, description = null) => {
        try {
            await updatePlayer(playerId, name, number, position, photoFile, photoUrl, description);
            await loadTeams();
            return { success: true };
        } catch (err) {
            return { success: false, error: "Помилка при оновленні гравця" };
        }
    };

    const handleDeletePlayer = async (playerId) => {
        try {
            await deletePlayer(playerId);
            await loadTeams();
            return { success: true };
        } catch (err) {
            return { success: false, error: "Помилка при видаленні гравця" };
        }
    };

    return {
        teams,
        loading,
        error,
        setError,
        loadTeams,
        handleCreateTeam,
        handleDeleteTeam,
        handleUpdateLogo,
        handleUpdateName,
        handleUpdateDescription,
        handleCoachAction,
        handleAddPlayer,
        handleUpdatePlayer,
        handleDeletePlayer
    };
};
