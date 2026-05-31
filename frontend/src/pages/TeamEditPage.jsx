import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { 
    ArrowLeft, User, Users, Save, Trash2, Edit2, Plus, 
    Camera, Shield, Briefcase, Award, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeam } from "../api/teamsApi";
import { useTeams } from "../hooks/useTeams";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";
import { formatDateOnly } from "../utils/formatters";

function TeamEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const {
        handleUpdateName,
        handleUpdateLogo,
        handleCoachAction,
        handleAddPlayer,
        handleUpdatePlayer,
        handleDeletePlayer,
        loading: actionLoading
    } = useTeams();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Team fields
    const [editingName, setEditingName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);

    // Coach fields
    const [coachName, setCoachName] = useState("");
    const [coachExp, setCoachExp] = useState(0);
    const [coachPhotoFile, setCoachPhotoFile] = useState(null);
    const [coachPhotoUrl, setCoachPhotoUrl] = useState("");
    const [coachPreview, setCoachPreview] = useState(null);

    // Player fields
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState("");
    const [playerNumber, setPlayerNumber] = useState("");
    const [playerPosition, setPlayerPosition] = useState("GK");
    const [playerPhotoFile, setPlayerPhotoFile] = useState(null);
    const [playerPhotoUrl, setPlayerPhotoUrl] = useState("");
    const [playerPreview, setPlayerPreview] = useState(null);

    // New Player form (Inline)
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);

    const POSITIONS = i18n.language === 'uk' ? [
        { value: 'GK', label: 'Воротар (GK)' },
        { value: 'DF', label: 'Захисник (DF)' },
        { value: 'MF', label: 'Півзахисник (MF)' },
        { value: 'FW', label: 'Нападник (FW)' },
    ] : [
        { value: 'GK', label: 'Goalkeeper (GK)' },
        { value: 'DF', label: 'Defender (DF)' },
        { value: 'MF', label: 'Midfielder (MF)' },
        { value: 'FW', label: 'Forward (FW)' },
    ];

    const fetchTeam = async () => {
        try {
            const res = await getTeam(id);
            const data = res.data;
            setTeam(data);
            setEditingName(data.name);
            setCoachName(data.coach?.name || "");
            setCoachExp(data.coach?.experience_years || 0);
            setCoachPreview(data.coach?.photo_url || null);
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [id, t]);

    const onSaveTeamName = async () => {
        if (!editingName.trim()) return;
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleUpdateName(id, editingName.trim());
        if (res.success) {
            setIsEditingName(false);
            setTeam({ ...team, name: editingName.trim() });
            toast.success(t('common.save'), { id: loadingToast });
        } else {
            toast.error(t('common.error'), { id: loadingToast });
        }
    };

    const onLogoUpdate = async (file) => {
        if (!file) return;
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleUpdateLogo(id, file);
        if (res.success) {
            toast.success(t('common.save'), { id: loadingToast });
            fetchTeam();
        } else {
            toast.error(res.error || t('common.error'), { id: loadingToast });
        }
    };

    const onSaveCoach = async () => {
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleCoachAction(id, team.coach?.id, coachName, coachExp, coachPhotoFile, coachPhotoUrl);
        if (res.success) {
            toast.success(t('common.save'), { id: loadingToast });
            setCoachPhotoFile(null);
            setCoachPhotoUrl("");
            fetchTeam();
        } else {
            toast.error(res.error, { id: loadingToast });
        }
    };

    const onSavePlayer = async (e) => {
        if (e) e.preventDefault();
        const loadingToast = toast.loading(t('common.loading'));
        let res;
        if (editingPlayerId) {
            res = await handleUpdatePlayer(editingPlayerId, playerName, playerNumber, playerPosition, playerPhotoFile, playerPhotoUrl);
        } else {
            res = await handleAddPlayer(id, playerName, playerNumber, playerPosition, playerPhotoFile, playerPhotoUrl);
        }

        if (res.success) {
            toast.success(t('common.save'), { id: loadingToast });
            resetPlayerForm();
            fetchTeam();
        } else {
            toast.error(res.error || t('common.error'), { id: loadingToast });
        }
    };

    const resetPlayerForm = () => {
        setEditingPlayerId(null);
        setPlayerName("");
        setPlayerNumber("");
        setPlayerPosition("GK");
        setPlayerPhotoFile(null);
        setPlayerPhotoUrl("");
        setPlayerPreview(null);
        setIsAddingPlayer(false);
    };

    const startEditPlayer = (player) => {
        setEditingPlayerId(player.id);
        setPlayerName(player.name);
        setPlayerNumber(player.number);
        setPlayerPosition(player.position);
        setPlayerPreview(player.photo_url);
        setPlayerPhotoUrl(player.photo_url?.startsWith('http') ? player.photo_url : "");
        setPlayerPhotoFile(null);
    };

    const onDeletePlayer = async (pid) => {
        if (!window.confirm(i18n.language === 'uk' ? "Видалити гравця?" : "Delete player?")) return;
        const res = await handleDeletePlayer(pid);
        if (res.success) {
            toast.success(i18n.language === 'uk' ? "Видалено" : "Deleted");
            fetchTeam();
        }
    };

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error || !team) return <div className="container mt-5"><div className="alert alert-danger">{error || "Team not found"}</div></div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-outline-secondary border-0 p-2" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="fw-bold mb-0">{i18n.language === 'uk' ? 'Редагування команди' : 'Edit Team'}</h2>
            </div>

            <div className="row g-4">
                {/* Left Column: Team Info & Coach */}
                <div className="col-lg-5">
                    {/* Team Info Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-0 shadow-sm mb-4 overflow-hidden">
                        <div className="bg-primary p-4 position-relative">
                            <div className="d-flex align-items-center gap-3">
                                <div className="position-relative">
                                    <img 
                                        src={team.logo_url} 
                                        alt={team.name} 
                                        className="rounded-circle bg-white" 
                                        style={{ width: 80, height: 80, objectFit: 'cover', border: '3px solid white' }}
                                        onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                                    />
                                    <label className="position-absolute bottom-0 right-0 bg-white rounded-circle p-1 shadow-sm cursor-pointer" style={{ right: -5, bottom: -5 }}>
                                        <Camera size={16} className="text-primary" />
                                        <input type="file" hidden accept="image/*" onChange={(e) => onLogoUpdate(e.target.files[0])} />
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
                                                onKeyDown={(e) => e.key === 'Enter' && onSaveTeamName()}
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center gap-2">
                                            <h3 className="fw-bold mb-0">{team.name}</h3>
                                            <button className="btn btn-link text-white p-0 opacity-75" onClick={() => setIsEditingName(true)}>
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                    <p className="mb-0 opacity-75 small">{t('common.created')}: {formatDateOnly(team.created_at, i18n.language)}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Coach Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <User className="text-primary" size={20} /> {i18n.language === 'uk' ? 'Головний тренер' : 'Head Coach'}
                            </h5>
                            <div className="row g-3">
                                <div className="col-12 text-center mb-3">
                                    <div className="position-relative d-inline-block">
                                        <img 
                                            src={coachPreview || getPlaceholder('COACH')} 
                                            className="rounded-circle border" 
                                            style={{ width: 120, height: 120, objectFit: 'cover' }} 
                                            alt="Coach"
                                        />
                                        <label className="position-absolute bottom-0 right-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer" style={{ right: 5, bottom: 5 }}>
                                            <Camera size={18} />
                                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                                const file = e.target.files[0];
                                                setCoachPhotoFile(file);
                                                if (file) setCoachPreview(URL.createObjectURL(file));
                                            }} />
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">{i18n.language === 'uk' ? "Ім'я тренера" : "Coach Name"}</label>
                                    <input className="form-control" value={coachName} onChange={(e) => setCoachName(e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">{i18n.language === 'uk' ? "Досвід (років)" : "Experience (years)"}</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><Award size={18} /></span>
                                        <input type="number" className="form-control" value={coachExp} onChange={(e) => setCoachExp(parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">{i18n.language === 'uk' ? "Фото (URL)" : "Photo (URL)"}</label>
                                    <input 
                                        className="form-control form-control-sm" 
                                        placeholder="https://..." 
                                        value={coachPhotoUrl} 
                                        onChange={(e) => setCoachPhotoUrl(e.target.value)} 
                                    />
                                </div>
                                <div className="col-12 mt-4">
                                    <button className="btn btn-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2" onClick={onSaveCoach}>
                                        <Save size={18} /> {t('common.save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Players */}
                <div className="col-lg-7">
                    {/* Players List */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <Users className="text-primary" size={20} /> {i18n.language === 'uk' ? 'Склад команди' : 'Team Squad'}
                                </h5>
                                <div className="d-flex gap-2 align-items-center">
                                    <span className="badge bg-light text-primary border me-2">{team.players?.length || 0} {i18n.language === 'uk' ? 'гравців' : 'players'}</span>
                                    <button 
                                        className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-bold"
                                        onClick={() => {
                                            resetPlayerForm();
                                            setIsAddingPlayer(true);
                                        }}
                                    >
                                        <Plus size={16} /> {t('common.add')}
                                    </button>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-muted text-uppercase">
                                            <th className="ps-4" width="80">#</th>
                                            <th>{i18n.language === 'uk' ? "Гравець" : "Player"}</th>
                                            <th width="120">{i18n.language === 'uk' ? "Позиція" : "Position"}</th>
                                            <th className="text-end pe-4" width="120">{i18n.language === 'uk' ? "Дії" : "Actions"}</th>
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
                                                    className="table-success-light"
                                                >
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
                                                                        src={playerPreview || getPlaceholder('PLAYER', playerPosition)} 
                                                                        className="rounded-circle border" 
                                                                        style={{ width: 32, height: 32, objectFit: 'cover' }} 
                                                                        alt=""
                                                                    />
                                                                    <label className="position-absolute bottom-0 right-0 bg-dark text-white rounded-circle cursor-pointer" style={{ padding: '1px' }}>
                                                                        <Camera size={8} />
                                                                        <input type="file" hidden accept="image/*" onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            setPlayerPhotoFile(file);
                                                                            if (file) setPlayerPreview(URL.createObjectURL(file));
                                                                        }} />
                                                                    </label>
                                                                </div>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control form-control-sm" 
                                                                    placeholder={i18n.language === 'uk' ? "Ім'я" : "Name"}
                                                                    value={playerName} 
                                                                    onChange={(e) => setPlayerName(e.target.value)}
                                                                />
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                className="form-control form-control-xs" 
                                                                style={{ fontSize: '0.75rem' }}
                                                                placeholder="Photo URL"
                                                                value={playerPhotoUrl}
                                                                onChange={(e) => setPlayerPhotoUrl(e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select className="form-select form-select-sm" value={playerPosition} onChange={(e) => setPlayerPosition(e.target.value)}>
                                                            {POSITIONS.map(pos => (
                                                                <option key={pos.value} value={pos.value}>{pos.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <div className="d-flex justify-content-end gap-1">
                                                            <button className="btn btn-sm btn-success p-1" title={t('common.add')} onClick={onSavePlayer}>
                                                                <Check size={16} />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary p-1" title={t('common.cancel')} onClick={resetPlayerForm}>
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>

                                        {team.players?.sort((a,b) => a.number - b.number).map(p => (
                                            <tr key={p.id}>
                                                {editingPlayerId === p.id ? (
                                                    <>
                                                        <td className="ps-4">
                                                            <input 
                                                                type="number" 
                                                                className="form-control form-control-sm" 
                                                                value={playerNumber} 
                                                                onChange={(e) => setPlayerNumber(e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-1">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="position-relative" style={{ width: 32, height: 32, flexShrink: 0 }}>
                                                                        <img 
                                                                            src={playerPreview || getPlaceholder('PLAYER', playerPosition)} 
                                                                            className="rounded-circle border" 
                                                                            style={{ width: 32, height: 32, objectFit: 'cover' }} 
                                                                            alt=""
                                                                        />
                                                                        <label className="position-absolute bottom-0 right-0 bg-dark text-white rounded-circle cursor-pointer" style={{ padding: '1px' }}>
                                                                            <Camera size={8} />
                                                                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                setPlayerPhotoFile(file);
                                                                                if (file) setPlayerPreview(URL.createObjectURL(file));
                                                                            }} />
                                                                        </label>
                                                                    </div>
                                                                    <input 
                                                                        type="text" 
                                                                        className="form-control form-control-sm" 
                                                                        value={playerName} 
                                                                        onChange={(e) => setPlayerName(e.target.value)}
                                                                    />
                                                                </div>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control form-control-xs" 
                                                                    style={{ fontSize: '0.75rem' }}
                                                                    placeholder="Photo URL"
                                                                    value={playerPhotoUrl}
                                                                    onChange={(e) => setPlayerPhotoUrl(e.target.value)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <select className="form-select form-select-sm" value={playerPosition} onChange={(e) => setPlayerPosition(e.target.value)}>
                                                                {POSITIONS.map(pos => (
                                                                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex justify-content-end gap-1">
                                                                <button className="btn btn-sm btn-success p-1" title={t('common.save')} onClick={onSavePlayer}>
                                                                    <Check size={16} />
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-secondary p-1" title={t('common.cancel')} onClick={resetPlayerForm}>
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="ps-4 fw-bold text-primary">{p.number}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img 
                                                                    src={p.photo_url} 
                                                                    alt={p.name} 
                                                                    className="rounded-circle border" 
                                                                    style={{ width: 40, height: 40, objectFit: 'cover' }} 
                                                                    onError={(e) => handleImageError(e, getPlaceholder('PLAYER', p.position))}
                                                                />
                                                                <span className="fw-semibold">{p.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge rounded-pill bg-opacity-10 text-dark border ${
                                                                p.position === 'GK' ? 'bg-warning' : 
                                                                p.position === 'DF' ? 'bg-info' : 
                                                                p.position === 'MF' ? 'bg-success' : 'bg-danger'
                                                            }`}>
                                                                {POSITIONS.find(pos => pos.value === p.position)?.label || p.position}
                                                            </span>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex justify-content-end gap-1">
                                                                <button className="btn btn-sm btn-outline-primary border-0 p-2" onClick={() => startEditPlayer(p)}>
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger border-0 p-2" onClick={() => onDeletePlayer(p.id)}>
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
                                                    {i18n.language === 'uk' ? 'У цій команді поки немає гравців' : 'No players in this team yet'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default TeamEditPage;
