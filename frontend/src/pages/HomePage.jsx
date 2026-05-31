import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function HomePage() {
  const { isAuth, username } = useAuth();

  return (
    <div className="container mt-5 text-center">
      <h1 className="display-4 fw-bold">⚽ Football System</h1>
      <p className="lead text-muted mb-4">
        Система управління футбольними турнірами
      </p>

      {isAuth ? (
        <>
          <p className="text-success fs-5">Вітаємо, <strong>{username}</strong>!</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap mt-3">
            <Link to="/tournaments" className="btn btn-primary btn-lg">Мої турніри</Link>
            <Link to="/matches" className="btn btn-outline-primary btn-lg">Матчі</Link>
            <Link to="/standings" className="btn btn-outline-secondary btn-lg">Таблиця</Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted mb-4">
            Переглядайте публічні турніри або увійдіть щоб керувати своїми.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/tournaments/public" className="btn btn-outline-primary btn-lg">
              🌍 Переглянути турніри
            </Link>
            <Link to="/login" className="btn btn-primary btn-lg">Увійти</Link>
            <Link to="/register" className="btn btn-outline-secondary btn-lg">Реєстрація</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
