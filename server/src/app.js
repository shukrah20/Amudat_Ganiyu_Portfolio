import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.set("trust proxy", 1); // so rate limiting sees real IPs behind a host's proxy

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || false,
        credentials: true,
    })
);
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
    if (err.status && err.status < 500) {
        return res.status(err.status).json({ error: err.message });
    }
    if (err.code === "23505") {
        return res.status(409).json({ error: "That already exists. Check for a duplicate." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File is too large (4MB max)." });
    }
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
});

export default app;