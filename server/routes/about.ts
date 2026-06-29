import { Router } from "express";
import { read, update, nowIso } from "../db/database";

const router = Router();

router.get("/", (_req, res) => {
  res.json(read().about);
});

router.put("/", (req, res) => {
  const { body } = req.body as { body?: string };
  const text = (body ?? "").toString();
  update((s) => {
    s.about = { body: text, updated_at: nowIso() };
  });
  res.json(read().about);
});

export default router;
