import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/adminnavbar";
import AdminFooter from "../components/AdminFooter";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    if (role === "admin" || role === "librarian") {
      setAllowed(true);
    } else {
      navigate("/");
    }
  }, []);

  return allowed ? (
    <>
      <AdminNavbar />
      <Outlet />
      <AdminFooter />
    </>
  ) : null;
}
