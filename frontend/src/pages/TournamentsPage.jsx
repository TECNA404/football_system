import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Trophy, Plus, Search, Filter, Globe, Lock, Calendar, Edit3, Trash2, Copy, Check, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTournaments } from "../hooks/useTournaments";
import { formatDateOnly } from "../utils/formatters";
import { confirmAction } from "../utils/uiUtils";

function TournamentsPage() {
  const { t, i18n } = useTranslation();
  const {
    tournaments,
    loading,
    error,
    handleCreateTournament,
    handleUpdateTournament,
    handleDeleteTournament,
  } = useTournaments();

  const [form, setForm] = useState({ name: "", year: "", description: "", is_public: false });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, public, private

  const filteredTournaments = tournaments
    .filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = 
        typeFilter === "all" ? true :
        typeFilter === "public" ? t.is_public :
        !t.is_public;
      return matchesSearch && matchesType;
    });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(t('common.loading'));
    const res = await handleCreateTournament(form);
    if (res.success) {
      setForm({ name: "", year: "", description: "", is_public: false });
      setShowForm(false);
      toast.success(t('common.success'), { id: loadingToast });
    } else {
        toast.error(res.error || t('common.error'), { id: loadingToast });
    }
  };

  // Відкрити редагування
  const handleEditOpen = (t) => {
    setEditId(t.id);
    setEditForm({
      name: t.name,
      year: t.year || "",
      description: t.description || "",
      is_public: t.is_public,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditSave = async (id) => {
    const loadingToast = toast.loading(t('common.loading'));
    const res = await handleUpdateTournament(id, editForm);
    if (res.success) {
      setEditId(null);
      toast.success(t('common.success'), { id: loadingToast });
    } else {
        toast.error(res.error || t('common.error'), { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!confirmAction(t('common.delete') + "?")) return;
    const loadingToast = toast.loading(t('common.loading'));
    const res = await handleDeleteTournament(id);
    if (res.success) {
        toast.success(t('common.delete'), { id: loadingToast });
    } else {
        toast.error(res.error || t('common.error'), { id: loadingToast });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.success'));
  };

  const publicCount = tournaments.filter((t) => t.is_public).length;
  const privateCount = tournaments.filter((t) => !t.is_public).length;

  return (
    <div className="container mt-4 mb-5">
      <motion.div 
        className="row align-items-center mb-5 g-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="col-md">
           <h1 className="fw-black text-gradient display-4 mb-1">{t('navbar.tournaments')}</h1>
           <p className="text-muted lead mb-0">{i18n.language === 'uk' ? 'Створюйте та керуйте професійними футбольними змаганнями' : 'Create and manage professional football competitions'}</p>
        </div>
        <div className="col-md-auto">
          <button 
            className={`btn btn-lg shadow-premium d-flex align-items-center gap-2 ${showForm ? 'btn-light' : 'btn-primary'}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            <span className="fw-black">{showForm ? t('common.cancel') : t('tournaments.add_tournament')}</span>
          </button>
        </div>
      </motion.div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
           <div className="glass-card rounded-4 p-4 border shadow-premium text-center">
              <div className="bg-primary bg-opacity-10 text-primary d-inline-flex p-3 rounded-circle mb-3">
                 <Trophy size={32} />
              </div>
              <h3 className="fw-black mb-1">{tournaments.length}</h3>
              <div className="text-muted small fw-bold">{t('common.all').toUpperCase()}</div>
           </div>
        </div>
        <div className="col-md-4">
           <div className="glass-card rounded-4 p-4 border shadow-premium text-center">
              <div className="bg-success bg-opacity-10 text-success d-inline-flex p-3 rounded-circle mb-3">
                 <Globe size={32} />
              </div>
              <h3 className="fw-black mb-1">{publicCount}</h3>
              <div className="text-muted small fw-bold">{i18n.language === 'uk' ? 'ПУБЛІЧНІ' : 'PUBLIC'}</div>
           </div>
        </div>
        <div className="col-md-4">
           <div className="glass-card rounded-4 p-4 border shadow-premium text-center">
              <div className="bg-warning bg-opacity-10 text-warning d-inline-flex p-3 rounded-circle mb-3">
                 <Lock size={32} />
              </div>
              <h3 className="fw-black mb-1">{privateCount}</h3>
              <div className="text-muted small fw-bold">{i18n.language === 'uk' ? 'ПРИВАТНІ' : 'PRIVATE'}</div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="card border-0 shadow-premium mb-5 rounded-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="card-header bg-primary text-white p-4 border-0">
               <h5 className="fw-black mb-0 d-flex align-items-center gap-2">
                 <Plus size={22} /> {t('tournaments.add_tournament')}
               </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleCreate}>
                <div className="row g-4">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">{t('tournaments.name')}</label>
                      <input name="name" className="form-control border shadow-sm py-2" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">{t('tournaments.description')}</label>
                      <textarea name="description" className="form-control border shadow-sm" rows="3" value={form.description} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">{t('tournaments.year')}</label>
                      <input name="year" className="form-control border shadow-sm py-2" type="number" placeholder="2024" value={form.year} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                      <div className="form-check form-switch p-3 bg-light rounded-3">
                        <input className="form-check-input ms-0 me-2" type="checkbox" name="is_public" id="isPublicSwitch" checked={form.is_public} onChange={handleChange} />
                        <label className="form-check-label fw-bold text-dark" htmlFor="isPublicSwitch">
                          {t('tournaments.public')}
                        </label>
                        <div className="small text-muted mt-1">{i18n.language === 'uk' ? 'Дозволити анонімний перегляд' : 'Allow anonymous viewing'}</div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-3 shadow-premium" disabled={loading}>
                      <Plus size={20} className="me-2" /> {t('common.add')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-4 p-4 border shadow-premium mb-5">
        <div className="row g-3 align-items-center">
          <div className="col-md-7">
            <div className="input-group border rounded-3 overflow-hidden shadow-sm">
              <span className="input-group-text bg-white border-0 ps-3">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 py-2"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-5">
            <div className="btn-group w-100 shadow-sm rounded-3 overflow-hidden border">
               <button className={`btn btn-sm py-2 ${typeFilter === 'all' ? 'btn-primary' : 'btn-light'}`} onClick={() => setTypeFilter('all')}>
                 {t('common.all')}
               </button>
               <button className={`btn btn-sm py-2 ${typeFilter === 'public' ? 'btn-primary' : 'btn-light'}`} onClick={() => setTypeFilter('public')}>
                 <Globe size={14} className="me-1" /> {i18n.language === 'uk' ? 'Публічні' : 'Public'}
               </button>
               <button className={`btn btn-sm py-2 ${typeFilter === 'private' ? 'btn-primary' : 'btn-light'}`} onClick={() => setTypeFilter('private')}>
                 <Lock size={14} className="me-1" /> {i18n.language === 'uk' ? 'Приватні' : 'Private'}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Список */}
      <AnimatePresence>
        {filteredTournaments.length === 0 ? (
            <motion.div 
                className="card border-0 shadow-sm text-center py-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
            <div className="display-1 mb-3">🏆</div>
            <h4 className="text-muted">{t('tournaments.no_tournaments')}</h4>
            </motion.div>
        ) : (
            <div className="row g-4">
            {filteredTournaments.map((tournament, idx) => (
                <motion.div 
                    key={tournament.id} 
                    className="col-md-6 col-lg-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    layout
                >
                <div className="card h-100 border-0 shadow-sm tournament-card hover-card">
                    {editId === tournament.id ? (
                    /* ===== РЕЖИМ РЕДАГУВАННЯ ===== */
                    <div className="card-body p-4">
                        <h6 className="fw-black text-primary mb-4 border-bottom pb-2 d-flex align-items-center gap-2">
                            <Edit3 size={18} /> {t('common.edit')}
                        </h6>
                        <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1">{t('tournaments.name')} *</label>
                        <input className="form-control" name="name"
                            value={editForm.name} onChange={handleEditChange} required />
                        </div>
                        <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1">{t('tournaments.year')}</label>
                            <input className="form-control" name="year"
                            type="number" min="2000" max="2100"
                            value={editForm.year} onChange={handleEditChange} />
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1">{t('tournaments.public')}</label>
                            <div
                            className={`form-check p-2 rounded border small ${editForm.is_public ? "border-success bg-success bg-opacity-10" : "border-secondary"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setEditForm((p) => ({ ...p, is_public: !p.is_public }))}
                            >
                            <input className="form-check-input ms-0" type="checkbox"
                                name="is_public" checked={editForm.is_public}
                                onChange={handleEditChange}
                                onClick={(e) => e.stopPropagation()} />
                            <label className="form-check-label ms-2 small fw-bold" style={{ cursor: "pointer" }}>
                                {editForm.is_public ? "🌍" : "🔒"} {editForm.is_public ? (i18n.language === 'uk' ? 'Публ.' : 'Public') : (i18n.language === 'uk' ? 'Прив.' : 'Private')}
                            </label>
                            </div>
                        </div>
                        </div>
                        <div className="mb-4">
                        <label className="form-label small fw-bold text-muted mb-1">{t('tournaments.description')}</label>
                        <input className="form-control" name="description"
                            value={editForm.description} onChange={handleEditChange} />
                        </div>
                        <div className="d-flex gap-2 mt-auto">
                        <button className="btn btn-success flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleEditSave(tournament.id)}>
                            <Check size={18} /> {t('common.save')}
                        </button>
                        <button className="btn btn-outline-secondary"
                            onClick={() => setEditId(null)}>
                            <X size={18} />
                        </button>
                        </div>
                    </div>
                    ) : (
                    /* ===== РЕЖИМ ПЕРЕГЛЯДУ ===== */
                    <>
                        <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                            <h5 className="card-title fw-black mb-0 text-dark">{tournament.name}</h5>
                            <span className={`badge px-2 py-1 rounded-pill small d-flex align-items-center gap-1 ${tournament.is_public ? "bg-success" : "bg-secondary bg-opacity-75"}`}>
                            {tournament.is_public ? <Globe size={12} /> : <Lock size={12} />}
                            {tournament.is_public ? (i18n.language === 'uk' ? 'Публічний' : 'Public') : (i18n.language === 'uk' ? 'Приватний' : 'Private')}
                            </span>
                        </div>
                        
                        <div className="d-flex gap-3 mb-3 small text-muted">
                            {tournament.year && <span className="d-flex align-items-center gap-1"><Calendar size={14} /> <strong>{tournament.year}</strong></span>}
                            <span className="d-flex align-items-center gap-1"><Info size={14} /> {formatDateOnly(tournament.created_at, i18n.language)}</span>
                        </div>

                        {tournament.description && (
                            <p className="card-text text-muted small mb-4 flex-grow-1">
                            {tournament.description}
                            </p>
                        )}
                        {!tournament.description && <div className="flex-grow-1"></div>}

                        {tournament.is_public && (
                            <div className="mt-3 p-3 bg-light rounded-3 border-start border-primary border-4 shadow-sm small">
                            <div className="text-muted fw-bold mb-1 small d-flex align-items-center gap-1">
                                <Copy size={12} /> {i18n.language === 'uk' ? 'Публічне посилання:' : 'Public link:'}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <input 
                                    className="form-control form-control-sm bg-white border-0 small py-0" 
                                    readOnly 
                                    value={`${window.location.origin}/public#${tournament.id}`} 
                                    style={{ fontSize: '0.75rem' }}
                                />
                                <button className="btn btn-primary btn-sm p-1"
                                    onClick={() => copyToClipboard(`${window.location.origin}/public#${tournament.id}`)} 
                                    title={i18n.language === 'uk' ? 'Скопіювати' : 'Copy'}>
                                    <Copy size={14} />
                                </button>
                            </div>
                            </div>
                        )}
                        </div>
                        <div className="card-footer bg-transparent border-0 p-4 pt-0">
                        <div className="d-flex gap-2">
                          <button className="btn btn-light btn-sm flex-grow-1 fw-bold border d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleEditOpen(tournament)}>
                            <Edit3 size={16} /> {t('common.edit')}
                          </button>
                            <button className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center"
                            onClick={() => handleDelete(tournament.id)}>
                            <Trash2 size={16} />
                            </button>
                        </div>
                        </div>
                    </>
                    )}
                </div>
                </motion.div>
            ))}
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TournamentsPage;
