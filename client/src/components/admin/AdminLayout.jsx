import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <span className="brand">Admin</span>
          <nav className="nav">
            <NavLink to="/admin/projects">Projects</NavLink>
            <NavLink to="/admin/profile">Profile</NavLink>
            <NavLink to="/admin/skills">Skills</NavLink>
            <Link to="/" target="_blank">View site ↗</Link>
            <button className="link-btn" onClick={logout}>Log out</button>
          </nav>
        </div>
      </header>
      <main className="container admin">
        <Outlet />
      </main>
    </>
  );
}