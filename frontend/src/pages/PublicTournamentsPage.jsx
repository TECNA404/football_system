import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  Users, 
  Search, 
  ChevronRight, 
  Info,
  Clock,
  Target
} from "lucide-react";
import {
  getPublicMatches,
  getPublicStandings,
} from "../api/tournamentsApi";
import { usePublicTournaments } from "../hooks/useTournaments";
import { formatDate } from "../utils/formatters";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";

function PublicTournamentsPage() {
  const { t, i18n } = useTranslation();
  const { tournaments, loading: listLoading } = usePublicTournaments();
  const [selected, setSelected] = useState(null);
  const detailsRef = useRef(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [tab, setTab] = useState("matches"); // 'matches' | 'standings'
  const [loading, setLoading] = useState(false);

  // Фільтрація для турнірів
  const [tournamentSearch, setTournamentSearch] = useState("");

  // Фільтрація для матчів
  const [matchSearch, setMatchSearch] = useState("");
  const [matchStatus, setMatchStatus] = useState("all");
  const [matchSort, setMatchSort] = useState("date_desc");
  const [matchDate, setMatchDate] = useState("");

  // Пошук для таблиці
  const [standingSearch, setStandingSearch] = useState("");

  const handleSelect = async (t) => {
    setSelected(t);
    setLoading(true);
    setMatchDate(""); // Скидаємо фільтр дати при зміні турніру
    
    // Плавна прокрутка до деталей
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const [mRes, sRes] = await Promise.all([
        getPublicMatches(t.id),
        getPublicStandings(t.id),
      ]);
      setMatches(mRes.data);
      setStandings(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(tournamentSearch.toLowerCase()))
  );

  const filteredMatches = matches
    .filter(m => {
      const search = (m.home_team + m.away_team).toLowerCase();
      const matchesSearch = search.includes(matchSearch.toLowerCase());
      const matchesStatus = 
        matchStatus === "all" ? true :
        matchStatus === "finished" ? m.is_finished :
        !m.is_finished;
      const matchesDate = !matchDate || (m.played_at && m.played_at.startsWith(matchDate));
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (matchSort === "goals_desc") return (b.home_score + b.away_score) - (a.home_score + a.away_score);
      
      const dateA = new Date(a.played_at);
      const dateB = new Date(b.played_at);
      return matchSort === "date_desc" ? dateB - dateA : dateA - dateB;
    });

  const filteredStandings = standings.filter(s => 
    s.team_name.toLowerCase().includes(standingSearch.toLowerCase())
  );


  return (
    <div className="container mt-4 mb-5">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="fw-black text-gradient display-4 mb-2">
          {t('navbar.public')}
        </h1>
        <p className="text-muted lead mb-0">{i18n.language === 'uk' ? "Слідкуйте за результатами матчів та турнірними таблицями в режимі реального часу" : "Follow match results and tournament tables in real-time"}</p>
      </motion.div>

      <div className="glass-card border-0 mb-5 rounded-4 shadow-premium">
        <div className="card-body p-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <Search size={22} />
                </span>
                <input
                  type="text"
                  className="form-control border-0 py-3 fs-5"
                  placeholder={i18n.language === 'uk' ? 'Пошук турніру за назвою чи описом...' : 'Search tournament by name or description...'}
                  value={tournamentSearch}
                  onChange={(e) => setTournamentSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                {filteredTournaments.length} {i18n.language === 'uk' ? 'Турнірів знайдено' : 'Tournaments found'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {listLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">{t('common.loading')}</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-5 card border-0 shadow-sm mb-5">
          <p className="text-muted mb-0">{t('tournaments.no_tournaments')}</p>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {filteredTournaments.map((t, index) => (
            <motion.div 
              key={t.id} 
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`card h-100 border-0 shadow-premium tournament-card-public ${selected?.id === t.id ? "ring-primary-custom" : ""}`}
                style={{ cursor: "pointer", transition: "all 0.3s ease", borderRadius: '20px' }}
                onClick={() => handleSelect(t)}
              >
                <div className="card-body p-4 pb-0">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="fw-black mb-0 text-primary">{t.name}</h4>
                    {t.year && <span className="badge bg-accent text-dark px-3 py-2 rounded-pill shadow-sm">{t.year}</span>}
                  </div>
                  <p className="card-text text-muted mb-4 lh-base" style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '4.5rem' }}>
                    {t.description || (i18n.language === 'uk' ? "Цей турнір поки не має детального опису. Слідкуйте за оновленнями." : "This tournament doesn't have a detailed description yet. Stay tuned.")}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-0 p-4 pt-0">
                  <div className="d-flex align-items-center gap-2 mb-3 py-2 border-top border-bottom border-light">
                    <div className="bg-light p-2 rounded-circle">
                      <Users size={18} className="text-primary" />
                    </div>
                    <div className="small">
                       <div className="text-muted">{i18n.language === 'uk' ? "Організатор" : "Organizer"}</div>
                       <strong className="text-dark">{t.owner}</strong>
                    </div>
                  </div>
                  <button className={`btn btn-lg w-100 shadow-sm d-flex align-items-center justify-content-center gap-2 ${selected?.id === t.id ? "btn-primary" : "btn-light"}`}>
                    {selected?.id === t.id ? (
                      <><Target size={20} /> {i18n.language === 'uk' ? "Перегляд результатів" : "Viewing Results"}</>
                    ) : (
                      <>{i18n.language === 'uk' ? "Відкрити турнір" : "Open Tournament"} <ChevronRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <div className="animate-fade-in mt-5 pt-4 border-top" ref={detailsRef}>
          <div className="d-flex align-items-center justify-content-between mb-5">
            <h2 className="fw-black mb-0 d-flex align-items-center gap-3">
              <span className="text-gradient">🏆 {selected.name}</span>
              <span className="badge bg-light text-muted border fs-6 fw-normal rounded-pill">{selected.year}</span>
            </h2>
            <div className="d-none d-md-block">
               <span className="text-muted small">ID: {selected.id}</span>
            </div>
          </div>

          <div className="glass-card p-2 rounded-4 shadow-premium d-inline-flex mb-5 border">
            <button
              className={`btn btn-lg border-0 px-5 rounded-3 transition-all ${tab === "matches" ? "btn-primary shadow-premium" : "btn-link text-muted text-decoration-none"}`}
              onClick={() => setTab("matches")}
            >
              <div className="d-flex align-items-center gap-2">
                <Target size={20} />
                <span>{t('navbar.matches')}</span>
              </div>
            </button>
            <button
              className={`btn btn-lg border-0 px-5 rounded-3 transition-all ${tab === "standings" ? "btn-primary shadow-premium" : "btn-link text-muted text-decoration-none"}`}
              onClick={() => setTab("standings")}
            >
              <div className="d-flex align-items-center gap-2">
                <Trophy size={20} />
                <span>{t('navbar.standings')}</span>
              </div>
            </button>
          </div>

          {tab === "matches" && (
            <div className="card border-0 shadow-sm mb-4 animate-fade-in">
              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder={t('common.search')}
                        value={matchSearch}
                        onChange={(e) => setMatchSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted"><Calendar size={14} /></span>
                      <input
                        type="date"
                        className="form-control border-start-0"
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={matchStatus}
                      onChange={(e) => setMatchStatus(e.target.value)}
                    >
                      <option value="all">{t('common.all')} {t('navbar.matches')}</option>
                      <option value="finished">{t('matches.finished')}</option>
                      <option value="scheduled">{t('matches.scheduled')}</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={matchSort}
                      onChange={(e) => setMatchSort(e.target.value)}
                    >
                      <option value="date_desc">{i18n.language === 'uk' ? 'Нові' : 'Newest'}</option>
                      <option value="date_asc">{i18n.language === 'uk' ? 'Старі' : 'Oldest'}</option>
                      <option value="goals_desc">{i18n.language === 'uk' ? 'За голами' : 'By goals'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "standings" && (
            <div className="card border-0 shadow-sm mb-4 animate-fade-in" style={{ borderRadius: '15px' }}>
              <div className="card-body p-3">
                <div className="row g-3 align-items-center">
                  <div className="col-md-8">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Search size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder={i18n.language === 'uk' ? 'Пошук команди в таблиці...' : 'Search team in standings...'}
                        value={standingSearch}
                        onChange={(e) => setStandingSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end d-none d-md-block">
                    <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">
                      <Info size={14} className="me-1" />
                      {i18n.language === 'uk' ? 'Оновлюється автоматично' : 'Updates automatically'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : tab === "matches" ? (
            filteredMatches.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center">
                <p className="text-muted mb-0">Матчів не знайдено.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredMatches.map((m, idx) => (
                  <motion.div 
                    key={m.id} 
                    className="col-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="card shadow-sm border-0 match-card-public overflow-hidden" style={{ borderRadius: '15px' }}>
                       <div className="card-body p-0">
                         <div className="row align-items-center g-0">
                            {/* Home Team */}
                            <div className="col-md-5 p-4 d-flex align-items-center justify-content-end gap-3 order-1">
                               <div className="text-end">
                                 <Link to={`/teams/${m.home_team_id}`} className="text-decoration-none text-dark hover-primary fw-bold fs-5 d-block">
                                   {m.home_team}
                                 </Link>
                                 <Link to={`/teams/${m.home_team_id}`} className="btn btn-link btn-sm p-0 text-primary text-decoration-none small">
                                   {i18n.language === 'uk' ? 'Склад' : 'Lineup'} →
                                 </Link>
                               </div>
                               <div className="flex-shrink-0">
                                 {m.home_team_logo ? (
                                   <img 
                                     src={m.home_team_logo} 
                                     alt="" 
                                     className="match-team-logo-large shadow-sm" 
                                     onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                                   />
                                 ) : (
                                   <div className="match-team-logo-large bg-light d-flex align-items-center justify-content-center text-muted">⚽</div>
                                 )}
                               </div>
                            </div>

                            {/* Score & Status */}
                            <div className="col-md-2 text-center bg-light py-4 order-2 border-start border-end">
                               <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                 <div className="score-display mb-2">
                                    {m.home_score !== null && m.away_score !== null ? (
                                      <span className="fw-black fs-2">{m.home_score} : {m.away_score}</span>
                                    ) : (
                                      <span className="badge bg-primary px-3 py-2">VS</span>
                                    )}
                                 </div>
                                 <div className="small text-muted d-flex align-items-center gap-1 mb-2">
                                    <Clock size={12} />
                                    {formatDate(m.played_at, i18n.language)}
                                 </div>
                                 <div>
                                    {m.is_finished ? (
                                      <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3">
                                        {i18n.language === 'uk' ? 'Завершено' : 'Finished'}
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 d-flex align-items-center gap-1">
                                        <span className="pulse-dot"></span> LIVE
                                      </span>
                                    )}
                                 </div>
                               </div>
                            </div>

                            {/* Away Team */}
                            <div className="col-md-5 p-4 d-flex align-items-center justify-content-start gap-3 order-3">
                               <div className="flex-shrink-0">
                                 {m.away_team_logo ? (
                                   <img 
                                     src={m.away_team_logo} 
                                     alt="" 
                                     className="match-team-logo-large shadow-sm" 
                                     onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                                   />
                                 ) : (
                                   <div className="match-team-logo-large bg-light d-flex align-items-center justify-content-center text-muted">⚽</div>
                                 )}
                               </div>
                               <div>
                                 <Link to={`/teams/${m.away_team_id}`} className="text-decoration-none text-dark hover-primary fw-bold fs-5 d-block">
                                   {m.away_team}
                                 </Link>
                                 <Link to={`/teams/${m.away_team_id}`} className="btn btn-link btn-sm p-0 text-primary text-decoration-none small">
                                   {i18n.language === 'uk' ? 'Склад' : 'Lineup'} →
                                 </Link>
                               </div>
                            </div>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            filteredStandings.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center">
                <p className="text-muted mb-0">{t('teams.no_teams')}</p>
              </div>
            ) : (
              <>
                <div className="table-responsive shadow-sm" style={{ borderRadius: '15px' }}>
                  <table className="table table-hover align-middle mb-0 bg-white">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="ps-4 py-3 border-0">#</th>
                        <th className="py-3 border-0">{t('navbar.teams')}</th>
                        <th className="text-center py-3 border-0">{i18n.language === 'uk' ? 'І' : 'P'}</th>
                        <th className="text-center py-3 border-0 d-none d-sm-table-cell">{i18n.language === 'uk' ? 'В' : 'W'}</th>
                        <th className="text-center py-3 border-0 d-none d-sm-table-cell">{i18n.language === 'uk' ? 'Н' : 'D'}</th>
                        <th className="text-center py-3 border-0 d-none d-sm-table-cell">{i18n.language === 'uk' ? 'П' : 'L'}</th>
                        <th className="text-center py-3 border-0 d-none d-lg-table-cell">{i18n.language === 'uk' ? 'ГЗ' : 'GF'}</th>
                        <th className="text-center py-3 border-0 d-none d-lg-table-cell">{i18n.language === 'uk' ? 'ГП' : 'GA'}</th>
                        <th className="text-center py-3 border-0">{i18n.language === 'uk' ? 'РГ' : 'GD'}</th>
                        <th className="text-center pe-4 py-3 border-0">{i18n.language === 'uk' ? 'О' : 'Pts'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStandings.map((row, i) => {
                        const actualRank = standings.findIndex(s => s.team_id === row.team_id) + 1;
                        return (
                          <motion.tr 
                            key={row.team_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className={actualRank === 1 && standingSearch === "" ? "table-success-light" : ""}
                          >
                            <td className="ps-4">
                              <span className={`rank-badge ${actualRank === 1 ? 'rank-1' : actualRank <= 3 ? 'rank-top' : ''}`}>
                                {actualRank}
                              </span>
                            </td>
                            <td>
                              <Link to={`/teams/${row.team_id}`} className="text-decoration-none d-flex align-items-center">
                                {row.team_logo ? (
                                  <img 
                                    src={row.team_logo} 
                                    alt="" 
                                    className="standing-logo shadow-sm me-3" 
                                    onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                                  />
                                ) : (
                                  <div className="standing-logo bg-light d-flex align-items-center justify-content-center text-muted me-3">⚽</div>
                                )}
                                <span className="fw-bold text-dark hover-primary">{row.team_name}</span>
                              </Link>
                            </td>
                            <td className="text-center fw-semibold">{row.played}</td>
                            <td className="text-center text-success d-none d-sm-table-cell">{row.wins}</td>
                            <td className="text-center text-muted d-none d-sm-table-cell">{row.draws}</td>
                            <td className="text-center text-danger d-none d-sm-table-cell">{row.losses}</td>
                            <td className="text-center small d-none d-lg-table-cell">{row.goals_for}</td>
                            <td className="text-center small d-none d-lg-table-cell">{row.goals_against}</td>
                            <td className="text-center">
                              <span className={`badge ${row.goal_difference >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill`}>
                                {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                              </span>
                            </td>
                            <td className="text-center pe-4">
                              <span className="fs-5 fw-black text-primary">{row.points}</span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="card border-0 bg-white p-3 mt-3 shadow-sm">
                  <div className="row g-2">
                    <div className="col-12 text-muted small">
                      <strong>{i18n.language === 'uk' ? 'Легенда:' : 'Legend:'}</strong> {i18n.language === 'uk' ? 'І — ігри · В — виграші · Н — нічиї · П — поразки · ГЗ — голи забиті · ГП — голи пропущені · РГ — різниця · О — очки' : 'P — played · W — won · D — drawn · L — lost · GF — goals for · GA — goals against · GD — goal difference · Pts — points'}
                    </div>
                    <div className="col-12 text-muted small">
                      * {i18n.language === 'uk' ? 'Критерії при рівності очок: 1) Краща різниця голів → 2) Більше забитих голів → 3) Алфавітний порядок' : 'Tie-break criteria: 1) Better goal difference → 2) More goals scored → 3) Alphabetical order'}
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default PublicTournamentsPage;
