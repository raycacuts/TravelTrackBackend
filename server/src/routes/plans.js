import { Router } from "express";
import Plan from "../models/Plan.js";
import { auth } from "../middleware/auth.js";

const router = Router();

/** GET /api/plans */
router.get("/", auth, async (req, res) => {
  const plans = await Plan.find({ user: req.userId }).sort({ createdAt: 1 });
  res.json(plans);
});

/** GET /api/plans/:id */
router.get("/:id", auth, async (req, res) => {
  const plan = await Plan.findOne({ _id: req.params.id, user: req.userId });
  if (!plan) return res.status(404).json({ message: "Not found" });
  res.json(plan);
});

/** POST /api/plans */
router.post("/", auth, async (req, res) => {
  const payload = { ...req.body, user: req.userId };
  // Minimal validation like cities route — Mongoose will handle required fields
  const created = await Plan.create(payload);
  res.status(201).json(created);
});

/** DELETE /api/plans/:id */
router.delete("/:id", auth, async (req, res) => {
  await Plan.deleteOne({ _id: req.params.id, user: req.userId });
  res.status(204).end();
});

export default router;
