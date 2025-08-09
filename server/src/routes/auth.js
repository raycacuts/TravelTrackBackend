import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

/* ---------- Multer setup ---------- */
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const name = `${req.userId || "anon"}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
});

/* ---------- Helpers ---------- */
function sign(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicAvatarUrl(user, req) {
  // If user.avatar is set (e.g., "/uploads/xyz.png"), return absolute URL
  if (user?.avatar) {
    const base =
      process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    // ensure leading slash
    const rel = user.avatar.startsWith("/") ? user.avatar : `/${user.avatar}`;
    return `${base}${rel}`;
  }
  // Fallback avatar
  return `https://i.pravatar.cc/100?u=${user?._id || "anon"}`;
}

/* ---------- Auth routes ---------- */

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash }); // avatar optional
  res
    .status(201)
    .json({ id: user._id, name: user.name, email: user.email });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = sign(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: publicAvatarUrl(user, req),
    },
  });
});

// Upload avatar (multipart/form-data, field: "avatar")
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    // Save relative path in DB (so we can compose absolute URL dynamically)
    const relativePath = `/${UPLOAD_DIR}/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: relativePath },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ avatar: publicAvatarUrl(user, req) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload error" });
  }
});

export default router;
