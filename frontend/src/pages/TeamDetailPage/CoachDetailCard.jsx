import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Camera, Save, X, Award } from "lucide-react";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";

function CoachDetailCard({
  team,
  isAuth,
  coachName,
  coachExp,
  coachDescription,
  coachPhotoFile,
  coachPhotoUrl,
  coachPreview,
  setCoachName,
  setCoachExp,
  setCoachDescription,
  setCoachPhotoFile,
  setCoachPhotoUrl,
  setCoachPreview,
  isEditingCoach,
  setIsEditingCoach,
  onSaveCoach,
}) {
  const { t, i18n } = useTranslation();

  if (!team.coach && !isEditingCoach)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="alert alert-info d-flex align-items-center gap-2 mb-4"
      >
        <User size={20} />
        {i18n.language === "uk" ? "У команди немає тренера" : "No coach for this team"}
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card border-0 shadow-lg mb-4"
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <User className="text-primary" size={20} />
            {i18n.language === "uk" ? "Головний тренер" : "Head Coach"}
          </h5>
          {isAuth && (
            <button
              className={`btn btn-sm ${isEditingCoach ? "btn-outline-secondary" : "btn-primary"}`}
              onClick={() => setIsEditingCoach(!isEditingCoach)}
            >
              {isEditingCoach ? <X size={16} /> : "Edit"}
            </button>
          )}
        </div>

        {isEditingCoach ? (
          <div className="row g-3">
            <div className="col-12 text-center mb-3">
              <div className="position-relative d-inline-block">
                <img
                  src={coachPreview || getPlaceholder("COACH")}
                  className="rounded-circle border-4"
                  style={{ width: 150, height: 150, objectFit: "cover" }}
                  alt="Coach"
                />
                <label
                  className="position-absolute bottom-0 right-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer"
                  style={{ right: 5, bottom: 5 }}
                >
                  <Camera size={18} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setCoachPhotoFile(file);
                      if (file) setCoachPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-muted">
                {i18n.language === "uk" ? "Ім'я тренера" : "Coach Name"}
              </label>
              <input
                className="form-control"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-muted">
                {i18n.language === "uk" ? "Досвід (років)" : "Experience (years)"}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Award size={18} />
                </span>
                <input
                  type="number"
                  className="form-control"
                  value={coachExp}
                  onChange={(e) => setCoachExp(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-muted">
                {i18n.language === "uk" ? "Опис" : "Description"}
              </label>
              <textarea
                className="form-control"
                rows="3"
                value={coachDescription}
                onChange={(e) => setCoachDescription(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-muted">
                {i18n.language === "uk" ? "Фото (URL)" : "Photo (URL)"}
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="https://..."
                value={coachPhotoUrl}
                onChange={(e) => setCoachPhotoUrl(e.target.value)}
              />
            </div>
            <div className="col-12 mt-4">
              <button
                className="btn btn-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={onSaveCoach}
              >
                <Save size={18} /> {t("common.save")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="row align-items-center g-4 mb-4">
              <div className="col-md-3 text-center">
                <img
                  src={team.coach?.photo_url}
                  alt={team.coach?.name}
                  className="rounded-4 border-4 shadow-sm"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  onError={(e) => handleImageError(e, getPlaceholder("COACH"))}
                />
              </div>
              <div className="col-md-9">
                <h5 className="fw-bold mb-1">{team.coach?.name}</h5>
                <p className="text-muted mb-2">
                  <Award className="me-2" size={16} />
                  {team.coach?.experience_years}{" "}
                  {i18n.language === "uk" ? "років досвіду" : "years of experience"}
                </p>
                <p className="text-secondary">
                  {team.coach?.description ||
                    (i18n.language === "uk"
                      ? "Немає опису"
                      : "No description")}
                </p>
                <Link to={`/coaches/${team.coach?.id}`} className="btn btn-sm btn-outline-primary">
                  {i18n.language === "uk" ? "Переглянути профіль" : "View Profile"}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default CoachDetailCard;
