export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Lets async route handlers send errors to Express (Express 4 doesn't do it itself)
export const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Trimmed string, or null if empty
export function text(value, { required = false, max = 20000, name = "Field" } = {}) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    if (required) throw new HttpError(400, `${name} is required`);
    return null;
  }
  if (v.length > max) throw new HttpError(400, `${name} is too long`);
  return v;
}

// Only http(s) URLs are accepted
export function url(value, { required = false, name = "URL" } = {}) {
  const v = text(value, { required, max: 2000, name });
  if (v === null) return null;
  let u;
  try {
    u = new URL(v);
  } catch {
    throw new HttpError(400, `${name} is not a valid URL`);
  }
  if (!["http:", "https:"].includes(u.protocol)) {
    throw new HttpError(400, `${name} must start with http:// or https://`);
  }
  return v;
}

export function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function intId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, "Invalid id");
  return n;
}