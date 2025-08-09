import { Router } from "express";
import City from "../models/City.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const cities = await City.find({ user: req.userId }).sort({ createdAt: 1 });
  res.json(cities);
});

router.get("/:id", auth, async (req, res) => {
  const city = await City.findOne({ _id: req.params.id, user: req.userId });
  if (!city) return res.status(404).json({ message: "Not found" });
  res.json(city);
});

router.post("/", auth, async (req, res) => {
  const payload = { ...req.body, user: req.userId };
  const created = await City.create(payload);
  res.status(201).json(created);
});

router.delete("/:id", auth, async (req, res) => {
  await City.deleteOne({ _id: req.params.id, user: req.userId });
  res.status(204).end();
});

export default router;
