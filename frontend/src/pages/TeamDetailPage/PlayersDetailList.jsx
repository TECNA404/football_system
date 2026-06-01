import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Camera, Check, X, Edit2, Trash2, Eye } from "lucide-react";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";

function PlayersDetailList({
  team,
  isAuth,
  editingPlayerId,
  playerName,
  playerNumber,
  playerPosition,
  playerDescription,
  playerPreview,
  playerPhotoUrl,
  isAddingPlayer,
  setPlayerName,
  setPlayerNumber,
  setPlayerPosition,
  setPlayerDescription,
  setPlayerPreview,
  setPlayerPhotoUrl,
  setPlayerPhotoFile,
  setEditingPlayerId,
  setIsAddingPlayer,
  onSavePlayer,
  resetPlayerForm,
  startEditPlayer,
  onDeletePlayer,
}) {
  const { t, i18n } = useTranslation();

  const POSITIONS =
    i18n.language === "uk"
      ? [
          { value: "GK", label: "Воротар (GK)" },
          { value: "DF", label: "Захисник (DF)" },
          { value: "MF", label: "Півзахисник (MF)" },
          { value: "FW", label: "Нападник (FW)" },
        ]
      : [
          { value: "GK", label: "Goalkeeper (GK)" },
          { value: "DF", label: "Defender (DF)" },
          { value: "MF", label: "Midfielder (MF)" },
          { value: "FW", label: "Forward (FW)" },
        ];

  const getPositionBadgeClass = (position) => {
    const baseClass = "badge rounded-pill bg-opacity-10 text-dark border ";
    return {
      GK: baseClass + "bg-warning",
      DF: baseClass + "bg-info",
      MF: baseClass + "bg-success",
      FW: baseClass + "bg-danger",
    }[position] || baseClass;
  };

  const PlayerEditForm = () => (
    <div className="card border-0 shadow-sm p-4 mb-4">
      <h6 className="fw-bold mb-4">
        {editingPlayerId
          ? i18n.language === "uk"
            ? "Редагування гравця"
            : "Edit Player"
          : i18n.language === "uk"
          ? "Додавання гравця"
          : "Add Player"}
      </h6>
      <div className="row g-3">
        <div className="col-12 text-center">
          <div className="position-relative d-inline-block">
            <img
              src={playerPreview || getPlaceholder("PLAYER", playerPosition)}
              className="rounded-circle border-4"
              style={{ width: 120, height: 120, objectFit: "cover" }}
              alt=""
            />
            <label
              className="position-absolute bottom-0 right-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer"
              style={{ right: 5, bottom: 5 }}
            >
              <Camera size={16} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setPlayerPhotoFile(file);
                  if (file) setPlayerPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>
        </div>
        <div className="col-6">
          <label className="form-label small fw-bold text-muted">
            {i18n.language === "uk" ? "Номер" : "Number"}
          </label>
          <input
            type="number"
            className="form-control"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
          />
        </div>
        <div className="col-6">
          <label className="form-label small fw-bold text-muted">
            {i18n.language === "uk" ? "Позиція" : "Position"}
          </label>
          <select
            className="form-select"
            value={playerPosition}
            onChange={(e) => setPlayerPosition(e.target.value)}
          >
            {POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label small fw-bold text-muted">
            {i18n.language === "uk" ? "Ім'я" : "Name"}
          </label>
          <input
            type="text"
            className="form-control"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        <div className="col-12">
          <label className="form-label small fw-bold text-muted">
            {i18n.language === "uk" ? "Опис" : "Description"}
          </label>
          <textarea
            className="form-control"
            rows="3"
            value={playerDescription}
            onChange={(e) => setPlayerDescription(e.target.value)}
          />
        </div>
        <div className="col-12">
          <label className="form-label small fw-bold text-muted">
            {i18n.language === "uk" ? "Фото (URL)" : "Photo (URL)"}
          </label>
          <input
            className="form-control form-control-sm"
            placeholder="https://..."
            value={playerPhotoUrl}
            onChange={(e) => setPlayerPhotoUrl(e.target.value)}
          />
        </div>
        <div className="col-12 d-flex gap-2">
          <button
            className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-1"
            onClick={onSavePlayer}
          >
            <Check size={16} /> {t("common.save")}
          </button>
          <button
            className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
            onClick={resetPlayerForm}
          >
            <X size={16} /> {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card border-0 shadow-lg"
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Users className="text-primary" size={20} />
            {i18n.language === "uk" ? "Склад команди" : "Team Squad"} ({team.players?.length || 0})
          </h5>
          {isAuth && !isAddingPlayer && !editingPlayerId && (
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-bold"
              onClick={() => setIsAddingPlayer(true)}
            >
              <Plus size={16} /> {t("common.add")}
            </button>
          )}
        </div>

        <AnimatePresence>
          {(isAddingPlayer || editingPlayerId) && <PlayerEditForm />}
        </AnimatePresence>

        {team.players && team.players.length > 0 ? (
          <div className="row g-3">
            {team.players
              ?.sort((a, b) => a.number - b.number)
              .map((player) => (
                <div key={player.id} className="col-12 col-md-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card border-0 shadow-sm h-100 position-relative"
                  >
                    <div className="position-relative" style={{ height: "150px", overflow: "hidden" }}>
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={(e) =>
                          handleImageError(e, getPlaceholder("PLAYER", player.position))
                        }
                      />
                      <div className="position-absolute top-0 end-0 p-2">
                        <span
                          className={`badge rounded-pill fw-bold ${getPositionBadgeClass(
                            player.position
                          )}`}
                        >
                          {POSITIONS.find((pos) => pos.value === player.position)?.label ||
                            player.position}
                        </span>
                      </div>
                      <div className="position-absolute bottom-0 start-0 p-2 bg-dark bg-opacity-50 text-white w-100">
                        <p className="mb-0 fw-bold">{player.name}</p>
                        <small className="text-warning">#{player.number}</small>
                      </div>
                    </div>
                    <div className="card-body p-3">
                      <p className="text-secondary small mb-3">
                        {player.description ||
                          (i18n.language === "uk" ? "Немає опису" : "No description")}
                      </p>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/players/${player.id}`}
                          className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        >
                          <Eye size={14} /> {t("common.view")}
                        </Link>
                        {isAuth && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => startEditPlayer(player)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDeletePlayer(player.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
          </div>
        ) : (
          <div className="alert alert-info">
            {i18n.language === "uk" ? "Немає гравців" : "No players"}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PlayersDetailList;
