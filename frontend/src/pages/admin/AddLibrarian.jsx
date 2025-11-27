import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import { getRole } from "../../utils/auth"; // ROLE CHECK

export default function AddLibrarian() {
  
  const role = getRole();

  // Only Admin can add librarian
  if (role !== "admin") {
    return (
      <div className="container mt-4">
        <h3 className="text-danger text-center">❌ Access Denied</h3>
        <p className="text-center">Only Admin can add new Librarians.</p>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();


  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        role: "librarian",
      };

      const authToken = localStorage.getItem("authToken");

      const response = await axios.post(
        `${Server_URL}admin/addlibrarian`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );

      const { error, message } = response.data;

      if (error) {
        showErrorToast(message);
      } else {
        showSuccessToast(message || "Librarian Registered Successfully!");
        reset();
      }

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);

      const backendMsg = error.response?.data?.message || "Registration Failed!";
      showErrorToast(backendMsg);
    }
  };


  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">👤 Add Librarian</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 shadow bg-light rounded">
        
        {/* Name */}
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            {...register("name", { 
              required: "Name is required",
              minLength: { value: 3, message: "Minimum 3 characters required" }
            })}
          />
          {errors.name && <p className="text-danger">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" }
            })}
          />
          {errors.email && <p className="text-danger">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            {...register("password", { 
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters required" }
            })}
          />
          {errors.password && (
            <p className="text-danger">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Add Librarian
        </button>
      </form>
    </div>
  );
}
