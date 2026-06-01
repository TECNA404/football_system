import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Camera, Edit2 } from "lucide-react";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";
import { formatDateOnly } from "../../utils/formatters";

function TeamNameSection({
  team,
  editingName,
  setEditingName,
  isEditingName,
  setIsEditingName,
  onSaveTeamName,
  onLogoUpdate,
}) {
  const { t, i18n } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-0 shadow-sm mb-4 overflow-hidden"
    >
      <div className="bg-primary p-4 position-relative">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <img
              src={team.logo_url}
              alt={team.name}
              className="rounded-circle bg-white"
              style={{ width: 80, height: 80, objectFit: "cover", border: "3px solid white" }}
              onError={(e) => handleImageError(e, getPlaceholder("TEAM"))}
            />
            <label
              className="position-absolute bottom-0 right-0 bg-white rounded-circle p-1 shadow-sm cursor-pointer"
              style={{ right: -5, bottom: -5 }}
            >
              <Camera size={16} className="text-primary" />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onLogoUpdate(e.target.files[0])}
              />
            </label>
          </div>
          <div className="flex-grow-1 text-white">
            {isEditingName ? (
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-lg py-1"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={onSaveTeamName}
                  onKeyDown={(e) => e.key === "Enter" && onSaveTeamName()}
                  autoFocus
                />
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold mb-0">{team.name}</h3>
                <button
                  className="btn btn-link text-white p-0 opacity-75"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit2 size={18} />
                </button>
              </div>
            )}
            <p className="mb-0 opacity-75 small">
              {t("common.created")}: {formatDateOnly(team.created_at, i18n.language)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TeamNameSection;
