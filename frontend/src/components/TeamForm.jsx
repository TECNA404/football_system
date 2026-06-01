import React, { useState } from "react";
import { createTeam } from "../api/teamsApi";
import { getApiErrorMessage } from "../utils/apiUtils";

function TeamForm({ onCreated }) {
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    setLogoFile(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createTeam(name, logoFile);
      setName("");
      setLogoFile(null);
      setPreview(null);
      onCreated && onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err, "Помилка при створенні команди."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-3 border-primary">
      <h6 className="text-primary mb-3">+ Нова команда</h6>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="row g-2 align-items-end">
        <div className="col-md-5">
          <label className="form-label small mb-1">Назва *</label>
          <input className="form-control form-control-sm" value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Наприклад: Барселона" required />
        </div>
        <div className="col-md-4">
          <label className="form-label small mb-1">Логотип</label>
          <input className="form-control form-control-sm" type="file"
            accept="image/*" onChange={handleFile} />
        </div>
        <div className="col-md-1 text-center">
          {preview && (
            <img src={preview} alt="preview" width={36} height={36}
              style={{ objectFit: "cover", borderRadius: 6 }} />
          )}
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary btn-sm w-100" type="submit" disabled={loading}>
            {loading ? "..." : "✓ Додати"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default TeamForm;
