import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${Server_URL}users/login`, data);

      const token = response.data.token;
      const role = response.data.user.role;

      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);

      if (role === "admin" || role === "librarian") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      showSuccessToast("Login Successful!");
    } catch (error) {
      showErrorToast("Invalid Login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        
        <h2 className="login-title">User Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">

          <div className="form-group">
            <label>Email</label>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              className="form-input"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              {...register("password", { required: "Password is required" })}
              type="password"
              className="form-input"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="btn-submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
