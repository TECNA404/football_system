import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Edit2, Trophy, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/formatters";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";

function MatchList({ filteredMatches, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();

  return (
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
            <h4 className="fw-black text-muted">{t("matches.no_matches")}</h4>
            <p className="text-muted">
              {i18n.language === "uk"
                ? "Спробуйте змінити фільтри або додайте новий матч"
                : "Try changing filters or add a new match"}
            </p>
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
                          <Link
                            to={`/teams/${m.home_team}`}
                            className="text-decoration-none text-dark d-none d-md-inline fw-black fs-5 hover-primary"
                          >
                            {m.home_team_name}
                          </Link>
                          <img
                            src={m.home_team_logo}
                            alt=""
                            className="match-team-logo-large shadow-sm"
                            onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
                          />
                        </div>
                        <div className="fw-black fs-6 mt-2 d-md-none">{m.home_team_name}</div>
                      </div>

                      <div className="col-4 text-center">
                        <div className="d-flex flex-column align-items-center">
                          {m.is_finished ? (
                            <div className="score-display mb-2">
                              <span className="fw-black fs-1 text-gradient">
                                {m.home_score} : {m.away_score}
                              </span>
                            </div>
                          ) : (
                            <div className="bg-primary text-white px-4 py-2 rounded-pill fw-black mb-2 shadow-sm">
                              VS
                            </div>
                          )}
                          <div>
                            {m.is_finished ? (
                              <span className="badge bg-secondary rounded-pill px-3">
                                {t("matches.finished")}
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
                            onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
                          />
                          <Link
                            to={`/teams/${m.away_team}`}
                            className="text-decoration-none text-dark d-none d-md-inline fw-black fs-5 hover-primary"
                          >
                            {m.away_team_name}
                          </Link>
                        </div>
                        <div className="fw-black fs-6 mt-2 d-md-none">{m.away_team_name}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-light bg-opacity-25 border-top d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-light px-3 rounded-pill"
                          onClick={() => onEdit(m)}
                        >
                          <Edit2 size={16} className="me-1 text-warning" /> {t("common.edit")}
                        </button>
                        <button
                          className="btn btn-sm btn-light px-3 rounded-pill text-danger"
                          onClick={() => onDelete(m.id)}
                        >
                          <Trash2 size={16} className="me-1" /> {t("common.delete")}
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
  );
}

export default MatchList;
