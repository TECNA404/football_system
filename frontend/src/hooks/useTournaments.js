import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  getPublicTournaments,
} from "../api/tournamentsApi";

export const useTournaments = () => {
  const { i18n } = useTranslation();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const response = await getTournaments();
      setTournaments(response.data);
    } catch (err) {
      setError("Помилка при завантаженні турнірів.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleCreateTournament = async (tournamentData) => {
    setError("");
    setLoading(true);
    try {
      await createTournament({
        name: tournamentData.name,
        year: tournamentData.year ? parseInt(tournamentData.year) : null,
        description: tournamentData.description || "",
        is_public: tournamentData.is_public,
      });
      await loadTournaments();
      return { success: true };
    } catch (err) {
      const data = err.response?.data;
      let message = i18n.language === 'uk' ? "Помилка при створенні." : "Error creating tournament.";
      if (data) {
        if (typeof data === 'object') {
          message = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join(' | ');
        } else {
          message = JSON.stringify(data);
        }
      }
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournament = async (id, tournamentData) => {
    try {
      await updateTournament(id, {
        name: tournamentData.name,
        year: tournamentData.year ? parseInt(tournamentData.year) : null,
        description: tournamentData.description || "",
        is_public: tournamentData.is_public,
      });
      await loadTournaments();
      return { success: true };
    } catch (err) {
      const data = err.response?.data;
      let message = i18n.language === 'uk' ? "Помилка збереження." : "Save error.";
      if (data) {
        if (typeof data === 'object') {
          message = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join(' | ');
        } else {
          message = JSON.stringify(data);
        }
      }
      return { success: false, error: message };
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm(i18n.language === 'uk' ? "Видалити турнір і всі його матчі?" : "Delete tournament and all its matches?")) return { success: false };
    try {
      await deleteTournament(id);
      await loadTournaments();
      return { success: true };
    } catch (err) {
      const msg = i18n.language === 'uk' ? "Помилка при видаленні." : "Error deleting.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return {
    tournaments,
    loading,
    error,
    setError,
    loadTournaments,
    handleCreateTournament,
    handleUpdateTournament,
    handleDeleteTournament,
  };
};

export const usePublicTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPublicTournaments().then((res) => {
      setTournaments(res.data);
      setLoading(false);
    });
  }, []);

  return { tournaments, loading };
};
