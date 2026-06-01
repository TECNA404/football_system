import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Camera, Edit2 } from "lucide-react";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";

function TeamInfoCard({
  team,
  editingName,
  setEditingName,
  isEditingName,
  setIsEditingName,
  editingDescription,
  setEditingDescription,
  isEditingDescription,
  setIsEditingDescription,
  isAuth,
  onSaveTeamName,
  onSaveTeamDescription,
  onLogoUpdate,
}) {
  const { t, i18n } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card border-0 shadow-lg mb-4 overflow-hidden"
    >
      <div className="position-relative" style={{ height: "200px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="position-absolute top-0 end-0 p-3">
          {isAuth && (
            <button
              className="btn btn-light btn-sm d-flex align-items-center gap-2"
              onClick={() => setIsEditingDescription(!isEditingDescription)}
            >
              <Edit2 size={16} />
              {isEditingDescription ? t("common.cancel") : t("common.edit")}
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Team Logo & Name */}
        <div className="d-flex align-items-start gap-4 mb-4">
          <div className="position-relative">
            <img
              src={team.logo_url}
              alt={team.name}
              className="rounded-4 border-4 border-white shadow-lg"
              style={{ width: "120px", height: "120px", objectFit: "cover", marginTop: "-80px" }}
              onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
            />
            {isAuth && (
              <label
                className="position-absolute bottom-0 right-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer"
                style={{ right: -10, bottom: -10 }}
              >
                <Camera size={18} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => onLogoUpdate(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="flex-grow-1">
            {isEditingName ? (
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control form-control-lg"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={onSaveTeamName}
                  onKeyDown={(e) => e.key === "Enter" && onSaveTeamName()}
                  autoFocus
                />
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 mb-2">
                <h2 className="fw-bold mb-0">{team.name}</h2>
                {isAuth && (
                  <button
                    className="btn btn-link p-0 opacity-75"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 size={20} />
                  </button>
                )}
              </div>
            )}
            <p className="text-muted mb-0">
              {i18n.language === "uk" ? "Команда" : "Team"}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h6 className="fw-bold text-muted mb-2">
            {i18n.language === "uk" ? "Опис" : "Description"}
          </h6>
          {isEditingDescription ? (
            <div className="d-flex gap-2">
              <textarea
                className="form-control"
                rows="3"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder={i18n.language === "uk" ? "Введіть опис команди..." : "Enter team description..."}
              />
              <button
                className="btn btn-success d-flex align-items-center gap-1"
                onClick={onSaveTeamDescription}
              >
                {t("common.save")}
              </button>
            </div>
          ) : (
            <p className="text-secondary">
              {team.description || (i18n.language === "uk" ? "Немає опису" : "No description")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TeamInfoCard;
