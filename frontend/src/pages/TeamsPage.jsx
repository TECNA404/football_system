import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { 
    Trash2, Edit2, Plus, Search, Image as ImageIcon, 
    Check, X, Camera, Users, Eye, Calendar, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTeams } from "../hooks/useTeams";
import { formatDateOnly } from "../utils/formatters";
import { handleImageError, getPlaceholder } from "../utils/imageUtils";
import { confirmAction } from "../utils/uiUtils";

function TeamsPage() {
    const { t, i18n } = useTranslation();
    const {
        teams,
        loading,
        error,
        handleCreateTeam,
        handleDeleteTeam,
        handleUpdateLogo,
        handleUpdateName,
    } = useTeams();

    const [name, setName] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState("");
    const [preview, setPreview] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [editingLogoUrl, setEditingLogoUrl] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name_asc");

    const filteredTeams = teams
        .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "name_asc") return a.name.localeCompare(b.name);
            if (sortBy === "name_desc") return b.name.localeCompare(a.name);
            if (sortBy === "date_desc") return new Date(b.created_at) - new Date(a.created_at);
            return 0;
        });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogoFile(file || null);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleCreate = async () => {
        if (!name.trim()) return;
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleCreateTeam(name.trim(), logoFile, logoUrl);
        if (res.success) {
            cancelEdit();
            toast.success(t('common.save'), { id: loadingToast });
        } else {
            toast.error(res.error || t('common.error'), { id: loadingToast });
        }
    };

    const startEdit = (team) => {
        setEditingId(team.id);
        setEditingName(team.name);
        setEditingLogoUrl(team.logo_url?.startsWith('http') ? team.logo_url : "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
        setEditingLogoUrl("");
        setIsAddingTeam(false);
        setName("");
        setLogoFile(null);
        setLogoUrl("");
        setPreview(null);
    };

    const handleSave = async (id) => {
        if (!editingName.trim()) return;
        const loadingToast = toast.loading(t('common.loading'));
        
        const nameRes = await handleUpdateName(id, editingName.trim());
        let logoRes = { success: true };
        
        const currentTeam = teams.find(t => t.id === id);
        if (editingLogoUrl !== (currentTeam?.logo_url?.startsWith('http') ? currentTeam.logo_url : "")) {
            logoRes = await handleUpdateLogo(id, null, editingLogoUrl);
        }

        if (nameRes.success && logoRes.success) {
            setEditingId(null);
            toast.success(t('common.save'), { id: loadingToast });
        } else {
            toast.error(t('common.error'), { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (!confirmAction(t('common.delete') + "?")) return;
    const loadingToast = toast.loading(t('common.loading'));
    const res = await handleDeleteTeam(id);
    if (res.success) {
        toast.success(t('common.delete'), { id: loadingToast });
    } else {
        toast.error(t('common.error'), { id: loadingToast });
    }
    };

    const onLogoUpdate = async (id, file) => {
        if (!file) return;
        const loadingToast = toast.loading(t('common.loading'));
        const res = await handleUpdateLogo(id, file);
        if (res.success) {
            toast.success(t('common.save'), { id: loadingToast });
        } else {
            toast.error(res.error || t('common.error'), { id: loadingToast });
        }
    };

    return (
        <div className="container mt-4 mb-5">
            {/* Header section */}
            <div className="row align-items-center mb-5 g-4">
                <div className="col-md">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="fw-black text-gradient mb-1">
                            {t('teams.title')}
                        </h1>
                        <p className="text-muted mb-0">{t('teams.subtitle') || (i18n.language === 'uk' ? 'Керуйте своїми футбольними клубами' : 'Manage your football clubs')}</p>
                    </motion.div>
                </div>
                <div className="col-md-auto">
                    <button 
                        className="btn btn-primary btn-lg px-5 shadow-premium d-flex align-items-center gap-2"
                        onClick={() => { cancelEdit(); setIsAddingTeam(true); }}
                    >
                        <Plus size={24} /> {t('common.add')}
                    </button>
                </div>
            </div>

            {/* Filter section */}
            <motion.div 
                className="glass-card border-0 mb-5 rounded-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-8">
                            <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                                <span className="input-group-text bg-white border-0 text-muted ps-3">
                                    <Search size={20} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 py-3"
                                    placeholder={t('common.search')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select border shadow-sm rounded-3 py-3 px-3 h-100"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name_asc">{t('teams.team_name')} (A-Z)</option>
                                <option value="name_desc">{t('teams.team_name')} (Z-A)</option>
                                <option value="date_desc">{i18n.language === 'uk' ? '📅 Нові спочатку' : '📅 Newest first'}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Teams Grid */}
            <div className="row g-4">
                <AnimatePresence mode="popLayout">
                    {/* Add Team Card */}
                    {isAddingTeam && (
                        <motion.div 
                            className="col-12 col-md-6 col-lg-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="card h-100 border-primary border-2 border-dashed shadow-lg rounded-4 overflow-hidden" style={{ minHeight: '280px' }}>
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="position-relative" style={{ width: 80, height: 80 }}>
                                            {preview ? (
                                                <img src={preview} className="w-100 h-100 rounded-circle border shadow-sm object-fit-cover" alt="" />
                                            ) : (
                                                <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center border-2 border-dashed">
                                                    <ImageIcon size={30} className="text-muted opacity-50" />
                                                </div>
                                            )}
                                            <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow-sm cursor-pointer hover-scale" style={{ padding: '6px' }}>
                                                <Camera size={14} />
                                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <div className="flex-grow-1">
                                            <input 
                                                className="form-control form-control-lg border-0 bg-light rounded-3 fw-bold mb-2"
                                                placeholder={t('teams.team_name')}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                autoFocus
                                            />
                                            <input 
                                                className="form-control form-control-sm border-0 bg-light rounded-3"
                                                style={{ fontSize: '0.75rem' }}
                                                placeholder="Logo URL (optional)"
                                                value={logoUrl}
                                                onChange={(e) => setLogoUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-auto d-flex gap-2">
                                        <button className="btn btn-primary flex-grow-1 py-2 fw-bold rounded-3" onClick={handleCreate}>
                                            <Check size={18} className="me-2" /> {t('common.add')}
                                        </button>
                                        <button className="btn btn-outline-secondary px-3 rounded-3" onClick={cancelEdit}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Team Cards */}
                    {filteredTeams.map((team, idx) => (
                        <motion.div 
                            key={team.id}
                            className="col-12 col-md-6 col-lg-4"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="card h-100 border-0 shadow-premium hover-up transition-all rounded-4 overflow-hidden group">
                                <div className="card-body p-0 d-flex flex-column">
                                    {/* Card Header (Logo + Background) */}
                                    <div className="position-relative p-4 pb-0 text-center" style={{ background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' }}>
                                        <div className="position-relative mx-auto mb-3" style={{ width: 100, height: 100 }}>
                                            <img
                                                src={team.logo_url}
                                                alt={team.name}
                                                className="w-100 h-100 rounded-circle border-4 border-white shadow-premium object-fit-cover bg-white"
                                                onError={(e) => handleImageError(e, getPlaceholder('TEAM'))}
                                            />
                                            <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow-sm cursor-pointer opacity-0 group-hover-opacity-100 transition-all" style={{ padding: '8px' }}>
                                                <Camera size={16} />
                                                <input type="file" hidden accept="image/*" onChange={(e) => onLogoUpdate(team.id, e.target.files[0])} />
                                            </label>
                                        </div>
                                        
                                        <div className="px-3">
                                            {editingId === team.id ? (
                                                <div className="d-flex flex-column gap-2 mb-3">
                                                    <input
                                                        className="form-control form-control-sm border shadow-sm fw-bold text-center"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSave(team.id);
                                                            if (e.key === "Escape") cancelEdit();
                                                        }}
                                                        autoFocus
                                                    />
                                                    <input 
                                                        className="form-control form-control-xs border shadow-sm text-center"
                                                        style={{ fontSize: '0.75rem' }}
                                                        placeholder="Logo URL"
                                                        value={editingLogoUrl}
                                                        onChange={(e) => setEditingLogoUrl(e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="fw-black mb-1 lh-sm" title={team.name}>{team.name}</h4>
                                                    <div className="d-flex align-items-center justify-content-center gap-1 text-muted small mb-3">
                                                        <Calendar size={14} /> {formatDateOnly(team.created_at, i18n.language)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="px-4 pb-4">
                                        <div className="row g-2 mb-4">
                                            <div className="col-6">
                                                <div className="p-3 bg-light rounded-4 text-center h-100">
                                                    <div className="small text-muted mb-1 text-nowrap">{t('teams.players')}</div>
                                                    <div className="fw-black fs-4 text-gradient">{team.players?.length || 0}</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-3 bg-light rounded-4 text-center h-100 d-flex flex-column justify-content-center">
                                                    <div className="small text-muted mb-1">{t('teams.coach')}</div>
                                                    <div className="fw-bold small lh-sm text-truncate px-1" title={team.coach?.name || '—'}>
                                                        {team.coach?.name || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="d-flex gap-2">
                                            <Link to={`/teams/${team.id}`} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2" title={i18n.language === 'uk' ? 'Перегляд та редагування' : 'View & Edit'}>
                                                <Eye size={18} />
                                                <span>{i18n.language === 'uk' ? 'Відкрити' : 'Open'}</span>
                                            </Link>
                                            
                                            <div className="dropdown">
                                                <button className="btn btn-light px-3 h-100" type="button" data-bs-toggle="dropdown">
                                                    <Edit2 size={18} />
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end shadow-premium border-0 rounded-4 p-2">
                                                    <li>
                                                        <button className="dropdown-item rounded-3 p-2 d-flex align-items-center gap-2" onClick={() => startEdit(team)}>
                                                            <Edit2 size={16} className="text-warning" /> {t('common.edit')}
                                                        </button>
                                                    </li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <button className="dropdown-item rounded-3 p-2 d-flex align-items-center gap-2 text-danger" onClick={() => handleDelete(team.id)}>
                                                            <Trash2 size={16} /> {t('common.delete')}
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTeams.length === 0 && !isAddingTeam && (
                    <motion.div 
                        className="col-12 text-center py-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                            <Shield size={48} className="text-muted opacity-20" />
                        </div>
                        <h4 className="text-muted">{t('teams.no_teams')}</h4>
                    </motion.div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .hover-shadow-lg:hover {
                    box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important;
                    transform: translateY(-5px);
                }
                .transition-all {
                    transition: all 0.3s ease-in-out;
                }
                .group:hover .group-hover-opacity-100 {
                    opacity: 1 !important;
                }
                .hover-scale:hover {
                    transform: scale(1.1);
                }
                .object-fit-cover {
                    object-fit: cover;
                }
                .border-dashed {
                    border-style: dashed !important;
                }
            `}} />
        </div>
    );
}

export default TeamsPage;
