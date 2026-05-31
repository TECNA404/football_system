import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCoach } from "../api/teamsApi";
import { ArrowLeft, User, Shield, Briefcase, Award, Edit2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";
import { useTeams } from "../hooks/useTeams";
import { toast } from "react-hot-toast";
import { useAuth } from "../components/AuthContext";

function CoachDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuth } = useAuth();
    const { handleCoachAction } = useTeams();
    const [coach, setCoach] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCoach = async () => {
        try {
            const res = await getCoach(id);
            setCoach(res.data);
            setEditDescription(res.data.description || "");
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoach();
    }, [id, t]);

    const onSaveDescription = async () => {
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleCoachAction(
            coach.team, 
            coach.id, 
            coach.name, 
            coach.experience_years, 
            null, 
            null, 
            editDescription
        );
        if (res.success) {
            toast.success(t('common.save'), { id: loadingToast });
            setIsEditing(false);
            const resUpdated = await getCoach(id);
            setCoach(resUpdated.data);
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

    if (error || !coach) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error || "Coach not found"}</div>
                <button className="btn btn-link" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-1" />
                </button>
            </div>
        );
    }

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
                                        src={coach.photo_url} 
                                        alt={coach.name} 
                                        className="rounded-4 border-4 border-white shadow-premium hero-logo" 
                                        style={{ width: '220px', height: '280px', objectFit: 'cover' }}
                                        onError={(e) => handleImageError(e, getPlaceholder('COACH'))}
                                    />
                                </div>
                            </div>
                            <div className="col-md-8 text-center text-md-start">
                                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                                    {coach.team_logo_url && (
                                        <img 
                                            src={coach.team_logo_url} 
                                            alt={coach.team_name} 
                                            className="bg-white rounded-circle p-1 shadow-sm"
                                            style={{ width: 50, height: 50, objectFit: 'contain' }}
                                        />
                                    )}
                                    <h5 className="mb-0 text-white opacity-75">{coach.team_name || 'N/A'}</h5>
                                </div>
                                <h1 className="fw-black display-4 mb-2">{coach.name}</h1>
                                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-4">
                                    <span className="badge bg-white text-primary fs-6 px-3 py-2 rounded-pill shadow-sm">{i18n.language === 'uk' ? 'Головний тренер' : 'Head Coach'}</span>
                                    <span className="badge bg-accent text-dark fs-6 px-3 py-2 rounded-pill shadow-sm">{coach.experience_years} {i18n.language === 'uk' ? 'років досвіду' : 'years experience'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-premium stats-card">
                                <h5 className="fw-black mb-4 d-flex align-items-center gap-2">
                                    <Briefcase size={22} className="text-primary" /> {i18n.language === 'uk' ? 'Кар\'єра' : 'Career'}
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                        <span className="text-muted">{i18n.language === 'uk' ? 'Стаж' : 'Experience'}</span>
                                        <span className="fw-black fs-5">{coach.experience_years} {i18n.language === 'uk' ? 'р.' : 'y.'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                        <span className="text-muted">{i18n.language === 'uk' ? 'Клуб' : 'Club'}</span>
                                        <span className="fw-black text-primary text-truncate ms-2">{coach.team_name || '—'}</span>
                                    </div>
                                    <div className="p-3 bg-primary bg-opacity-10 rounded-4 mt-2">
                                        <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                                            <Award size={18} />
                                            <span>Pro License</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="card h-100 border-0 shadow-premium stats-card">
                                <h5 className="fw-black mb-4 border-bottom pb-3">{i18n.language === 'uk' ? 'Тренерська філософія' : 'Coaching Philosophy'}</h5>
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
                                            <p className="mb-0 fs-5 lh-lg text-secondary" style={{ fontStyle: coach.description ? 'normal' : 'italic' }}>
                                                {coach.description || (i18n.language === 'uk' 
                                                    ? `${coach.name} — досвідчений фахівець з ${coach.experience_years}-річним стажем у професійному футболі. Відомий своїм стратегічним підходом та вмінням працювати з молодими талантами.` 
                                                    : `${coach.name} is an experienced specialist with ${coach.experience_years} years of experience in professional football. Known for his strategic approach and ability to work with young talents.`)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoachDetailPage;

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
