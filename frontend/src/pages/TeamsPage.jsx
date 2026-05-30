import React, { useEffect, useState } from "react";
import api from "../api/axios";

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [name, setName] = useState("");

    const loadTeams = async () => {
        const res = await api.get("/teams/");
        setTeams(res.data);
    };

    const createTeam = async (e) => {
        e.preventDefault();
        await api.post("/teams/", { name });
        setName("");
        loadTeams();
    };

    useEffect(() => {
        loadTeams();
    }, []);

    return (
        <div className="container mt-4">
            <h2>My Teams</h2>

            <form onSubmit={createTeam} className="mb-4">
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Team Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="btn btn-primary">Create team</button>
            </form>

            <ul className="list-group">
                {teams.map((team) => (
                    <li key={team.id} className="list-group-item">
                        {team.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TeamsPage;
