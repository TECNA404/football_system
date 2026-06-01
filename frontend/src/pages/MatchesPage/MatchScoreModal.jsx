import React from "react";
import { useTranslation } from "react-i18next";

function MatchScoreModal({ editingMatch, scoreForm, setScoreForm, onSave, onClose }) {
  const { t, i18n } = useTranslation();

  if (!editingMatch) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white border-0">
            <h5 className="modal-title fw-bold">
              {i18n.language === "uk" ? "Результат матчу" : "Match Result"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <div className="small text-muted mb-2">{editingMatch.tournament_name}</div>
              <div className="h5 fw-bold">
                {editingMatch.home_team_name} vs {editingMatch.away_team_name}
              </div>
            </div>
            <div className="row align-items-center g-3">
              <div className="col-5">
                <label className="form-label small text-center d-block text-muted">
                  {editingMatch.home_team_name}
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg text-center fw-bold"
                  value={scoreForm.home_score}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, home_score: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="col-2 text-center h3 mt-4">:</div>
              <div className="col-5">
                <label className="form-label small text-center d-block text-muted">
                  {editingMatch.away_team_name}
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg text-center fw-bold"
                  value={scoreForm.away_score}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, away_score: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 p-4 pt-0">
            <button className="btn btn-light px-4 fw-bold" onClick={onClose}>
              {i18n.language === "uk" ? "Скасувати" : "Cancel"}
            </button>
            <button className="btn btn-success px-4 fw-bold shadow-sm" onClick={onSave}>
              {i18n.language === "uk" ? "Зберегти результат" : "Save Result"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchScoreModal;
