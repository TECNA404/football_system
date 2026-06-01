import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getMatches, createMatch, updateMatch, deleteMatch } from "../api/matchesApi";
import { getApiErrorMessage } from "../utils/apiUtils";

export const useMatches = (tournamentId = null) => {
    const { i18n } = useTranslation();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadMatches = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMatches(tournamentId || undefined);
            setMatches(response.data);
        } catch (err) {
            setError("Помилка при завантаженні матчів.");
        } finally {
            setLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);

    const handleCreateMatch = async (matchData) => {
        if (!matchData.played_at) {
            const msg = i18n.language === 'uk' ? "Дата матчу обов'язкова." : "Match date is required.";
            setError(msg);
            return { success: false, error: msg };
        }
        setError("");
        setLoading(true);
        try {
            await createMatch({
                tournament: Number.parseInt(matchData.tournament),
                home_team: Number.parseInt(matchData.home_team),
                away_team: Number.parseInt(matchData.away_team),
                played_at: new Date(matchData.played_at).toISOString(),
            });
            await loadMatches();
            return { success: true };
        } catch (err) {
            const message = getApiErrorMessage(err, i18n.language === 'uk' ? "Помилка при створенні матчу." : "Error creating match.");
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMatch = async (id, updateData) => {
    try {
        const response = await updateMatch(id, updateData);
        setMatches(prev =>
            prev.map(m => m.id === id ? { ...m, ...updateData, ...(response.data || {}) } : m)
        );
        return { success: true };
    } catch (err) {
        const message = getApiErrorMessage(
            err,
            i18n.language === 'uk' ? "Помилка при оновленні матчу." : "Error updating match."
        );
        setError(message);
        return { success: false, error: message };
    }
};

    const handleDeleteMatch = async (id) => {
        if (!globalThis.confirm(i18n.language === 'uk' ? "Видалити матч?" : "Delete match?")) return { success: false };
        try {
            await deleteMatch(id);
            await loadMatches();
            return { success: true };
        } catch (err) {
            const message = getApiErrorMessage(err, i18n.language === 'uk' ? "Помилка при видаленні матчу." : "Error deleting match.");
            setError(message);
            return { success: false, error: message };
        }
    };

    return {
        matches,
        loading,
        error,
        setError,
        loadMatches,
        handleCreateMatch,
        handleUpdateMatch,
        handleDeleteMatch
    };
};
