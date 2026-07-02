import { Router } from "express";
import fs from "fs";
import path from "path";
import { update, uploadsDir } from "../db/database";

const router = Router();

router.post("/", (_req, res) => {
  update((s) => {
    s.completions = [];
    s.notes = [];
    s.media = [];
  });

  try {
    const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(uploadsDir, e.name);
      fs.rmSync(full, { recursive: true, force: true });
    }
  } catch {
    // uploads dir missing or already empty — fine
  }

  res.json({ ok: true });
});

export default router;
