import { Router } from "express";
import multer from "multer";
import { query } from "../db.js";
import { requireAuth, requireCsrfHeader } from "../auth.js";
import { wrap, HttpError, text, url, slugify, intId } from "../utils.js";
import { uploadBuffer } from "../cloudinary.js";

const router = Router();

// Every route below needs a valid session (and the header on writes)
router.use(requireAuth, requireCsrfHeader);

/* ---------------- Profile ---------------- */

router.put(
  "/profile",
  wrap(async (req, res) => {
    const b = req.body || {};
    const values = [
      text(b.full_name, { required: true, max: 120, name: "Name" }),
      text(b.headline, { max: 200 }),
      text(b.bio, { max: 4000 }),
      text(b.location, { max: 120 }),
      text(b.email, { max: 200 }),
      url(b.avatar_url, { name: "Avatar URL" }),
      url(b.linkedin_url, { name: "LinkedIn URL" }),
      url(b.github_url, { name: "GitHub URL" }),
      url(b.resume_url, { name: "Résumé URL" }),
      text(b.about_md, { max: 20000, name: "About text" }),
    ];

    const { rows } = await query(
      `INSERT INTO profile
         (id, full_name, headline, bio, location, email, avatar_url, linkedin_url, github_url, resume_url, about_md)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         headline = EXCLUDED.headline,
         bio = EXCLUDED.bio,
         location = EXCLUDED.location,
         email = EXCLUDED.email,
         avatar_url = EXCLUDED.avatar_url,
         linkedin_url = EXCLUDED.linkedin_url,
         github_url = EXCLUDED.github_url,
         resume_url = EXCLUDED.resume_url,
         about_md = EXCLUDED.about_md,
         updated_at = now()
       RETURNING *`,
      values
    );
    res.json(rows[0]);
  })
);
/* ---------------- Projects ---------------- */

function projectFields(b) {
  const title = text(b.title, { required: true, max: 160, name: "Title" });
  const slug = slugify(text(b.slug, { max: 80 }) || title);
  if (!slug) throw new HttpError(400, "Slug is required");

  const tools = Array.isArray(b.tools)
    ? [...new Set(b.tools.map((t) => String(t).trim().slice(0, 40)).filter(Boolean))].slice(0, 20)
    : [];

  return [
    slug,
    title,
    text(b.summary, { max: 500 }),
    tools,
    text(b.body_md, { max: 50000 }),
    url(b.report_embed_url, { name: "Report URL" }),
    url(b.repo_url, { name: "Repo URL" }),
    url(b.cover_image_url, { name: "Cover image URL" }),
    b.status === "published" ? "published" : "draft",
  ];
}

// All projects, drafts included
router.get(
  "/projects",
  wrap(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, title, summary, tools, status, sort_order, cover_image_url, updated_at
       FROM projects ORDER BY sort_order, id`
    );
    res.json(rows);
  })
);

// Save a new order: body { ids: [3, 1, 2] }  (must be defined before /projects/:id)
router.put(
  "/projects/order",
  wrap(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(intId) : [];
    if (ids.length === 0) throw new HttpError(400, "ids is required");
    await query(
      `UPDATE projects p SET sort_order = v.ord
       FROM unnest($1::int[]) WITH ORDINALITY AS v(id, ord)
       WHERE p.id = v.id`,
      [ids]
    );
    res.json({ ok: true });
  })
);

router.get(
  "/projects/:id",
  wrap(async (req, res) => {
    const id = intId(req.params.id);
    const { rows } = await query("SELECT * FROM projects WHERE id = $1", [id]);
    if (!rows[0]) throw new HttpError(404, "Project not found");
    const media = await query(
      "SELECT * FROM project_media WHERE project_id = $1 ORDER BY sort_order, id",
      [id]
    );
    res.json({ ...rows[0], media: media.rows });
  })
);

router.post(
  "/projects",
  wrap(async (req, res) => {
    const f = projectFields(req.body || {});
    const { rows } = await query(
      `INSERT INTO projects
         (slug, title, summary, tools, body_md, report_embed_url, repo_url, cover_image_url, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
         (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM projects))
       RETURNING *`,
      f
    );
    res.status(201).json({ ...rows[0], media: [] });
  })
);

router.put(
  "/projects/:id",
  wrap(async (req, res) => {
    const id = intId(req.params.id);
    const f = projectFields(req.body || {});
    const { rows } = await query(
      `UPDATE projects SET
         slug = $1, title = $2, summary = $3, tools = $4, body_md = $5,
         report_embed_url = $6, repo_url = $7, cover_image_url = $8,
         status = $9, updated_at = now()
       WHERE id = $10
       RETURNING *`,
      [...f, id]
    );
    if (!rows[0]) throw new HttpError(404, "Project not found");
    res.json(rows[0]);
  })
);

router.delete(
  "/projects/:id",
  wrap(async (req, res) => {
    const { rowCount } = await query("DELETE FROM projects WHERE id = $1", [intId(req.params.id)]);
    if (!rowCount) throw new HttpError(404, "Project not found");
    res.json({ ok: true });
  })
);

/* ---------------- Project media ---------------- */

function mediaFields(b) {
  const kind = b.kind;
  if (!["image", "video", "link", "sql"].includes(kind)) {
    throw new HttpError(400, "Invalid media type");
  }
  const caption = text(b.caption, { max: 300 });
  if (kind === "sql") {
    return [kind, null, text(b.content, { required: true, max: 20000, name: "SQL" }), caption];
  }
  return [kind, url(b.url, { required: true, name: "URL" }), null, caption];
}

router.post(
  "/projects/:id/media",
  wrap(async (req, res) => {
    const id = intId(req.params.id);
    const f = mediaFields(req.body || {});
    const { rows } = await query(
      `INSERT INTO project_media (project_id, kind, url, content, caption, sort_order)
       SELECT p.id, $2, $3, $4, $5,
         (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM project_media WHERE project_id = p.id)
       FROM projects p WHERE p.id = $1
       RETURNING *`,
      [id, ...f]
    );
    if (!rows[0]) throw new HttpError(404, "Project not found");
    res.status(201).json(rows[0]);
  })
);

router.put(
  "/media/:mediaId",
  wrap(async (req, res) => {
    const f = mediaFields(req.body || {});
    const { rows } = await query(
      `UPDATE project_media SET kind = $1, url = $2, content = $3, caption = $4
       WHERE id = $5 RETURNING *`,
      [...f, intId(req.params.mediaId)]
    );
    if (!rows[0]) throw new HttpError(404, "Media item not found");
    res.json(rows[0]);
  })
);

router.delete(
  "/media/:mediaId",
  wrap(async (req, res) => {
    const { rowCount } = await query("DELETE FROM project_media WHERE id = $1", [
      intId(req.params.mediaId),
    ]);
    if (!rowCount) throw new HttpError(404, "Media item not found");
    res.json({ ok: true });
  })
);

/* ---------------- Skills ---------------- */

router.post(
  "/skills",
  wrap(async (req, res) => {
    const name = text(req.body?.name, { required: true, max: 60, name: "Skill name" });
    const category = text(req.body?.category, { required: true, max: 60, name: "Category" });
    const { rows } = await query(
      `INSERT INTO skills (name, category, sort_order)
       VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM skills WHERE category = $2))
       RETURNING *`,
      [name, category]
    );
    res.status(201).json(rows[0]);
  })
);

router.put(
  "/skills/:id",
  wrap(async (req, res) => {
    const name = text(req.body?.name, { required: true, max: 60, name: "Skill name" });
    const category = text(req.body?.category, { required: true, max: 60, name: "Category" });
    const { rows } = await query(
      "UPDATE skills SET name = $1, category = $2 WHERE id = $3 RETURNING *",
      [name, category, intId(req.params.id)]
    );
    if (!rows[0]) throw new HttpError(404, "Skill not found");
    res.json(rows[0]);
  })
);

router.delete(
  "/skills/:id",
  wrap(async (req, res) => {
    const { rowCount } = await query("DELETE FROM skills WHERE id = $1", [intId(req.params.id)]);
    if (!rowCount) throw new HttpError(404, "Skill not found");
    res.json({ ok: true });
  })
);

/* ---------------- Upload (Cloudinary) ---------------- */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

const upload = multer({
  storage: multer.memoryStorage(), // file stays in RAM, then goes straight to Cloudinary
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, "Only JPG, PNG, WebP, GIF or PDF files are allowed"));
  },
});

router.post(
  "/upload",
  upload.single("file"),
  wrap(async (req, res) => {
    if (!req.file) throw new HttpError(400, "No file received");
    const result = await uploadBuffer(req.file.buffer);
    res.status(201).json(result); // { url, public_id }
  })
);

export default router;