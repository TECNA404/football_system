import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
    const [form, setForm] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const handleChange = async (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/users/login/", form);
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            navigate("/teams");
        } catch (error) {
          alert("Login failed");  
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="col-md-4">
             <input
             type="text"
             name="username"
             className="form-control mb-3"
             placeholder="Username"
             onChange={handleChange}
             />
             <input
             type="password"
             name="password"
             className="form-control mb-3"
             placeholder="Password"
             onChange={handleChange}
             />
             <button className="btn btn-primary">Login</button>
             </form>
        </div>
    );
}

export default LoginPage;
