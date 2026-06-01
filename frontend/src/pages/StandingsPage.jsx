import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {motion, AnimatePresence} from "framer-motion";
import {
    Trophy,
    RefreshCw,
    Search,
    ChevronRight,
    Info,
    Medal,
    Award,
    Hash,
    Activity,
    Shield
} from "lucide-react";
import {getStandings, recalculateStandings} from "../api/standingsApi";
import {getTournaments} from "../api/tournamentsApi";

function getTiebreakNote(row, allRows, t) {
    const tied = allRows.filter(
        (r) =>
            r.team !== row.team &&
            r.points === row.points &&
            r.goal_difference === row.goal_difference &&
            r.goals_for === row.goals_for
    );
    if (tied.length === 0) return null;
    const rival = tied[0];
    const myIdx = allRows.findIndex((r) => r.team === row.team);
    const rivalIdx = allRows.findIndex((r) => r.team === rival.team);
    if (myIdx < rivalIdx) return "↑ " + t('common.sort');
    return null;
}

function StandingsPage() {
    const {t, i18n} = useTranslation();
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState("");
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recalcLoading, setRecalcLoading] = useState(false);
    const [recalcMsg, setRecalcMsg] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getTournaments().then((res) => setTournaments(res.data));
    }, [standings]); // Перезавантажуємо при зміні даних таблиці (після рекалькуляції)

    const loadStandings = (tid) => {
        if (!tid) {
            setStandings([]);
            return;
        }
        setLoading(true);
        setError("");
        getStandings(tid)
            .then((res) => setStandings(res.data))
            .catch(() => setError("Не вдалося завантажити таблицю."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadStandings(selectedTournament);
    }, [selectedTournament]);

    const handleRecalculate = async () => {
        if (!selectedTournament) return;
        setRecalcLoading(true);
        setRecalcMsg("");
        try {
            const res = await recalculateStandings(selectedTournament);
            setRecalcMsg(res.data.detail);
            loadStandings(selectedTournament);
        } catch {
            setRecalcMsg("Помилка перерахунку.");
        } finally {
            setRecalcLoading(false);
            setTimeout(() => setRecalcMsg(""), 4000);
        }
    };

    const winner = standings.length > 0 ? standings[0] : null;

    const hasTie = standings.some(
        (row, i) =>
            i > 0 &&
            standings[i - 1].points === row.points &&
            standings[i - 1].goal_difference === row.goal_difference &&
            standings[i - 1].goals_for === row.goals_for
    );

    return (
        <motion.div
            className="container mt-4 mb-5"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <h2 className="fw-black mb-0 d-flex align-items-center gap-3 text-gradient">
                    <Trophy className="text-accent" size={32}/> {t('navbar.standings')}
                </h2>
                <div className="d-flex align-items-center gap-2">
                    {selectedTournament && (
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="btn btn-accent btn-sm fw-black px-4 py-2 shadow-premium rounded-pill d-flex align-items-center gap-2"
                            onClick={handleRecalculate}
                            disabled={recalcLoading}
                        >
                            {recalcLoading ? (
                                <RefreshCw size={18} className="animate-spin"/>
                            ) : (
                                <RefreshCw size={18}/>
                            )}
                            {recalcLoading ? t('common.loading') : t('common.edit')}
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="glass-card border-0 shadow-premium mb-4 rounded-4 overflow-hidden">
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-auto">
                            <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                                <Search size={24}/>
                            </div>
                        </div>
                        <div className="col">
                            <label className="form-label small fw-black text-uppercase ls-1 text-muted mb-1">
                                {t('matches.tournament')}
                            </label>
                            <select
                                className="form-select standings-select border-0 fw-bold rounded-3 py-2"
                                value={selectedTournament}
                                onChange={(e) => setSelectedTournament(e.target.value)}
                            >
                                <option value="">--- {t('matches.tournament')} ---</option>
                                {tournaments.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}{t.year ? ` (${t.year})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {recalcMsg && (
                    <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        className="alert alert-info py-3 px-4 shadow-premium border-0 rounded-4 mb-4 d-flex align-items-center gap-3"
                    >
                        <Info size={20}/>
                        <span className="fw-bold">{recalcMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-accent" role="status" style={{width: '3rem', height: '3rem'}}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            {error && (
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    className="alert alert-danger shadow-premium border-0 rounded-4 p-4 text-center"
                >
                    <Activity size={48} className="mb-3 opacity-50"/>
                    <p className="mb-0 fw-bold">{error}</p>
                </motion.div>
            )}

            {!loading && standings.length === 0 && selectedTournament && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="glass-card border-0 shadow-premium text-center py-5 px-4 rounded-4"
                >
                    <div className="display-1 mb-4 opacity-25">⚽</div>
                    <h3 className="fw-black mb-2">{t('matches.no_matches')}</h3>
                    <p className="text-muted">{i18n.language === 'uk' ? 'Для цього турніру ще немає даних в таблиці.' : 'No standings data for this tournament yet.'}</p>
                </motion.div>
            )}

            {/* Банер переможця */}
            {winner && standings.length > 1 && (
                <motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    className="card border-0 shadow-premium mb-5 bg-gradient-premium text-white overflow-hidden rounded-4"
                    style={{background: "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)"}}
                >
                    <div className="card-body d-flex align-items-center gap-4 p-4 position-relative">
                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                            <Trophy size={120}/>
                        </div>
                        <div
                            className="bg-white bg-opacity-20 p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                            style={{width: 84, height: 84}}>
                            {winner.team_logo ? (
                                <img
                                    src={winner.team_logo}
                                    alt={winner.team_name}
                                    style={{
                                        width: 68,
                                        height: 68,
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                        background: "white"
                                    }}
                                />
                            ) : (
                                <Shield size={40} className="text-white"/>
                            )}
                        </div>
                        <div className="position-relative z-1">
                            <h3 className="fw-black mb-1 text-uppercase ls-1">
                                {winner.team_name} {i18n.language === 'uk' ? 'лідирує!' : 'leads!'}
                            </h3>
                            <div className="fs-5 opacity-90 fw-bold">
                                {winner.points !== standings[1]?.points ? (
                                    <span>
                    {winner.points} {i18n.language === 'uk' ? 'очок' : 'points'} — 
                    <span className="ms-2 badge bg-white text-primary rounded-pill">
                      {i18n.language === 'uk' ? 'відрив' : 'gap'}: {winner.points - standings[1].points}
                    </span>
                  </span>
                                ) : (
                                    <span className="d-flex align-items-center gap-2">
                    <Award size={20}/>
                                        {i18n.language === 'uk' ? 'Перевага за додатковими показниками' : 'Advantage by tiebreakers'}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {hasTie && (
                <div
                    className="alert alert-warning py-3 px-4 small border-0 shadow-premium mb-4 rounded-4 d-flex align-items-center gap-3">
                    <Activity size={18}/>
                    <span
                        className="fw-bold">{i18n.language === 'uk' ? 'Увага: Деякі команди мають однакові показники' : 'Warning: Some teams have identical stats'}</span>
                </div>
            )}

            {standings.length > 0 && (
                <>
                    <div className="glass-card shadow-premium rounded-4 overflow-hidden border-0 mb-4">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                <tr className="bg-gradient-premium text-white">
                                    <th className="ps-4 py-4 text-center" width="80"><Hash size={18}/></th>
                                    <th className="py-4">{t('navbar.teams')}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'І' : 'P'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'В' : 'W'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'Н' : 'D'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'П' : 'L'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'ГЗ' : 'GF'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'ГП' : 'GA'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'РГ' : 'GD'}</th>
                                    <th className="text-center py-4">{i18n.language === 'uk' ? 'О' : 'Pts'}</th>
                                    <th className="pe-4 py-4">{i18n.language === 'uk' ? 'Статус' : 'Status'}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {standings.map((row, index) => {
                                    const note = getTiebreakNote(row, standings, t);
                                    const isFirst = index === 0;
                                    const isSecond = index === 1;
                                    const isThird = index === 2;
                                    const isTied =
                                        (index < standings.length - 1 &&
                                            standings[index + 1].points === row.points &&
                                            standings[index + 1].goal_difference === row.goal_difference &&
                                            standings[index + 1].goals_for === row.goals_for) ||
                                        (index > 0 &&
                                            standings[index - 1].points === row.points &&
                                            standings[index - 1].goal_difference === row.goal_difference &&
                                            standings[index - 1].goals_for === row.goals_for);

                                    return (
                                        <motion.tr
                                            key={row.id}
                                            initial={{opacity: 0, x: -10}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{delay: index * 0.05}}
                                            className={isFirst ? "bg-primary bg-opacity-5" : ""}
                                        >
                                            <td className="ps-4 text-center">
                                                <div className={`
                            rank-circle mx-auto
                            ${isFirst ? "rank-1" : isSecond ? "rank-2" : isThird ? "rank-3" : ""}
                          `}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td>
                                                <Link to={`/teams/${row.team}`}
                                                      className="text-decoration-none d-flex align-items-center group">
                                                    <div
                                                        className="standing-logo-container me-3 shadow-sm rounded-circle overflow-hidden bg-white p-1">
                                                        {row.team_logo ? (
                                                            <img src={row.team_logo} alt="" className="standing-logo"/>
                                                        ) : (
                                                            <Shield size={24} className="text-muted m-1"/>
                                                        )}
                                                    </div>
                                                    <span
                                                        className="fw-black standing-team-name transition-all fs-5">{row.team_name}</span>
                                                </Link>
                                            </td>
                                            <td className="text-center fw-bold">{row.played}</td>
                                            <td className="text-center text-success fw-black">{row.won}</td>
                                            <td className="text-center text-muted fw-bold">{row.drawn}</td>
                                            <td className="text-center text-danger fw-bold">{row.lost}</td>
                                            <td className="text-center text-muted small">{row.goals_for}</td>
                                            <td className="text-center text-muted small">{row.goals_against}</td>
                                            <td className="text-center">
                          <span
                              className={`badge rounded-pill px-3 ${row.goal_difference > 0 ? "bg-success" : row.goal_difference < 0 ? "bg-danger" : "bg-secondary"} bg-opacity-10 text-${row.goal_difference > 0 ? "success" : row.goal_difference < 0 ? "danger" : "secondary"}`}>
                            {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                          </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="pts-badge">
                                                    {row.points}
                                                </div>
                                            </td>
                                            <td className="pe-4">
                                                {note ? (
                                                    <span
                                                        className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 small d-flex align-items-center gap-1 w-fit">
                              <Medal size={14}/> {note}
                            </span>
                                                ) : isTied ? (
                                                    <span
                                                        className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-2 small d-flex align-items-center gap-1 w-fit">
                              <Activity size={14}/> {i18n.language === 'uk' ? 'Рівні' : 'Tied'}
                            </span>
                                                ) : (
                                                    <div className="opacity-25 text-center">—</div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        className="glass-card border-0 p-4 shadow-premium rounded-4"
                    >
                        <div className="row g-4">
                            <div className="col-md-6">
                                <h6 className="fw-black text-uppercase ls-1 text-primary mb-3 d-flex align-items-center gap-2">
                                    <Info size={18}/> {i18n.language === 'uk' ? 'Легенда' : 'Legend'}
                                </h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {[
                                        {l: 'І', f: i18n.language === 'uk' ? 'Ігри' : 'Played'},
                                        {l: 'В', f: i18n.language === 'uk' ? 'Виграші' : 'Wins'},
                                        {l: 'Н', f: i18n.language === 'uk' ? 'Нічиї' : 'Draws'},
                                        {l: 'П', f: i18n.language === 'uk' ? 'Поразки' : 'Losses'},
                                        {l: 'ГЗ', f: i18n.language === 'uk' ? 'Голи забиті' : 'Goals For'},
                                        {l: 'ГП', f: i18n.language === 'uk' ? 'Голи пропущені' : 'Goals Against'},
                                        {l: 'РГ', f: i18n.language === 'uk' ? 'Різниця голів' : 'Goal Difference'},
                                        {l: 'О', f: i18n.language === 'uk' ? 'Очки' : 'Points'}
                                    ].map((item, i) => (
                                        <span key={i} className="badge bg-light text-dark border p-2 fw-bold">
                      <span className="text-primary me-1">{item.l}</span> — {item.f}
                    </span>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-6 border-start-md">
                                <h6 className="fw-black text-uppercase ls-1 text-primary mb-3 d-flex align-items-center gap-2">
                                    <Award
                                        size={18}/> {i18n.language === 'uk' ? 'Правила тай-брейку' : 'Tie-break Rules'}
                                </h6>
                                <p className="text-muted small fw-bold mb-0">
                                    {i18n.language === 'uk'
                                        ? '* Критерії при рівності очок: 1) Краща різниця голів → 2) Більше забитих голів → 3) Алфавітний порядок назв команд.'
                                        : '* Criteria for equal points: 1) Better goal difference → 2) More goals scored → 3) Alphabetical order of team names.'
                                    }
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}

export default StandingsPage;
