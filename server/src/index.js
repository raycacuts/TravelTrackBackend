// server/src/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import cityRoutes from "./routes/cities.js";
import planRoutes from "./routes/plans.js";
import City from "./models/City.js";
import Plan from "./models/Plan.js";

dotenv.config();

const app = express();

/* ---------- Trust proxy (Azure / App Service / proxies) ---------- */
app.set("trust proxy", 1);

/* ---------- DB ---------- */
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/worldwise";
mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => console.log("[DB] connected"))
  .catch((e) => {
    console.error("[DB] connection error", e);
    process.exit(1);
  });

/* ---------- CORS (env-driven whitelist) ---------- */
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow server-to-server, curl, Postman (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight

/* ---------- Security, logging, parsing ---------- */
app.use(
  helmet({
    // If you serve images/files cross-origin, uncomment the next line:
    // crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* ---------- Rate limiting ---------- */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,            // 300 requests/min/IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

/* ---------- Static uploads (for avatar or files) ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
app.use(`/${UPLOAD_DIR}`, express.static(path.join(__dirname, "..", UPLOAD_DIR)));

/* ---------- Health ---------- */
app.get("/api/health", async (_req, res) => {
  let stats = {};
  try {
    stats = await mongoose.connection.db.command({ serverStatus: 1 });
  } catch {
    // ignore if serverStatus is restricted
  }
  res.json({
    ok: true,
    db: mongoose.connection.readyState, // 1 = connected
    time: new Date().toISOString(),
    connections: stats.connections || undefined,
    node: process.version,
    env: process.env.NODE_ENV || "development",
  });
});

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/plans", planRoutes);

/* ---------- Auto-clear every 2 hours (optional) ---------- */
const CLEAR_INTERVAL_MS = 2 * 60 * 60 * 1000;
async function clearAll() {
  try {
    await City.deleteMany({});
    await Plan.deleteMany({});
    console.log(`[CLEAR] All cities & plans removed at ${new Date().toISOString()}`);
  } catch (e) {
    console.error("[CLEAR] failed", e);
  }
}
setInterval(clearAll, CLEAR_INTERVAL_MS);

/* ---------- 404 & error handler ---------- */
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const msg =
    process.env.NODE_ENV === "production"
      ? "Server error"
      : err.message || "Server error";
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err);
  }
  res.status(status).json({ message: msg });
});

/* ---------- Start & graceful shutdown ---------- */
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);

function shutdown(signal) {
  console.log(`[${signal}] Shutting down...`);
  server.close(async () => {
    try {
      await mongoose.disconnect();
      console.log("[DB] disconnected");
    } finally {
      process.exit(0);
    }
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
