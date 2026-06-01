import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { getTeam } from "../api/teamsApi";
import { useTeams } from "../hooks/useTeams";
import { getApiErrorMessage } from "../utils/apiUtils";
import { confirmAction } from "../utils/uiUtils";
import { useAuth } from "../components/AuthContext";
import TeamInfoCard from "./TeamDetailPage/TeamInfoCard";
import CoachDetailCard from "./TeamDetailPage/CoachDetailCard";
import PlayersDetailList from "./TeamDetailPage/PlayersDetailList";

function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuth } = useAuth();
  const {
    handleUpdateName,
    handleUpdateLogo,
    handleUpdateDescription,
    handleCoachAction,
    handleAddPlayer,
    handleUpdatePlayer,
    handleDeletePlayer,
  } = useTeams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Team fields
  const [editingName, setEditingName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Coach fields
  const [coachName, setCoachName] = useState("");
  const [coachExp, setCoachExp] = useState(0);
  const [coachDescription, setCoachDescription] = useState("");
  const [coachPhotoFile, setCoachPhotoFile] = useState(null);
  const [coachPhotoUrl, setCoachPhotoUrl] = useState("");
  const [coachPreview, setCoachPreview] = useState(null);
  const [isEditingCoach, setIsEditingCoach] = useState(false);

  // Player fields
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerPosition, setPlayerPosition] = useState("GK");
  const [playerDescription, setPlayerDescription] = useState("");
  const [playerPhotoFile, setPlayerPhotoFile] = useState(null);
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState("");
  const [playerPreview, setPlayerPreview] = useState(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await getTeam(id);
      const data = res.data;
      setTeam(data);
      setEditingName(data.name);
      setEditingDescription(data.description || "");
      setCoachName(data.coach?.name || "");
      setCoachExp(data.coach?.experience_years || 0);
      setCoachDescription(data.coach?.description || "");
      setCoachPreview(data.coach?.photo_url || null);
      setCoachPhotoUrl("");
    } catch (err) {
      setError(getApiErrorMessage(err, t("common.error")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id, t]);

  const onSaveTeamName = async () => {
    if (!editingName.trim()) return;
    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleUpdateName(id, editingName.trim());
    if (res.success) {
      setIsEditingName(false);
      setTeam({ ...team, name: editingName.trim() });
      toast.success(t("common.save"), { id: loadingToast });
    } else {
      toast.error(t("common.error"), { id: loadingToast });
    }
  };

  const onSaveTeamDescription = async () => {
    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleUpdateDescription(id, editingDescription);
    if (res.success) {
      setIsEditingDescription(false);
      setTeam({ ...team, description: editingDescription });
      toast.success(t("common.save"), { id: loadingToast });
    } else {
      toast.error(t("common.error"), { id: loadingToast });
    }
  };

  const onLogoUpdate = async (file) => {
    if (!file) return;
    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleUpdateLogo(id, file);
    if (res.success) {
      toast.success(t("common.save"), { id: loadingToast });
      fetchTeam();
    } else {
      toast.error(res.error || t("common.error"), { id: loadingToast });
    }
  };

  const onSaveCoach = async () => {
    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleCoachAction(
      id,
      team.coach?.id,
      coachName,
      coachExp,
      coachPhotoFile,
      coachPhotoUrl,
      coachDescription
    );
    if (res.success) {
      toast.success(t("common.save"), { id: loadingToast });
      setCoachPhotoFile(null);
      setCoachPhotoUrl("");
      setIsEditingCoach(false);
      fetchTeam();
    } else {
      toast.error(res.error || t("common.error"), { id: loadingToast });
    }
  };

  const onSavePlayer = async (e) => {
    if (e) e.preventDefault();
    const loadingToast = toast.loading(t("common.loading"));
    let res;
    if (editingPlayerId) {
      res = await handleUpdatePlayer(
        editingPlayerId,
        playerName,
        playerNumber,
        playerPosition,
        playerPhotoFile,
        playerPhotoUrl,
        playerDescription
      );
    } else {
      res = await handleAddPlayer(
        id,
        playerName,
        playerNumber,
        playerPosition,
        playerPhotoFile,
        playerPhotoUrl
      );
    }

    if (res.success) {
      toast.success(t("common.save"), { id: loadingToast });
      resetPlayerForm();
      fetchTeam();
    } else {
      toast.error(res.error || t("common.error"), { id: loadingToast });
    }
  };

  const resetPlayerForm = () => {
    setEditingPlayerId(null);
    setPlayerName("");
    setPlayerNumber("");
    setPlayerPosition("GK");
    setPlayerDescription("");
    setPlayerPhotoFile(null);
    setPlayerPhotoUrl("");
    setPlayerPreview(null);
    setIsAddingPlayer(false);
  };

  const startEditPlayer = (player) => {
    setEditingPlayerId(player.id);
    setPlayerName(player.name);
    setPlayerNumber(player.number);
    setPlayerPosition(player.position);
    setPlayerDescription(player.description || "");
    setPlayerPreview(player.photo_url);
    setPlayerPhotoUrl(player.photo_url?.startsWith("http") ? player.photo_url : "");
    setPlayerPhotoFile(null);
  };

  const onDeletePlayer = async (pid) => {
    if (!confirmAction(i18n.language === "uk" ? "Видалити гравця?" : "Delete player?"))
      return;
    const res = await handleDeletePlayer(pid);
    if (res.success) {
      toast.success(i18n.language === "uk" ? "Видалено" : "Deleted");
      fetchTeam();
    }
  };

  if (loading)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (error || !team)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || "Team not found"}</div>
      </div>
    );

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary border-0 p-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="fw-bold mb-0">{team.name}</h2>
      </div>

      <TeamInfoCard
        team={team}
        editingName={editingName}
        setEditingName={setEditingName}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        editingDescription={editingDescription}
        setEditingDescription={setEditingDescription}
        isEditingDescription={isEditingDescription}
        setIsEditingDescription={setIsEditingDescription}
        isAuth={isAuth}
        onSaveTeamName={onSaveTeamName}
        onSaveTeamDescription={onSaveTeamDescription}
        onLogoUpdate={onLogoUpdate}
      />

      <CoachDetailCard
        team={team}
        isAuth={isAuth}
        coachName={coachName}
        coachExp={coachExp}
        coachDescription={coachDescription}
        coachPhotoFile={coachPhotoFile}
        coachPhotoUrl={coachPhotoUrl}
        coachPreview={coachPreview}
        setCoachName={setCoachName}
        setCoachExp={setCoachExp}
        setCoachDescription={setCoachDescription}
        setCoachPhotoFile={setCoachPhotoFile}
        setCoachPhotoUrl={setCoachPhotoUrl}
        setCoachPreview={setCoachPreview}
        isEditingCoach={isEditingCoach}
        setIsEditingCoach={setIsEditingCoach}
        onSaveCoach={onSaveCoach}
      />

      <PlayersDetailList
        team={team}
        isAuth={isAuth}
        editingPlayerId={editingPlayerId}
        playerName={playerName}
        playerNumber={playerNumber}
        playerPosition={playerPosition}
        playerDescription={playerDescription}
        playerPreview={playerPreview}
        playerPhotoUrl={playerPhotoUrl}
        isAddingPlayer={isAddingPlayer}
        setPlayerName={setPlayerName}
        setPlayerNumber={setPlayerNumber}
        setPlayerPosition={setPlayerPosition}
        setPlayerDescription={setPlayerDescription}
        setPlayerPreview={setPlayerPreview}
        setPlayerPhotoUrl={setPlayerPhotoUrl}
        setPlayerPhotoFile={setPlayerPhotoFile}
        setEditingPlayerId={setEditingPlayerId}
        setIsAddingPlayer={setIsAddingPlayer}
        onSavePlayer={onSavePlayer}
        resetPlayerForm={resetPlayerForm}
        startEditPlayer={startEditPlayer}
        onDeletePlayer={onDeletePlayer}
      />
    </div>
  );
}

export default TeamDetailPage;
