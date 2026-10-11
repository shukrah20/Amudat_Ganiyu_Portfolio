import "dotenv/config";
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "portfolio_session";

const isProd = process.env.NODE_ENV === "production";

export const cookieOptions = {
  httpOnly: true, // JavaScript in the page can't read it
  secure: isProd,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export function signSession(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not logged in" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

// Writes must carry a custom header. A random other website can't add it
// to a request without triggering a CORS preflight, which our CORS rules refuse.
export function requireCsrfHeader(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.get("X-Requested-With") !== "portfolio") {
    return res.status(403).json({ error: "Missing request header" });
  }
  next();
}