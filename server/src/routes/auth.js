import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { query } from "../db.js";
import { wrap } from "../utils.js";
import {
    COOKIE_NAME,
    cookieOptions,
    signSession,
    requireAuth,
    requireCsrfHeader,
} from "../auth.js";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts. Try again in a few minutes." },
});

// Compared against when the email doesn't exist, so response time doesn't reveal it
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

router.post(
    "/login",
    loginLimiter,
    wrap(async (req, res) => {
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "");

        const { rows } = await query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [email]
        );
        const user = rows[0];
        const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

        if (!user || !ok) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.cookie(COOKIE_NAME, signSession(user), cookieOptions);
        res.json({ email: user.email });
    })
);

router.post("/logout", requireCsrfHeader, (req, res) => {
    const { maxAge, ...opts } = cookieOptions;
    res.clearCookie(COOKIE_NAME, opts);
    res.json({ ok: true });
});

// The React app calls this on load to find out if she's logged in
router.get("/me", requireAuth, (req, res) => {
    res.json({ email: req.user.email });
});

export default router;