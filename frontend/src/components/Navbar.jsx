import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, LogOut, User, Globe, Trophy, Users, Calendar, LayoutDashboard, BarChart3, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

function Navbar() {
  const { isAuth, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active fw-bold border-bottom border-warning" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3 py-2 sticky-top shadow-sm glass-nav">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <motion.span 
            className="me-2 fs-3"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >⚽</motion.span>
          <span>FOOTBALL <span className="text-warning">SYSTEM</span></span>
        </Link>

        <div className="d-flex align-items-center gap-2 lg-hidden">
           <button
            className="navbar-toggler border-0 p-1"
            type="button"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <Link className={isActive("/tournaments/public")} to="/tournaments/public" onClick={() => setOpen(false)}>
                <span className="d-flex align-items-center gap-1"><Globe size={16} /> {t('navbar.public')}</span>
              </Link>
            </li>
            {isAuth && (
              <>
                <li className="nav-item">
                  <Link className={isActive("/teams")} to="/teams" onClick={() => setOpen(false)}>
                    <span className="d-flex align-items-center gap-1"><Shield size={16} /> {t('navbar.teams')}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={isActive("/tournaments")} to="/tournaments" onClick={() => setOpen(false)}>
                    <span className="d-flex align-items-center gap-1"><Trophy size={16} /> {t('navbar.tournaments')}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={isActive("/matches")} to="/matches" onClick={() => setOpen(false)}>
                    <span className="d-flex align-items-center gap-1"><Calendar size={16} /> {t('navbar.matches')}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={isActive("/standings")} to="/standings" onClick={() => setOpen(false)}>
                    <span className="d-flex align-items-center gap-1"><LayoutDashboard size={16} /> {t('navbar.standings')}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={isActive("/statistics")} to="/statistics" onClick={() => setOpen(false)}>
                    <span className="d-flex align-items-center gap-1"><BarChart3 size={16} /> {t('navbar.statistics')}</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-light p-0" onClick={toggleLanguage} title="Change Language">
               <span className="fw-bold">{i18n.language.toUpperCase()}</span>
            </button>
            <button className="btn btn-link text-light p-0" onClick={toggleTheme} title="Перемкнути тему">
               {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {isAuth ? (
              <>
                <div className="d-flex align-items-center bg-white bg-opacity-10 px-3 py-1 rounded-pill">
                  <User size={14} className="text-warning me-2" />
                  <span className="text-light small"><strong>{username}</strong></span>
                </div>
                <button className="btn btn-outline-warning btn-sm fw-bold px-3 rounded-pill d-flex align-items-center gap-2" onClick={handleLogout}>
                  <LogOut size={14} /> {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link className="btn text-light fw-bold" to="/login" onClick={() => setOpen(false)}>{t('navbar.login')}</Link>
                <Link className="btn btn-warning btn-sm px-4 fw-bold rounded-pill shadow-sm" to="/register" onClick={() => setOpen(false)}>
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
