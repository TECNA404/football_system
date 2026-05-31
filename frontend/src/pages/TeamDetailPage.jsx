import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { 
    Users, User, ArrowLeft, Shield, Edit2, Save, X, Camera, Plus, Trash2, Award, Briefcase, Check, Eye, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeam } from "../api/teamsApi";
import { useTeams } from "../hooks/useTeams";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";
import { useAuth } from "../components/AuthContext";

function TeamDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuth } = useAuth();
    const {
        handleUpdateName,
        handleUpdateLogo,
        handleUpdateDescription,
        handleCoachAction,
        handleAddPlayer,
        handleUpdatePlayer,
        handleDeletePlayer
    } = useTeams();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Team name edit
    const [editingName, setEditingName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState("");
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    // Coach fields
    const [coachName, setCoachName] = useState("");
    const [coachExp, setCoachExp] = useState(0);
    const [coachDescription, setCoachDescription] = useState("");
    const [coachPhotoFile, setCoachPhotoFile] = useState(null);
    const [coachPhotoUrl, setCoachPhotoUrl] = useState("");
    const [coachPreview, setCoachPreview] = useState(null);

    // Player fields
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState("");
    const [playerNumber, setPlayerNumber] = useState("");
    const [playerPosition, setPlayerPosition] = useState("GK");
    const [playerDescription, setPlayerDescription] = useState("");
    const [playerPhotoFile, setPlayerPhotoFile] = useState(null);
    const [playerPhotoUrl, setPlayerPhotoUrl] = useState("");
    const [playerPreview, setPlayerPreview] = useState(null);
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

    const positionsMap = POSITIONS.reduce((acc, pos) => ({ ...acc, [pos.value]: pos.label }), {});

    const fetchTeam = async () => {
        try {
            const res = await getTeam(id);
            const data = res.data;
            setTeam(data);
            setEditingName(data.name);
            setEditingDescription(data.description || "");
            setCoachName(data.coach?.name || "");
            setCoachExp(data.coach?.experience_years || 0);
            setCoachDescription(data.coach?.description || "");
            setCoachPreview(data.coach?.photo_url || null);
            setCoachPhotoUrl("");
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

    const onSaveTeamDescription = async () => {
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleUpdateDescription(id, editingDescription);
        if (res.success) {
            setIsEditingDescription(false);
            setTeam({ ...team, description: editingDescription });
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
        const res = await handleCoachAction(id, team.coach?.id, coachName, coachExp, coachPhotoFile, coachPhotoUrl, coachDescription);
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
            res = await handleUpdatePlayer(editingPlayerId, playerName, playerNumber, playerPosition, playerPhotoFile, playerPhotoUrl, playerDescription);
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
        setPlayerDescription("");
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
        setPlayerDescription(player.description || "");
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-outline-secondary border-0 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                </button>
                {isAuth && (
                    <button 
                        className={`btn ${isEditing ? 'btn-outline-primary' : 'btn-primary'} d-flex align-items-center gap-2 shadow-sm`} 
                        onClick={() => {
                            setIsEditing(!isEditing);
                            if (isEditing) fetchTeam(); // Refresh data when closing edit mode
                        }}
                    >
                        {isEditing ? (
                            <><Eye size={18} /> {i18n.language === 'uk' ? 'Режим перегляду' : 'View Mode'}</>
                        ) : (
                            <><Edit2 size={18} /> {i18n.language === 'uk' ? 'Редагувати команду' : 'Edit Team'}</>
                        )}
                    </button>
                )}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-sm overflow-hidden mb-4"
            >
                <div className="bg-primary text-white p-4 d-flex align-items-center gap-4">
                    <div className="position-relative">
                        <img 
                            src={team.logo_url} 
                            alt={team.name} 
                            className="rounded-circle bg-white" 
                            style={{ width: 80, height: 80, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} 
                            onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                        />
                        {isEditing && (
                            <label className="position-absolute bottom-0 right-0 bg-white rounded-circle p-1 shadow-sm cursor-pointer" style={{ right: -5, bottom: -5 }}>
                                <Camera size={16} className="text-primary" />
                                <input type="file" hidden accept="image/*" onChange={(e) => onLogoUpdate(e.target.files[0])} />
                            </label>
                        )}
                    </div>
                        <div className="flex-grow-1 overflow-hidden">
                            {isEditing && isEditingName ? (
                                <div className="d-flex gap-2">
                                    <input 
                                        className="form-control form-control-lg py-0 fw-bold bg-white text-dark" 
                                        style={{ width: 'fit-content', minWidth: '300px' }}
                                        value={editingName} 
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={onSaveTeamName}
                                        onKeyDown={(e) => e.key === 'Enter' && onSaveTeamName()}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="d-flex align-items-center gap-2">
                                    <h1 className="fw-bold mb-1" title={team.name}>{team.name}</h1>
                                    {isEditing && (
                                        <button className="btn btn-link text-white p-0 opacity-75 flex-shrink-0" onClick={() => setIsEditingName(true)}>
                                            <Edit2 size={20} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <p className="mb-0 opacity-75 text-nowrap">{t('navbar.teams')} • {team.owner}</p>
                        </div>
                </div>

                <div className="bg-light px-4 py-2 border-bottom">
                    {isEditing ? (
                        <div className="py-2">
                            <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                                <FileText size={14} /> {i18n.language === 'uk' ? 'Опис команди' : 'Team Description'}
                            </label>
                            <div className="d-flex gap-2 align-items-start">
                                <textarea 
                                    className="form-control form-control-sm" 
                                    rows="3"
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    placeholder={i18n.language === 'uk' ? 'Введіть опис команди...' : 'Enter team description...'}
                                />
                                <button className="btn btn-primary btn-sm mt-1" onClick={onSaveTeamDescription}>
                                    <Save size={16} />
                                </button>
                            </div>
                        </div>
                    ) : team.description && (
                        <p className="mb-0 py-2 text-muted small italic">
                            {team.description}
                        </p>
                    )}
                </div>

                <div className="card-body p-4">
                    <div className="row g-4">
                        {/* Тренер */}
                        <div className="col-12 col-md-4">
                            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 text-nowrap">
                                <User className="text-primary" /> {i18n.language === 'uk' ? 'Тренер' : 'Coach'}
                            </h4>
                            
                            {isEditing ? (
                                <div className="p-3 bg-light rounded-3">
                                    <div className="text-center mb-3">
                                        <div className="position-relative d-inline-block">
                                            <img 
                                                src={coachPreview || getPlaceholder('COACH')} 
                                                className="rounded-circle border bg-white" 
                                                style={{ width: 100, height: 100, objectFit: 'cover' }} 
                                                alt="Coach"
                                            />
                                            <label className="position-absolute bottom-0 right-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer" style={{ right: 0, bottom: 0 }}>
                                                <Camera size={14} />
                                                <input type="file" hidden accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setCoachPhotoFile(file);
                                                    if (file) setCoachPreview(URL.createObjectURL(file));
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-muted mb-1 text-nowrap">{i18n.language === 'uk' ? "Ім'я тренера" : "Coach Name"}</label>
                                        <input className="form-control form-control-sm" value={coachName} onChange={(e) => setCoachName(e.target.value)} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-muted mb-1 text-nowrap">{i18n.language === 'uk' ? "Досвід" : "Experience"}</label>
                                        <input type="number" className="form-control form-control-sm" value={coachExp} onChange={(e) => setCoachExp(parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted mb-1 text-nowrap">{i18n.language === 'uk' ? "Фото (URL)" : "Photo (URL)"}</label>
                                        <input className="form-control form-control-sm" placeholder="https://..." value={coachPhotoUrl} onChange={(e) => setCoachPhotoUrl(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted mb-1">{i18n.language === 'uk' ? "Опис тренера" : "Coach Description"}</label>
                                        <textarea className="form-control form-control-sm" rows="3" value={coachDescription} onChange={(e) => setCoachDescription(e.target.value)} />
                                    </div>
                                    <button className="btn btn-sm btn-primary w-100 fw-bold" onClick={onSaveCoach}>
                                        <Save size={14} className="me-1" /> {t('common.save')}
                                    </button>
                                </div>
                            ) : team.coach ? (
                                <Link to={`/coaches/${team.coach.id}`} className="text-decoration-none text-dark">
                                    <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3 hover-shadow transition-all overflow-hidden">
                                        <img 
                                            src={team.coach.photo_url} 
                                            alt={team.coach.name} 
                                            className="rounded-circle border"
                                            style={{ width: 60, height: 60, objectFit: 'cover', flexShrink: 0 }}
                                            onError={(e) => handleImageError(e, getPlaceholder('COACH'))}
                                        />
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="fw-bold fs-5" title={team.coach.name}>{team.coach.name}</div>
                                            <div className="text-muted small">
                                                {i18n.language === 'uk' ? 'Досвід' : 'Experience'}: {team.coach.experience_years} {i18n.language === 'uk' ? 'років' : 'years'}
                                            </div>
                                            {team.coach.description && (
                                                <div className="text-muted mt-2 small italic border-top pt-1 text-truncate" style={{ maxWidth: '250px' }}>
                                                    {team.coach.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-4 border border-dashed rounded-3 text-center text-muted italic">
                                    {i18n.language === 'uk' ? 'Тренер не призначений' : 'No coach assigned'}
                                </div>
                            )}
                        </div>

                        {/* Склад */}
                        <div className="col-12 col-md-8">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-black mb-0 d-flex align-items-center gap-2 text-nowrap">
                                    <Users className="text-primary" /> {i18n.language === 'uk' ? 'Склад команди' : 'Team Squad'}
                                </h4>
                                {isEditing && (
                                    <button 
                                        className="btn btn-sm btn-accent d-flex align-items-center gap-1 fw-black px-3"
                                        onClick={() => {
                                            resetPlayerForm();
                                            setIsAddingPlayer(true);
                                        }}
                                    >
                                        <Plus size={18} /> {t('common.add')}
                                    </button>
                                )}
                            </div>

                            <div className="row g-3">
                                <AnimatePresence>
                                    {isAddingPlayer && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            exit={{ opacity: 0, scale: 0.9 }} 
                                            className="col-12"
                                        >
                                            <div className="glass-card p-4 border-accent shadow-premium">
                                                <div className="row g-3">
                                                    <div className="col-md-2">
                                                        <label className="form-label small fw-bold text-muted">№</label>
                                                        <input type="number" className="form-control" placeholder="7" value={playerNumber} onChange={(e) => setPlayerNumber(e.target.value)} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label small fw-bold text-muted">{i18n.language === 'uk' ? "Ім'я гравця" : "Player name"}</label>
                                                        <input className="form-control" placeholder="Lionel Messi" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small fw-bold text-muted">{i18n.language === 'uk' ? "Позиція" : "Position"}</label>
                                                        <select className="form-select" value={playerPosition} onChange={(e) => setPlayerPosition(e.target.value)}>
                                                            {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label small fw-bold text-muted">Photo URL</label>
                                                        <input className="form-control" placeholder="https://..." value={playerPhotoUrl} onChange={(e) => setPlayerPhotoUrl(e.target.value)} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label small fw-bold text-muted">{i18n.language === 'uk' ? "Опис" : "Description"}</label>
                                                        <textarea className="form-control" rows="2" value={playerDescription} onChange={(e) => setPlayerDescription(e.target.value)} />
                                                    </div>
                                                    <div className="col-12 d-flex gap-2">
                                                        <button className="btn btn-primary flex-grow-1 fw-black" onClick={onSavePlayer}><Check size={18} className="me-2" /> {t('common.save')}</button>
                                                        <button className="btn btn-light" onClick={resetPlayerForm}><X size={18} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {team.players && team.players.sort((a, b) => a.number - b.number).map(player => (
                                    <motion.div 
                                        key={player.id} 
                                        className="col-12 col-sm-6"
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {isEditing && editingPlayerId === player.id ? (
                                            <div className="glass-card p-3 border-warning h-100 shadow-premium">
                                                <div className="row g-2">
                                                    <div className="col-3">
                                                        <input type="number" className="form-control form-control-sm" value={playerNumber} onChange={(e) => setPlayerNumber(e.target.value)} />
                                                    </div>
                                                    <div className="col-9">
                                                        <input className="form-control form-control-sm" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                                                    </div>
                                                    <div className="col-12">
                                                        <select className="form-select form-select-sm" value={playerPosition} onChange={(e) => setPlayerPosition(e.target.value)}>
                                                            {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-12">
                                                        <input className="form-control form-control-xs" style={{ fontSize: '0.7rem' }} value={playerPhotoUrl} onChange={(e) => setPlayerPhotoUrl(e.target.value)} />
                                                    </div>
                                                    <div className="col-12 d-flex gap-2">
                                                        <button className="btn btn-success btn-sm flex-grow-1" onClick={onSavePlayer}><Check size={16} /></button>
                                                        <button className="btn btn-light btn-sm" onClick={() => setEditingPlayerId(null)}><X size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="glass-card h-100 p-3 shadow-premium hover-up transition-all group position-relative overflow-hidden">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="position-relative">
                                                        <img 
                                                            src={player.photo_url} 
                                                            alt={player.name} 
                                                            className="rounded-circle border-2 border-white shadow-sm"
                                                            style={{ width: 60, height: 60, objectFit: 'cover' }}
                                                            onError={(e) => handleImageError(e, getPlaceholder('PLAYER', player.position))}
                                                        />
                                                        <div className="position-absolute bottom-0 start-0 bg-primary text-white rounded-circle fw-black d-flex align-items-center justify-content-center shadow-sm" style={{ width: 24, height: 24, fontSize: '0.7rem', border: '2px solid white' }}>
                                                            {player.number}
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <h6 className="fw-black mb-0 text-truncate">{player.name}</h6>
                                                        <div className="small text-accent fw-bold">{positionsMap[player.position]}</div>
                                                    </div>
                                                    <div className="d-flex flex-column gap-1">
                                                        <Link to={`/players/${player.id}`} className="btn btn-light btn-sm p-2 rounded-circle shadow-sm">
                                                            <Eye size={14} className="text-primary" />
                                                        </Link>
                                                        {isEditing && (
                                                            <div className="dropdown">
                                                                <button className="btn btn-light btn-sm p-2 rounded-circle shadow-sm" data-bs-toggle="dropdown">
                                                                    <Edit2 size={14} className="text-warning" />
                                                                </button>
                                                                <ul className="dropdown-menu dropdown-menu-end shadow-premium border-0 p-2 rounded-3">
                                                                    <li><button className="dropdown-item rounded-2" onClick={() => startEditPlayer(player)}>{t('common.edit')}</button></li>
                                                                    <li><button className="dropdown-item rounded-2 text-danger" onClick={() => onDeletePlayer(player.id)}>{t('common.delete')}</button></li>
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                            {(!team.players || team.players.length === 0) && !isAddingPlayer && (
                                <div className="p-5 text-center bg-light rounded-3 text-muted mt-2 border border-dashed">
                                    {i18n.language === 'uk' ? 'У цій команді поки немає гравців' : 'No players in this team yet'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .hover-shadow:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-primary:hover { color: var(--bs-primary) !important; }
                .table-success-light { background-color: rgba(40, 167, 69, 0.05); }
                .form-control-xs { padding: 0.1rem 0.4rem; min-height: 20px; }
            `}} />
        </div>
    );
}

export default TeamDetailPage;
