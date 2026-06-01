import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useMatches } from "../hooks/useMatches";
import { useTournaments } from "../hooks/useTournaments";
import { useTeams } from "../hooks/useTeams";
import { confirmAction } from "../utils/uiUtils";
import MatchForm from "./MatchesPage/MatchForm";
import MatchFilters from "./MatchesPage/MatchFilters";
import MatchList from "./MatchesPage/MatchList";
import MatchScoreModal from "./MatchesPage/MatchScoreModal";

function MatchesPage() {
  const { t, i18n } = useTranslation();
  const [selectedTournament, setSelectedTournament] = useState("");

  const {
    matches,
    loading,
    error: matchError,
    handleCreateMatch,
    handleUpdateMatch,
    handleDeleteMatch,
  } = useMatches(selectedTournament);

  const { tournaments } = useTournaments();
  const { teams } = useTeams();

  const [form, setForm] = useState({
    tournament: "",
    home_team: "",
    away_team: "",
    played_at: "",
  });

  const availableTeams = form.tournament
    ? teams.filter((t) => {
        const tour = tournaments.find((tour) => tour.id === Number.parseInt(form.tournament));
        const teamIds = tour?.teams || [];
        return teamIds.length > 0 ? teamIds.includes(t.id) : true;
      })
    : teams;

  const [editingMatch, setEditingMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({ home_score: 0, away_score: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterDate, setFilterDate] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.home_team === form.away_team) {
      toast.error(
        i18n.language === "uk"
          ? "Команди не можуть бути однаковими"
          : "Teams cannot be the same"
      );
      return;
    }
    if (form.home_team === "" || form.away_team === "") {
      toast.error(t("common.error"));
      return;
    }

    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleCreateMatch({
      tournament: Number.parseInt(form.tournament),
      home_team: Number.parseInt(form.home_team),
      away_team: Number.parseInt(form.away_team),
      played_at: form.played_at,
    });

    if (res.success) {
      setForm({ tournament: "", home_team: "", away_team: "", played_at: "" });
      toast.success(t("common.save"), { id: loadingToast });
    } else {
      toast.error(res.error || t("common.error"), { id: loadingToast });
    }
  };

  const openScoreModal = (match) => {
    setEditingMatch(match);
    setScoreForm({
      home_score: match.home_score || 0,
      away_score: match.away_score || 0,
    });
  };

  const handleScoreSave = async () => {
    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleUpdateMatch(editingMatch.id, scoreForm);
    if (res.success) {
      toast.success(t("common.save"), { id: loadingToast });
      setEditingMatch(null);
    } else {
      toast.error(res.error || t("common.error"), { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirmAction(i18n.language === "uk" ? "Видалити матч?" : "Delete match?")
    )
      return;
    const loadingToast = toast.loading(t("common.loading"));
    const res = await handleDeleteMatch(id);
    if (res.success) {
      toast.success(t("common.delete"), { id: loadingToast });
    } else {
      toast.error(res.error || t("common.error"), { id: loadingToast });
    }
  };

  const filteredMatches = matches
    .filter((m) => {
      if (selectedTournament && m.tournament !== Number.parseInt(selectedTournament))
        return false;

      const matchSearch = (
        m.home_team_name +
        m.away_team_name +
        m.tournament_name
      ).toLowerCase();
      const matchesSearch = matchSearch.includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === "finished") {
        matchesStatus = m.is_finished;
      } else if (statusFilter === "scheduled") {
        matchesStatus = !m.is_finished;
      }
      // else statusFilter === "all", so matchesStatus = true

      const matchesDate = !filterDate || (m.played_at?.startsWith(filterDate));

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "goals_desc") {
        return (
          (b.home_score || 0) + (b.away_score || 0) - ((a.home_score || 0) + (a.away_score || 0))
        );
      }
      const dateA = new Date(a.played_at);
      const dateB = new Date(b.played_at);
      return sortBy === "date_desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="container mt-4 mb-5">
      <div className="mb-5">
        <h1 className="fw-black text-gradient display-4 mb-2">
          {t("navbar.matches")}
        </h1>
        <p className="text-muted lead mb-0">
          {i18n.language === "uk"
            ? "Керуйте розкладом та результатами футбольних поєдинків"
            : "Manage football match schedule and results"}
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: "100px", zIndex: 10 }}>
            <MatchForm
              form={form}
              setForm={setForm}
              tournaments={tournaments}
              availableTeams={availableTeams}
              matchError={matchError}
              loading={loading}
              handleCreate={handleCreate}
              onFormTournamentChange={(value) => {
                if (!selectedTournament) {
                  setSelectedTournament(value);
                }
              }}
            />
            <MatchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedTournament={selectedTournament}
              setSelectedTournament={setSelectedTournament}
              tournaments={tournaments}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        </div>

        <MatchList
          filteredMatches={filteredMatches}
          onEdit={openScoreModal}
          onDelete={handleDelete}
        />
      </div>

      <MatchScoreModal
        editingMatch={editingMatch}
        scoreForm={scoreForm}
        setScoreForm={setScoreForm}
        onSave={handleScoreSave}
        onClose={() => setEditingMatch(null)}
      />
    </div>
  );
}

export default MatchesPage;
