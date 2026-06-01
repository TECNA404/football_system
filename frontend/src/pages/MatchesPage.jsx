import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Trash2, Edit2, Plus, Search, Filter, Calendar, Trophy, ChevronDown, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMatches } from "../hooks/useMatches";
import { useTournaments } from "../hooks/useTournaments";
import { useTeams } from "../hooks/useTeams";
import { formatDate } from "../utils/formatters";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";

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
    loadMatches
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
    ? teams.filter(t => {
        const tour = tournaments.find(tour => tour.id === parseInt(form.tournament));
        const teamIds = tour?.teams || [];
        return teamIds.length > 0 ? teamIds.includes(t.id) : true;
      })
    : teams;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.home_team === form.away_team) {
      toast.error(i18n.language === 'uk' ? "Команди не можуть бути однаковими" : "Teams cannot be the same");
      return;
    }
    const loadingToast = toast.loading(t('common.loading'));
    const res = await handleCreateMatch(form);
    if (res.success) {
      setForm({ ...form, home_team: "", away_team: "", played_at: "" });
      toast.success(t('common.success'), { id: loadingToast });
      loadMatches();
    } else {
      toast.error(res.error || t('common.error'), { id: loadingToast });
    }
  };

  const [editingMatch, setEditingMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({ home_score: 0, away_score: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, finished, scheduled
  const [sortBy, setSortBy] = useState("date_desc"); // date_desc, date_asc, goals_desc
  const [filterDate, setFilterDate] = useState("");

  const openScoreModal = (match) => {
    setEditingMatch(match);
    setScoreForm({
      home_score: match.home_score ?? 0,
      away_score: match.away_score ?? 0
    });
  };

  const handleScoreSave = async () => {
    if (!editingMatch) return;
    const loadingToast = toast.loading(t('common.loading'));
    const res = await handleUpdateMatch(editingMatch.id, {
      home_score: parseInt(scoreForm.home_score),
      away_score: parseInt(scoreForm.away_score),
      is_finished: true,
    });
    if (res.success) {
      toast.success(t('common.success'), { id: loadingToast });
      setEditingMatch(null);
    } else {
      toast.error(res.error || t('common.error'), { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.delete') + "?")) {
      const loadingToast = toast.loading(t('common.loading'));
      const res = await handleDeleteMatch(id);
      if (res.success) {
        toast.success(t('common.delete'), { id: loadingToast });
      } else {
        toast.error(res.error || t('common.error'), { id: loadingToast });
      }
    }
  };

  const filteredMatches = matches
    .filter(m => {
      // Якщо обрано турнір у фільтрі, показуємо лише його матчі
      if (selectedTournament && m.tournament !== parseInt(selectedTournament)) return false;

      const matchSearch = (m.home_team_name + m.away_team_name + m.tournament_name).toLowerCase();
      const matchesSearch = matchSearch.includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ? true :
        statusFilter === "finished" ? m.is_finished :
        !m.is_finished;

      const matchesDate = !filterDate || (m.played_at && m.played_at.startsWith(filterDate));

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "goals_desc") {
        return ((b.home_score || 0) + (b.away_score || 0)) - ((a.home_score || 0) + (a.away_score || 0));
      }
      const dateA = new Date(a.played_at);
      const dateB = new Date(b.played_at);
      return sortBy === "date_desc" ? dateB - dateA : dateA - dateB;
    });

  const tournamentName = selectedTournament ? tournaments.find(t => t.id === parseInt(selectedTournament))?.name : null;

  return (
    <div className="container mt-4 mb-5">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="fw-black text-gradient display-4 mb-2">
          {t('navbar.matches')}
        </h1>
        <p className="text-muted lead mb-0">{i18n.language === 'uk' ? "Керуйте розкладом та результатами футбольних поєдинків" : "Manage football match schedule and results"}</p>
      </motion.div>

      <div className="row g-4">
        {/* Match Controls & Filters */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
            {/* Create Match Button & Form */}
            <motion.div 
              className="card border-0 shadow-premium rounded-4 overflow-hidden mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="card-header bg-primary text-white p-4 border-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-black mb-0 d-flex align-items-center gap-2">
                  <Plus size={22} /> {t('matches.add_match')}
                </h5>
                <button 
                  className="btn btn-sm btn-light p-1 rounded-circle"
                  data-bs-toggle="collapse"
                  data-bs-target="#newMatchForm"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              <div className="collapse" id="newMatchForm">
                <div className="card-body p-4">
                  <form onSubmit={handleCreate}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">{t('matches.tournament')}</label>
                      <select
                        className="form-select border shadow-sm py-2"
                        value={form.tournament}
                        onChange={(e) => {
                          setForm({ ...form, tournament: e.target.value, home_team: "", away_team: "" });
                          if (!selectedTournament) {
                            setSelectedTournament(e.target.value);
                          }
                        }}
                        required
                      >
                        <option value="">{t('matches.tournament')}...</option>
                        {tournaments.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted">{t('matches.home_team')}</label>
                        <select
                          className="form-select border shadow-sm py-2"
                          value={form.home_team}
                          onChange={(e) => setForm({ ...form, home_team: e.target.value })}
                          required
                          disabled={!form.tournament}
                        >
                          <option value="">{t('matches.home_team')}...</option>
                          {availableTeams.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted">{t('matches.away_team')}</label>
                        <select
                          className="form-select border shadow-sm py-2"
                          value={form.away_team}
                          onChange={(e) => setForm({ ...form, away_team: e.target.value })}
                          required
                          disabled={!form.tournament}
                        >
                          <option value="">{t('matches.away_team')}...</option>
                          {availableTeams.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted">{t('matches.date')}</label>
                      <input
                        type="datetime-local"
                        className="form-control border shadow-sm py-2"
                        value={form.played_at}
                        onChange={(e) => setForm({ ...form, played_at: e.target.value })}
                        required
                      />
                    </div>
                    {matchError && <div className="text-danger mb-3 small">{matchError}</div>}
                    <button type="submit" className="btn btn-primary w-100 py-3 shadow-premium" disabled={loading}>
                      {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
                      <Plus size={20} className="me-2" /> {t('common.add')}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Filter Card */}
            <div className="glass-card rounded-4 p-4 border shadow-premium">
              <h6 className="fw-black mb-4 d-flex align-items-center gap-2">
                <Filter size={18} />
              </h6>
              <div className="d-flex flex-column gap-3">
                <div className="input-group border rounded-3 overflow-hidden shadow-sm">
                  <span className="input-group-text bg-white border-0 ps-3">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 py-2"
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-select border shadow-sm py-2"
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                >
                  <option value="">{t('common.all')} {t('navbar.tournaments')}</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="btn-group w-100 shadow-sm rounded-3 overflow-hidden border">
                   <button className={`btn btn-sm py-2 ${statusFilter === 'all' ? 'btn-primary' : 'btn-light'}`} onClick={() => setStatusFilter('all')}>
                     {t('common.all')}
                   </button>
                   <button className={`btn btn-sm py-2 ${statusFilter === 'scheduled' ? 'btn-primary' : 'btn-light'}`} onClick={() => setStatusFilter('scheduled')}>
                     {t('matches.scheduled')}
                   </button>
                   <button className={`btn btn-sm py-2 ${statusFilter === 'finished' ? 'btn-primary' : 'btn-light'}`} onClick={() => setStatusFilter('finished')}>
                     {t('matches.finished')}
                   </button>
                </div>
                <div className="input-group border rounded-3 overflow-hidden shadow-sm">
                  <span className="input-group-text bg-white border-0 ps-3">
                    <Calendar size={18} className="text-muted" />
                  </span>
                  <input
                    type="date"
                    className="form-control border-0 py-2"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                <select
                  className="form-select border shadow-sm py-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date_desc">{i18n.language === 'uk' ? 'Нові спочатку' : 'Newest first'}</option>
                  <option value="date_asc">{i18n.language === 'uk' ? 'Старі спочатку' : 'Oldest first'}</option>
                  <option value="goals_desc">{i18n.language === 'uk' ? 'За голами' : 'By goals'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="col-lg-8">
          <AnimatePresence mode="popLayout">
            {filteredMatches.length === 0 ? (
              <motion.div 
                className="card border-0 shadow-premium p-5 text-center rounded-4 h-100 d-flex flex-column align-items-center justify-content-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-light p-4 rounded-circle mb-4">
                  <Trophy size={64} className="text-muted opacity-25" />
                </div>
                <h4 className="fw-black text-muted">{t('matches.no_matches')}</h4>
                <p className="text-muted">{i18n.language === 'uk' ? 'Спробуйте змінити фільтри або додайте новий матч' : 'Try changing filters or add a new match'}</p>
              </motion.div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {filteredMatches.map((m, idx) => (
                  <motion.div 
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="card border-0 shadow-premium match-card rounded-4 overflow-hidden h-100 group">
                      <div className="card-body p-0">
                        <div className="p-2 px-4 bg-light bg-opacity-50 border-bottom d-flex justify-content-between align-items-center">
                          <span className="small text-muted fw-bold d-flex align-items-center gap-1 text-truncate pe-2">
                            <Trophy size={14} className="text-primary" /> {m.tournament_name}
                          </span>
                          <span className="small text-muted d-flex align-items-center gap-1 text-nowrap">
                            <Calendar size={14} /> {formatDate(m.played_at, i18n.language)}
                          </span>
                        </div>
                        
                        <div className="row align-items-center p-4">
                          <div className="col-4 text-end">
                            <div className="d-flex align-items-center justify-content-end gap-3">
                               <Link to={`/teams/${m.home_team}`} className="text-decoration-none text-dark d-none d-md-inline fw-black fs-5 hover-primary">{m.home_team_name}</Link>
                               <img 
                                 src={m.home_team_logo} 
                                 alt="" 
                                 className="match-team-logo-large shadow-sm"
                                 onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                               />
                            </div>
                            <div className="fw-black fs-6 mt-2 d-md-none">{m.home_team_name}</div>
                          </div>
                          
                          <div className="col-4 text-center">
                            <div className="d-flex flex-column align-items-center">
                              {m.is_finished ? (
                                <div className="score-display mb-2">
                                  <span className="fw-black fs-1 text-gradient">{m.home_score} : {m.away_score}</span>
                                </div>
                              ) : (
                                <div className="bg-primary text-white px-4 py-2 rounded-pill fw-black mb-2 shadow-sm">
                                  VS
                                </div>
                              )}
                              <div>
                                {m.is_finished ? (
                                  <span className="badge bg-secondary rounded-pill px-3">
                                    {t('matches.finished')}
                                  </span>
                                ) : (
                                  <span className="badge bg-accent text-dark rounded-pill px-3 shadow-sm pulse-animation">
                                    LIVE
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="d-flex align-items-center gap-3">
                               <img 
                                 src={m.away_team_logo} 
                                 alt="" 
                                 className="match-team-logo-large shadow-sm"
                                 onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                               />
                               <Link to={`/teams/${m.away_team}`} className="text-decoration-none text-dark d-none d-md-inline fw-black fs-5 hover-primary">{m.away_team_name}</Link>
                            </div>
                            <div className="fw-black fs-6 mt-2 d-md-none">{m.away_team_name}</div>
                          </div>
                        </div>

                        <div className="p-3 bg-light bg-opacity-25 border-top d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                             <button className="btn btn-sm btn-light px-3 rounded-pill" onClick={() => openScoreModal(m)}>
                               <Edit2 size={16} className="me-1 text-warning" /> {t('common.edit')}
                             </button>
                             <button className="btn btn-sm btn-light px-3 rounded-pill text-danger" onClick={() => handleDelete(m.id)}>
                               <Trash2 size={16} className="me-1" /> {t('common.delete')}
                             </button>
                          </div>
                          <Link to={`/tournaments`} className="text-decoration-none small text-muted hover-primary fw-bold">
                            →→→
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Модалка для введення рахунку (Інлайнова імітація через Overlay або Conditional Rendering) */}
      {editingMatch && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Результат матчу</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingMatch(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div className="small text-muted mb-2">{editingMatch.tournament_name}</div>
                  <div className="h5 fw-bold">{editingMatch.home_team_name} vs {editingMatch.away_team_name}</div>
                </div>
                <div className="row align-items-center g-3">
                  <div className="col-5">
                    <label className="form-label small text-center d-block text-muted">{editingMatch.home_team_name}</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-lg text-center fw-bold"
                      value={scoreForm.home_score}
                      onChange={(e) => setScoreForm({ ...scoreForm, home_score: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-2 text-center h3 mt-4">:</div>
                  <div className="col-5">
                    <label className="form-label small text-center d-block text-muted">{editingMatch.away_team_name}</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-lg text-center fw-bold"
                      value={scoreForm.away_score}
                      onChange={(e) => setScoreForm({ ...scoreForm, away_score: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn btn-light px-4 fw-bold" onClick={() => setEditingMatch(null)}>Скасувати</button>
                <button className="btn btn-success px-4 fw-bold shadow-sm" onClick={handleScoreSave}>Зберегти результат</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchesPage;

