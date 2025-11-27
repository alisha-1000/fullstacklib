import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const AdminLogin = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // IMPORTANT FIX: Correct backend route
      const response = await axios.post(`${Server_URL}users/login`, data);

      const { token, user } = response.data;

      // Only allow admin or librarian
      if (user.role !== "admin" && user.role !== "librarian") {
        showErrorToast("Access Denied! You are not an Admin.");
        return;
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("role", user.role);

      showSuccessToast("Admin Login Successful");
      navigate("/admin");
    } catch (err) {
      showErrorToast("Invalid Credentials!");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("email")} type="email" placeholder="Admin Email" />
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
