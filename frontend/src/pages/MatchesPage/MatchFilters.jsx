import React from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

function MatchFilters({
  searchTerm,
  setSearchTerm,
  selectedTournament,
  setSelectedTournament,
  tournaments,
  statusFilter,
  setStatusFilter,
  filterDate,
  setFilterDate,
  sortBy,
  setSortBy,
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className="glass-card rounded-4 p-4 border shadow-premium">
      <h6 className="fw-black mb-4 d-flex align-items-center gap-2">
        <Filter size={18} />
      </h6>
      <div className="d-flex flex-column gap-3">
        <div className="input-group border rounded-3 overflow-hidden shadow-sm">
          <span className="input-group-text bg-white border-0 ps-3">
            <Search size={18} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-0 py-2"
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select border shadow-sm py-2"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">
            {t("common.all")} {t("navbar.tournaments")}
          </option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="btn-group w-100 shadow-sm rounded-3 overflow-hidden border">
          <button
            className={`btn btn-sm py-2 ${statusFilter === "all" ? "btn-primary" : "btn-light"}`}
            onClick={() => setStatusFilter("all")}
          >
            {t("common.all")}
          </button>
          <button
            className={`btn btn-sm py-2 ${statusFilter === "scheduled" ? "btn-primary" : "btn-light"}`}
            onClick={() => setStatusFilter("scheduled")}
          >
            {t("matches.scheduled")}
          </button>
          <button
            className={`btn btn-sm py-2 ${statusFilter === "finished" ? "btn-primary" : "btn-light"}`}
            onClick={() => setStatusFilter("finished")}
          >
            {t("matches.finished")}
          </button>
        </div>
        <div className="input-group border rounded-3 overflow-hidden shadow-sm">
          <span className="input-group-text bg-white border-0 ps-3">
            <Calendar size={18} className="text-muted" />
          </span>
          <input
            type="date"
            className="form-control border-0 py-2"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <select
          className="form-select border shadow-sm py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date_desc">
            {i18n.language === "uk" ? "Нові спочатку" : "Newest first"}
          </option>
          <option value="date_asc">
            {i18n.language === "uk" ? "Старі спочатку" : "Oldest first"}
          </option>
          <option value="goals_desc">
            {i18n.language === "uk" ? "За голами" : "By goals"}
          </option>
        </select>
      </div>
    </div>
  );
}

export default MatchFilters;
