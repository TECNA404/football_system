import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await api.post("/users/register/", form);
      navigate("/login");
    } catch (error) {
      console.log("Register error:", error.response?.data);
      setErrors(error.response?.data || { detail: "Registration failed" });
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>

      {errors.detail && <div className="alert alert-danger">{errors.detail}</div>}
      {errors.username && <div className="alert alert-danger">{errors.username}</div>}
      {errors.email && <div className="alert alert-danger">{errors.email}</div>}
      {errors.password && <div className="alert alert-danger">{errors.password}</div>}
      {errors.password2 && <div className="alert alert-danger">{errors.password2}</div>}
      {errors.non_field_errors && (
        <div className="alert alert-danger">{errors.non_field_errors}</div>
      )}

      <form onSubmit={handleSubmit} className="col-md-4">
        <input
          type="text"
          name="username"
          className="form-control mb-2"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          className="form-control mb-2"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          className="form-control mb-2"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password2"
          className="form-control mb-2"
          placeholder="Confirm Password"
          value={form.password2}
          onChange={handleChange}
        />
        <button className="btn btn-success">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
