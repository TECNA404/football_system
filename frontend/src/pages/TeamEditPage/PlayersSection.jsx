import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Camera, Check, X, Edit2, Trash2 } from "lucide-react";
import { handleImageError, getPlaceholder } from "../../utils/imageUtils";

function PlayersSection({
  team,
  editingPlayerId,
  playerName,
  playerNumber,
  playerPosition,
  playerPreview,
  playerPhotoUrl,
  isAddingPlayer,
  setPlayerName,
  setPlayerNumber,
  setPlayerPosition,
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

  const PlayerFormRow = ({ isNew = false }) => (
    <tr className="table-success-light">
      <td className="ps-4">
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder="#"
          value={playerNumber}
          onChange={(e) => setPlayerNumber(e.target.value)}
        />
      </td>
      <td>
        <div className="d-flex flex-column gap-1">
          <div className="d-flex align-items-center gap-2">
            <div className="position-relative" style={{ width: 32, height: 32, flexShrink: 0 }}>
              <img
                src={playerPreview || getPlaceholder("PLAYER", playerPosition)}
                className="rounded-circle border"
                style={{ width: 32, height: 32, objectFit: "cover" }}
                alt=""
              />
              <label
                className="position-absolute bottom-0 right-0 bg-dark text-white rounded-circle cursor-pointer"
                style={{ padding: "1px" }}
              >
                <Camera size={8} />
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
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder={i18n.language === "uk" ? "Ім'я" : "Name"}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="form-control form-control-xs"
            style={{ fontSize: "0.75rem" }}
            placeholder="Photo URL"
            value={playerPhotoUrl}
            onChange={(e) => setPlayerPhotoUrl(e.target.value)}
          />
        </div>
      </td>
      <td>
        <select
          className="form-select form-select-sm"
          value={playerPosition}
          onChange={(e) => setPlayerPosition(e.target.value)}
        >
          {POSITIONS.map((pos) => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
      </td>
      <td className="text-end pe-4">
        <div className="d-flex justify-content-end gap-1">
          <button
            className="btn btn-sm btn-success p-1"
            title={t("common.add")}
            onClick={onSavePlayer}
          >
            <Check size={16} />
          </button>
          <button
            className="btn btn-sm btn-outline-secondary p-1"
            title={t("common.cancel")}
            onClick={resetPlayerForm}
          >
            <X size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  const getPositionBadgeClass = (position) => {
    const baseClass = "badge rounded-pill bg-opacity-10 text-dark border ";
    return {
      GK: baseClass + "bg-warning",
      DF: baseClass + "bg-info",
      MF: baseClass + "bg-success",
      FW: baseClass + "bg-danger",
    }[position] || baseClass;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card border-0 shadow-sm"
    >
      <div className="card-body p-0">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Users className="text-primary" size={20} />{" "}
            {i18n.language === "uk" ? "Склад команди" : "Team Squad"}
          </h5>
          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-light text-primary border me-2">
              {team.players?.length || 0}{" "}
              {i18n.language === "uk" ? "гравців" : "players"}
            </span>
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-bold"
              onClick={() => {
                resetPlayerForm();
                setIsAddingPlayer(true);
              }}
            >
              <Plus size={16} /> {t("common.add")}
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted text-uppercase">
                <th className="ps-4" width="80">
                  #
                </th>
                <th>{i18n.language === "uk" ? "Гравець" : "Player"}</th>
                <th width="120">{i18n.language === "uk" ? "Позиція" : "Position"}</th>
                <th className="text-end pe-4" width="120">
                  {i18n.language === "uk" ? "Дії" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row for adding new player */}
              <AnimatePresence>
                {isAddingPlayer && (
                  <motion.tr
                    initial={{ opacity: 0, backgroundColor: "rgba(40, 167, 69, 0.05)" }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PlayerFormRow isNew={true} />
                  </motion.tr>
                )}
              </AnimatePresence>

              {team.players
                ?.sort((a, b) => a.number - b.number)
                .map((p) => (
                  <tr key={p.id}>
                    {editingPlayerId === p.id ? (
                      <PlayerFormRow />
                    ) : (
                      <>
                        <td className="ps-4 fw-bold text-primary">{p.number}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={p.photo_url}
                              alt={p.name}
                              className="rounded-circle border"
                              style={{ width: 40, height: 40, objectFit: "cover" }}
                              onError={(e) =>
                                handleImageError(e, getPlaceholder("PLAYER", p.position))
                              }
                            />
                            <span className="fw-semibold">{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={getPositionBadgeClass(p.position)}>
                            {POSITIONS.find((pos) => pos.value === p.position)?.label ||
                              p.position}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary border-0 p-2"
                              onClick={() => startEditPlayer(p)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger border-0 p-2"
                              onClick={() => onDeletePlayer(p.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

              {(!team.players || team.players.length === 0) && !isAddingPlayer && (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted italic">
                    {i18n.language === "uk"
                      ? "У цій команді поки немає гравців"
                      : "No players in this team yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default PlayersSection;
