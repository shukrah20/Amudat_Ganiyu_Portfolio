import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./admin.css";
import { AuthProvider } from "./AuthContext.jsx";
import RequireAuth from "./components/admin/RequireAuth.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import Login from "./pages/admin/Login.jsx";
import ProjectsList from "./pages/admin/ProjectsList.jsx";
import ProjectEditor from "./pages/admin/ProjectEditor.jsx";
import ProfileEditor from "./pages/admin/ProfileEditor.jsx";
import Skills from "./pages/admin/Skills.jsx";

export default function AdminApp() {
  // The admin screens are light-only; put the dark class back when leaving
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<ProjectEditor />} />
            <Route path="projects/:id" element={<ProjectEditor />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="skills" element={<Skills />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}