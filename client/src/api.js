async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  let payload;

  if (form) {
    payload = form; // FormData: the browser sets the content type itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  if (method !== "GET") headers["X-Requested-With"] = "portfolio";

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: payload,
    credentials: "include",
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON response
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // public
  profile: () => request("/profile"),
  skills: () => request("/skills"),
  projects: () => request("/projects"),
  project: (slug) => request(`/projects/${encodeURIComponent(slug)}`),

  // auth
  me: () => request("/auth/me"),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  logout: () => request("/auth/logout", { method: "POST" }),

  // admin: profile
  saveProfile: (data) => request("/admin/profile", { method: "PUT", body: data }),

  // admin: projects
  adminProjects: () => request("/admin/projects"),
  adminProject: (id) => request(`/admin/projects/${id}`),
  createProject: (data) => request("/admin/projects", { method: "POST", body: data }),
  updateProject: (id, data) => request(`/admin/projects/${id}`, { method: "PUT", body: data }),
  deleteProject: (id) => request(`/admin/projects/${id}`, { method: "DELETE" }),
  reorderProjects: (ids) => request("/admin/projects/order", { method: "PUT", body: { ids } }),

  // admin: media
  addMedia: (projectId, data) =>
    request(`/admin/projects/${projectId}/media`, { method: "POST", body: data }),
  updateMedia: (id, data) => request(`/admin/media/${id}`, { method: "PUT", body: data }),
  deleteMedia: (id) => request(`/admin/media/${id}`, { method: "DELETE" }),

  // admin: skills
  addSkill: (data) => request("/admin/skills", { method: "POST", body: data }),
  deleteSkill: (id) => request(`/admin/skills/${id}`, { method: "DELETE" }),

  // admin: file upload → { url, public_id }
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/admin/upload", { method: "POST", form });
  },
};