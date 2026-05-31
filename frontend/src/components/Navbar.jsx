import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar() {
  const { isAuth, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">⚽ Football System</Link>

      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
        {/* Публічні — завжди видимі */}
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className={isActive("/tournaments/public")} to="/tournaments/public">
              🌍 Турніри
            </Link>
          </li>
        </ul>

        {/* Приватні — тільки авторизованим */}
        {isAuth && (
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={isActive("/teams")} to="/teams">Команди</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive("/tournaments")} to="/tournaments">Мої турніри</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive("/matches")} to="/matches">Матчі</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive("/standings")} to="/standings">Таблиця</Link>
            </li>
          </ul>
        )}

        {/* Auth кнопки */}
        <ul className="navbar-nav ms-auto">
          {isAuth ? (
            <>
              <li className="nav-item d-flex align-items-center me-3">
                <span className="text-light small">👤 {username}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Вийти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className={isActive("/login")} to="/login">Увійти</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary btn-sm ms-2" to="/register">
                  Реєстрація
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
