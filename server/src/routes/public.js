import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// Express 4 doesn't catch errors from async handlers, so we wrap them
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// GET /api/profile
router.get(
  "/profile",
  wrap(async (req, res) => {
    const { rows } = await query("SELECT * FROM profile WHERE id = 1");
    res.json(rows[0] || null);
  })
);

// GET /api/skills  → grouped by category
router.get(
  "/skills",
  wrap(async (req, res) => {
    const { rows } = await query(
      "SELECT id, name, category FROM skills ORDER BY category, sort_order"
    );
    const grouped = {};
    for (const s of rows) {
      (grouped[s.category] ||= []).push(s);
    }
    res.json(grouped);
  })
);

// GET /api/projects  → published only, for the gallery
router.get(
  "/projects",
  wrap(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, title, summary, tools, cover_image_url
       FROM projects
       WHERE status = 'published'
       ORDER BY sort_order, id`
    );
    res.json(rows);
  })
);

// GET /api/projects/:slug  → one project with its media
router.get(
  "/projects/:slug",
  wrap(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM projects WHERE slug = $1 AND status = 'published'",
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: "Project not found" });

    const media = await query(
      "SELECT id, kind, url, content, caption FROM project_media WHERE project_id = $1 ORDER BY sort_order, id",
      [rows[0].id]
    );
    res.json({ ...rows[0], media: media.rows });
  })
);

export default router;