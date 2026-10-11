-- Re-runnable during development: drops everything and recreates it
DROP TABLE IF EXISTS project_media CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- The admin login (just one row, no public sign-up)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Single-row table: the CHECK forces id = 1, so there's only ever one profile
CREATE TABLE profile (
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name    TEXT NOT NULL,
  headline     TEXT,
  bio          TEXT,
  location     TEXT,
  email        TEXT,
  avatar_url   TEXT,
  linkedin_url TEXT,
  github_url   TEXT,
  resume_url   TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,          -- used in the URL: /projects/sales-dashboard
  title            TEXT NOT NULL,
  summary          TEXT,                          -- short blurb for the project card
  tools            TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'Power BI','SQL'}
  body_md          TEXT,                          -- the write-up, in Markdown
  report_embed_url TEXT,                          -- Power BI "publish to web" link
  repo_url         TEXT,
  cover_image_url  TEXT,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extra images / SQL snippets / links attached to a project
CREATE TABLE project_media (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('image', 'sql', 'link', 'video')),
  url         TEXT,        -- for image / link
  content     TEXT,        -- for sql snippets
  caption     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE skills (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,   -- e.g. 'BI Tools', 'Databases', 'Languages'
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_projects_status_order ON projects (status, sort_order);
CREATE INDEX idx_media_project ON project_media (project_id, sort_order);
CREATE UNIQUE INDEX skills_name_category_uniq ON skills (lower(name), category);
