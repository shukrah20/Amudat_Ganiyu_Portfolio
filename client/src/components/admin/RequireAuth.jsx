import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

export default function RequireAuth() {
  const { user } = useAuth();

  if (user === undefined) return <p className="muted status container">Checking session…</p>;
  if (user === null) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}