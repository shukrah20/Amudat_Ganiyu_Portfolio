import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import { fillCrop } from "../images.js";
import ThemeToggle from "./ThemeToggle.jsx";

const shell = "mx-auto w-full max-w-5xl px-5 sm:px-8";

const navLink = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-ink" : "text-muted hover:text-ink"
  }`;

export default function Layout() {
  const { data: profile } = useFetch(api.profile, []);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className={`${shell} flex h-16 items-center justify-between gap-4`}>
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {profile?.avatar_url && (
              <img
                src={fillCrop(profile.avatar_url, 72, 72)}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-line"
              />
            )}
            <span className="truncate font-display text-lg font-bold tracking-tight">
              {profile?.full_name || "Portfolio"}
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-5 sm:gap-6">
            <NavLink to="/projects" className={navLink}>Projects</NavLink>
            <NavLink to="/about" className={navLink}>About</NavLink>
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="cta-quiet hidden py-1.5 sm:inline-flex"
              >
                Contact
              </a>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className={`${shell} flex-1`}>
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-line py-8 text-sm text-muted">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3`}>
          <span>
            © {new Date().getFullYear()} {profile?.full_name}
          </span>
          <div className="flex gap-5">
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-ink">
                LinkedIn
              </a>
            )}
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="hover:text-ink">
                GitHub
              </a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="hover:text-ink">
                Email
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}