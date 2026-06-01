import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  ArrowRight,
  Shield,
  Activity,
  Clock,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../components/AuthContext";
import {
  getPublicTournaments,
  getAllPublicMatches,
  getAllPublicTeams,
  getGlobalStats,
} from "../api/tournamentsApi";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";

function Counter({ end, duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const safeEnd = Number(end) || 0;
    const increment = safeEnd / (duration * 60 || 1);

    const timer = setInterval(() => {
      start += increment;
      if (start >= safeEnd) {
        setCount(safeEnd);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
}

function HomePage() {
  const { isAuth } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState({
    tournaments: [],
    matches: [],
    teams: [],
    globalStats: {
      tournaments_count: 0,
      teams_count: 0,
      matches_count: 0,
      total_goals: 0,
    },
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, mRes, teamsRes, sRes] = await Promise.all([
          getPublicTournaments(),
          getAllPublicMatches(),
          getAllPublicTeams(),
          getGlobalStats(),
        ]);

        setData({
          tournaments: tRes.data || [],
          matches: mRes.data || [],
          teams: teamsRes.data || [],
          globalStats: sRes.data || {
            tournaments_count: 0,
            teams_count: 0,
            matches_count: 0,
            total_goals: 0,
          },
          loading: false,
        });
      } catch (err) {
        console.error("Error fetching home data:", err);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  return (
    <div className="overflow-hidden home-page-shell">
      <div className="hero-section-light position-relative overflow-hidden min-vh-100 d-flex align-items-center py-5">
        <div className="hero-bg-overlay position-absolute top-0 start-0 w-100 h-100 z-0">
          <div className="bg-glow-1"></div>
          <div className="bg-glow-2"></div>
          <div className="grid-overlay-light"></div>
        </div>

        <motion.div
          className="container position-relative z-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-lg-start text-center">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.55 }}
              >
                <span className="badge bg-accent-gradient text-dark fw-black px-4 py-2 rounded-pill mb-4 ls-1 text-uppercase shadow-sm">
                  <Zap size={14} className="me-1" />
                  Next-Gen Football Management
                </span>

                <h1 className="display-2 fw-black text-dark mb-4 ls-tight hero-title">
                  {t("home.hero_title")} <span className="text-gradient">2.0</span>
                </h1>

                <p className="lead fs-4 hero-subtitle mb-5 fw-medium">
                  {t("home.hero_subtitle")}
                </p>

                <div className="d-flex flex-wrap gap-3 justify-content-lg-start justify-content-center">
                  {isAuth ? (
                    <>
                      <Link
                        to="/tournaments"
                        className="btn btn-accent btn-xl px-5 py-3 shadow-premium rounded-pill fw-black d-flex align-items-center gap-2"
                      >
                        <Trophy size={22} />
                        {t("home.my_tournaments")}
                      </Link>

                      <Link
                        to="/teams"
                        className="btn btn-outline-success btn-xl px-5 py-3 rounded-pill fw-black d-flex align-items-center gap-2"
                      >
                        <Shield size={22} />
                        {t("navbar.teams")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/public"
                        className="btn btn-accent btn-xl px-5 py-3 shadow-premium rounded-pill fw-black d-flex align-items-center gap-2"
                      >
                        <Activity size={22} />
                        {t("home.view_tournaments")}
                      </Link>

                      <Link
                        to="/register"
                        className="btn btn-outline-success btn-xl px-5 py-3 rounded-pill fw-black d-flex align-items-center gap-2"
                      >
                        <Users size={22} />
                        {t("auth.register_btn")}
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <motion.div
                className="hero-card-stack position-relative"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.7 }}
              >
                <div className="glass-card-light main-hero-card p-4 rounded-5 shadow-premium border-accent">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 bg-accent rounded-3 text-dark">
                        <TrendingUp size={20} />
                      </div>
                      <span className="fw-black text-uppercase ls-1 small text-dark">
                        Live Analytics
                      </span>
                    </div>

                    <div className="badge bg-success-soft text-success rounded-pill px-3 py-1 fw-bold">
                      Active
                    </div>
                  </div>

                  <div className="stats-row row g-3">
                    <div className="col-6">
                      <div className="p-3 stat-mini-card rounded-4">
                        <div className="text-muted small fw-bold mb-1">Tournaments</div>
                        <div className="fs-3 fw-black text-dark">
                          <Counter end={data.globalStats.tournaments_count} />
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-3 stat-mini-card rounded-4">
                        <div className="text-muted small fw-bold mb-1">Goals</div>
                        <div className="fs-3 fw-black text-warning">
                          <Counter end={data.globalStats.total_goals} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-top border-secondary-subtle">
                    <div className="d-flex align-items-center justify-content-between text-muted small mb-2">
                      <span>System Health</span>
                      <span>99.9%</span>
                    </div>

                    <div className="progress bg-light rounded-pill hero-progress-track" style={{ height: 8 }}>
                      <div
                        className="progress-bar hero-progress-bar rounded-pill"
                        style={{ width: "99.9%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="floating-icon trophy-float"
                  animate={{ y: [0, -18, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <Trophy size={48} className="text-warning" />
                </motion.div>

                <motion.div
                  className="floating-icon shield-float"
                  animate={{ y: [0, 18, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <Shield size={40} className="text-success" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="stats-strip-light py-4 border-top border-bottom">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-3 col-md-6 border-end-lg border-secondary-subtle">
              <div className="d-flex align-items-center gap-3 px-lg-4 stat-strip-item">
                <div className="stats-icon text-warning">
                  <Trophy size={32} />
                </div>
                <div>
                  <div className="fs-4 fw-black text-dark">
                    <Counter end={data.globalStats.tournaments_count} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold ls-1">
                    {t("navbar.tournaments")}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 border-end-lg border-secondary-subtle">
              <div className="d-flex align-items-center gap-3 px-lg-4 stat-strip-item">
                <div className="stats-icon text-success">
                  <Shield size={32} />
                </div>
                <div>
                  <div className="fs-4 fw-black text-dark">
                    <Counter end={data.globalStats.teams_count} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold ls-1">
                    {t("navbar.teams")}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 border-end-lg border-secondary-subtle">
              <div className="d-flex align-items-center gap-3 px-lg-4 stat-strip-item">
                <div className="stats-icon text-primary">
                  <Activity size={32} />
                </div>
                <div>
                  <div className="fs-4 fw-black text-dark">
                    <Counter end={data.globalStats.matches_count} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold ls-1">
                    {t("navbar.matches")}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="d-flex align-items-center gap-3 px-lg-4 stat-strip-item">
                <div className="stats-icon text-danger">
                  <Target size={32} />
                </div>
                <div>
                  <div className="fs-4 fw-black text-dark">
                    <Counter end={data.globalStats.total_goals} />
                  </div>
                  <div className="text-muted small text-uppercase fw-bold ls-1">
                    {t("home.total_goals")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-black mb-0 text-gradient">{t("home.latest_tournaments")}</h2>
            <p className="text-muted mb-0 fw-bold">
              {t("home.join_best_competitions")}
            </p>
          </div>

          <Link
            to="/public"
            className="btn btn-outline-success rounded-pill fw-black px-4 d-inline-flex align-items-center gap-2"
          >
            {t("home.view_all")} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="row g-4">
          {data.tournaments.slice(0, 3).map((tournament, i) => (
            <motion.div
              key={tournament.id}
              className="col-md-4"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/public#${tournament.id}`}
                className="text-decoration-none text-dark"
              >
                <div className="glass-card-light tournament-card-soft border-0 shadow-premium h-100 hover-up overflow-hidden rounded-4">
                  <div className="bg-gradient-premium p-4 text-white text-center position-relative">
                    <div className="position-absolute top-0 end-0 p-2 opacity-10">
                      <Trophy size={60} />
                    </div>
                    <Trophy size={48} className="mb-2 text-warning" />
                    <h4 className="fw-black mb-0 text-uppercase ls-1">{tournament.name}</h4>
                  </div>

                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                      <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-pill shadow-sm">
                        {tournament.year}
                      </span>
                      <span
                        className="fw-black text-uppercase ls-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {tournament.owner_name}
                      </span>
                    </div>

                    <p className="card-text text-muted fw-bold mb-0 line-clamp-2">
                      {tournament.description || t("home.no_description")}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {data.tournaments.length === 0 && !data.loading && (
            <div className="col-12 text-center py-5 glass-card-light rounded-4">
              <p className="text-muted mb-0 fw-bold">{t("tournaments.no_tournaments")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-premium-soft py-5 mt-5">
        <div className="container py-4">
          <div className="row g-5">
            <div className="col-lg-7">
              <h3 className="fw-black text-uppercase ls-1 mb-4 d-flex align-items-center gap-3 text-dark">
                <div className="p-2 bg-primary rounded-3 text-white">
                  <Clock size={24} />
                </div>
                {t("home.recent_matches")}
              </h3>

              <div className="d-flex flex-column gap-3">
                {data.matches.length > 0 ? (
                  data.matches.slice(0, 5).map((match, i) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -18 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="glass-card-light border-0 shadow-premium p-3 rounded-4 hover-up match-card-soft"
                    >
                      <div className="row align-items-center text-center g-3">
                        <div className="col-md-4 text-md-end">
                          <div className="d-flex align-items-center justify-content-md-end gap-2">
                            <span className="fw-black text-dark text-truncate">
                              {match.home_team}
                            </span>
                            <div
                              className="flex-shrink-0 team-logo-shell p-1 rounded-circle shadow-sm"
                              style={{
                                width: 42,
                                height: 42,
                                display: "flex",
                                alignItems: "center",
                                justifyItems: "center",
                              }}
                            >
                              {match.home_team_logo ? (
                                <img
                                  src={match.home_team_logo}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                  onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
                                />
                              ) : (
                                <Shield size={20} className="text-muted mx-auto" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="score-pill px-4 py-2 rounded-pill fw-black fs-5 d-inline-block">
                            {match.home_score !== null ? match.home_score : "-"} :{" "}
                            {match.away_score !== null ? match.away_score : "-"}
                          </div>
                          <div
                            className="small text-muted mt-2 fw-black text-uppercase ls-1"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {match.tournament_name}
                          </div>
                        </div>

                        <div className="col-md-4 text-md-start">
                          <div className="d-flex align-items-center justify-content-md-start gap-2">
                            <div
                              className="flex-shrink-0 team-logo-shell p-1 rounded-circle shadow-sm"
                              style={{
                                width: 42,
                                height: 42,
                                display: "flex",
                                alignItems: "center",
                                justifyItems: "center",
                              }}
                            >
                              {match.away_team_logo ? (
                                <img
                                  src={match.away_team_logo}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                  onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
                                />
                              ) : (
                                <Shield size={20} className="text-muted mx-auto" />
                              )}
                            </div>
                            <span className="fw-black text-dark text-truncate">
                              {match.away_team}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  !data.loading && (
                    <p className="text-center py-5 glass-card-light rounded-4 text-muted fw-bold">
                      {t("matches.no_matches")}
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="col-lg-5">
              <h3 className="fw-black text-uppercase ls-1 mb-4 d-flex align-items-center gap-3 text-dark">
                <div className="p-2 bg-primary rounded-3 text-white">
                  <Shield size={24} />
                </div>
                {t("home.participating_teams")}
              </h3>

              <div className="glass-card-light p-4 rounded-4 shadow-premium border-0">
                <div className="row g-4">
                  {data.teams.slice(0, 12).map((team, i) => (
                    <motion.div
                      key={team.id}
                      className="col-4 col-md-3 text-center"
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Link to={`/teams/${team.id}`} className="text-decoration-none group">
                        <div
                          className="p-2 team-logo-shell rounded-circle shadow-sm mx-auto mb-2 hover-up transition-all group-hover-primary"
                          style={{
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {team.logo ? (
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="img-fluid rounded"
                              style={{ maxHeight: "100%" }}
                              onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
                            />
                          ) : (
                            <Shield size={24} className="text-muted" />
                          )}
                        </div>
                        <div className="small fw-black text-truncate text-dark group-hover-primary">
                          {team.name}
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {data.teams.length === 0 && !data.loading && (
                    <p className="text-center py-5 text-muted fw-bold w-100">
                      {t("teams.no_teams")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row align-items-center g-5">
          <motion.div
            className="col-lg-6"
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-green fw-black text-uppercase ls-1 mb-2 d-block">
              Premium Experience
            </span>

            <h2 className="display-4 fw-black mb-4 text-dark">
              {t("home.why_choose_us")}
            </h2>

            <div className="d-flex gap-4 mb-4 glass-card-light p-4 rounded-4 border feature-card-soft">
              <div className="flex-shrink-0">
                <div className="p-3 bg-warning bg-opacity-10 rounded-4">
                  <Shield size={32} className="text-warning" />
                </div>
              </div>
              <div>
                <h4 className="fw-black text-dark">{t("home.reliability")}</h4>
                <p className="text-muted fw-medium mb-0">{t("home.reliability_text")}</p>
              </div>
            </div>

            <div className="d-flex gap-4 glass-card-light p-4 rounded-4 border feature-card-soft">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary bg-opacity-10 rounded-4">
                  <Activity size={32} className="text-primary" />
                </div>
              </div>
              <div>
                <h4 className="fw-black text-dark">{t("home.speed")}</h4>
                <p className="text-muted fw-medium mb-0">{t("home.speed_text")}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-lg-6"
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="position-relative">
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-warning opacity-10 blur-3xl rounded-full"></div>
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000"
                alt="Football"
                className="img-fluid rounded-5 shadow-premium position-relative z-1 border border-light-subtle"
              />
              <div className="position-absolute bottom-0 start-0 p-4 z-2">
                <div className="glass-card-light p-3 rounded-4 d-flex align-items-center gap-3 border live-pill-soft">
                  <div className="p-2 bg-success rounded-circle animate-pulse"></div>
                  <span className="fw-black text-dark small text-uppercase ls-1">
                    Live Match Tracking
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

