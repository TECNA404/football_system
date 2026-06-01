import React from "react";
import { Plus, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

function MatchForm({
  form,
  setForm,
  tournaments,
  availableTeams,
  matchError,
  loading,
  handleCreate,
  onFormTournamentChange,
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="card border-0 shadow-premium rounded-4 overflow-hidden mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="card-header bg-primary text-white p-4 border-0 d-flex justify-content-between align-items-center">
        <h5 className="fw-black mb-0 d-flex align-items-center gap-2">
          <Plus size={22} /> {t("matches.add_match")}
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
              <label className="form-label small fw-bold text-muted">
                {t("matches.tournament")}
              </label>
              <select
                className="form-select border shadow-sm py-2"
                value={form.tournament}
                onChange={(e) => {
                  setForm({ ...form, tournament: e.target.value, home_team: "", away_team: "" });
                  onFormTournamentChange(e.target.value);
                }}
                required
              >
                <option value="">{t("matches.tournament")}...</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small fw-bold text-muted">
                  {t("matches.home_team")}
                </label>
                <select
                  className="form-select border shadow-sm py-2"
                  value={form.home_team}
                  onChange={(e) => setForm({ ...form, home_team: e.target.value })}
                  required
                  disabled={!form.tournament}
                >
                  <option value="">{t("matches.home_team")}...</option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold text-muted">
                  {t("matches.away_team")}
                </label>
                <select
                  className="form-select border shadow-sm py-2"
                  value={form.away_team}
                  onChange={(e) => setForm({ ...form, away_team: e.target.value })}
                  required
                  disabled={!form.tournament}
                >
                  <option value="">{t("matches.away_team")}...</option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">
                {t("matches.date")}
              </label>
              <input
                type="datetime-local"
                className="form-control border shadow-sm py-2"
                value={form.played_at}
                onChange={(e) => setForm({ ...form, played_at: e.target.value })}
                required
              />
            </div>
            {matchError && <div className="text-danger mb-3 small">{matchError}</div>}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 shadow-premium"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
              <Plus size={20} className="me-2" /> {t("common.add")}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default MatchForm;
