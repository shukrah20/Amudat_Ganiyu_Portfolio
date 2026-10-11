import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import NotFound from "./pages/NotFound.jsx";
import About from "./pages/About.jsx";

const AdminApp = lazy(() => import("./AdminApp.jsx"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="admin/*"
        element={
          <Suspense fallback={<p style={{ padding: "2rem" }}>Loading…</p>}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}