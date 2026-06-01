import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Camera, Save, Award } from "lucide-react";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";

function CoachSection({
  team,
  coachName,
  coachExp,
  coachPhotoFile,
  coachPhotoUrl,
  coachPreview,
  setCoachName,
  setCoachExp,
  setCoachPhotoFile,
  setCoachPhotoUrl,
  setCoachPreview,
  onSaveCoach,
}) {
  const { t, i18n } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card border-0 shadow-sm mb-4"
    >
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <User className="text-primary" size={20} />{" "}
          {i18n.language === "uk" ? "Головний тренер" : "Head Coach"}
        </h5>
        <div className="row g-3">
          <div className="col-12 text-center mb-3">
            <div className="position-relative d-inline-block">
              <img
                src={coachPreview || getPlaceholder("COACH")}
                className="rounded-circle border"
                style={{ width: 120, height: 120, objectFit: "cover" }}
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
      </div>
    </motion.div>
  );
}

export default CoachSection;
