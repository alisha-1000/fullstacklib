// src/utils/auth.js

// ---- TOKEN HELPERS ----
export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

// ---- ROLE HELPERS ----
export const setRole = (role) => {
  localStorage.setItem("role", role);
};

export const getRole = () => {
  return localStorage.getItem("role");     // "admin" | "librarian" | "user" | null
};

// ---- AUTH STATE ----
export const isLoggedIn = () => {
  return !!localStorage.getItem("authToken");
};

// ---- LOGOUT ----
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("role");
};
