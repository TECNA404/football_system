import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPlayer } from "../api/teamsApi";
import { ChevronLeft, User, Shield, Info, Hash, Edit2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";
import { useTeams } from "../hooks/useTeams";
import { toast } from "react-hot-toast";
import { useAuth } from "../components/AuthContext";

function PlayerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuth } = useAuth();
    const { handleUpdatePlayer } = useTeams();
    const [player, setPlayer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPlayer = async () => {
        try {
            const res = await getPlayer(id);
            setPlayer(res.data);
            setEditDescription(res.data.description || "");
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayer();
    }, [id, t]);

    const onSaveDescription = async () => {
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleUpdatePlayer(
            player.id,
            player.name,
            player.number,
            player.position,
            null,
            null,
            editDescription
        );
        if (res.success) {
            toast.success(t('common.save'), { id: loadingToast });
            setIsEditing(false);
            const resUpdated = await getPlayer(id);
            setPlayer(resUpdated.data);
            setEditDescription(resUpdated.data.description || "");
        } else {
            toast.error(t('common.error'), { id: loadingToast });
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error || "Player not found"}</div>
                <button className="btn btn-link" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-1" />
                </button>
            </div>
        );
    }

    const positionsMap = {
        'GK': i18n.language === 'uk' ? 'Воротар (GK)' : 'Goalkeeper (GK)',
        'DF': i18n.language === 'uk' ? 'Захисник (DF)' : 'Defender (DF)',
        'MF': i18n.language === 'uk' ? 'Півзахисник (MF)' : 'Midfielder (MF)',
        'FW': i18n.language === 'uk' ? 'Нападник (FW)' : 'Forward (FW)',
    };

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-outline-primary border-0 d-flex align-items-center gap-1 hover-translate-x shadow-sm px-3 rounded-pill" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                </button>
                {isAuth && (
                    <button 
                        className={`btn ${isEditing ? 'btn-outline-primary' : 'btn-primary'} d-flex align-items-center gap-2 shadow-sm rounded-pill px-4`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                        {isEditing ? (i18n.language === 'uk' ? 'Скасувати' : 'Cancel') : (i18n.language === 'uk' ? 'Редагувати' : 'Edit')}
                    </button>
                )}
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-md-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="player-hero shadow-premium border-0"
                    >
                        <div className="row align-items-center g-4">
                            <div className="col-md-4 text-center">
                                <div className="position-relative d-inline-block">
                                    <img 
                                        src={player.photo_url} 
                                        alt={player.name} 
                                        className="rounded-4 border-4 border-white shadow-premium hero-logo" 
                                        style={{ width: '220px', height: '280px', objectFit: 'cover' }}
                                        onError={(e) => handleImageError(e, getPlaceholder('PLAYER', player.position))}
                                    />
                                    <div className="position-absolute top-0 start-0 bg-accent text-dark fw-black fs-4 px-3 py-1 rounded-3 mt-2 ms-2 shadow-sm">
                                        #{player.number}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8 text-center text-md-start">
                                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                                    {player.team_logo_url && (
                                        <img 
                                            src={player.team_logo_url} 
                                            alt={player.team_name} 
                                            className="bg-white rounded-circle p-1 shadow-sm"
                                            style={{ width: 50, height: 50, objectFit: 'contain' }}
                                        />
                                    )}
                                    <h5 className="mb-0 text-white opacity-75">{player.team_name || 'N/A'}</h5>
                                </div>
                                <h1 className="fw-black display-4 mb-2">{player.name}</h1>
                                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-4">
                                    <span className="badge bg-white text-primary fs-6 px-3 py-2 rounded-pill shadow-sm">{positionsMap[player.position]}</span>
                                    <span className="badge bg-accent text-dark fs-6 px-3 py-2 rounded-pill shadow-sm">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-premium stats-card">
                                <h5 className="fw-black mb-4 d-flex align-items-center gap-2">
                                    <Info size={22} className="text-primary" /> {i18n.language === 'uk' ? 'Деталі' : 'Details'}
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                        <span className="text-muted">{i18n.language === 'uk' ? 'Позиція' : 'Position'}</span>
                                        <span className="fw-black">{positionsMap[player.position]}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                        <span className="text-muted">{i18n.language === 'uk' ? 'Номер' : 'Number'}</span>
                                        <span className="fw-black fs-5">#{player.number}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                        <span className="text-muted">{i18n.language === 'uk' ? 'Клуб' : 'Club'}</span>
                                        <span className="fw-black text-primary text-truncate ms-2">{player.team_name || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="card h-100 border-0 shadow-premium stats-card">
                                <h5 className="fw-black mb-4 border-bottom pb-3">{i18n.language === 'uk' ? 'Про гравця' : 'About Player'}</h5>
                                <div className="p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10">
                                    {isEditing ? (
                                        <div className="d-flex flex-column gap-3">
                                            <textarea 
                                                className="form-control border-0 shadow-sm" 
                                                rows="6" 
                                                value={editDescription} 
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder={i18n.language === 'uk' ? "Введіть опис..." : "Enter description..."}
                                            />
                                            <button className="btn btn-primary shadow-premium d-flex align-items-center justify-content-center gap-2 py-3" onClick={onSaveDescription}>
                                                <Save size={20} /> {t('common.save')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="position-relative">
                                            <p className="mb-0 fs-5 lh-lg text-secondary" style={{ fontStyle: player.description ? 'normal' : 'italic' }}>
                                                {player.description || (i18n.language === 'uk' 
                                                    ? `Професійний гравець футбольного клубу, який виступає на позиції ${positionsMap[player.position].toLowerCase()}.` 
                                                    : `A professional football player who plays as a ${positionsMap[player.position].toLowerCase()}.`)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .hover-translate-x {
                    transition: transform 0.2s ease;
                }
                .hover-translate-x:hover {
                    transform: translateX(-5px);
                    background-color: var(--bs-primary);
                    color: white;
                }
            `}} />
        </div>
    );
}

export default PlayerDetailPage;
