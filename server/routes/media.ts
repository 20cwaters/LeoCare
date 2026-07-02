import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { read, update, uploadsDir, nowIso } from "../db/database";

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BYTES = 25 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const date = String(req.params.date || "");
    if (!DATE_RE.test(date)) return cb(new Error("invalid date"), "");
    const dir = path.join(uploadsDir, date);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const id = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8);
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 10 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (!ok) return cb(new Error("only image or video files allowed"));
    cb(null, true);
  },
});

router.post("/:date", (req, res) => {
  const date = req.params.date;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "invalid date" });

  upload.array("files", 10)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const files = (req.files as Express.Multer.File[]) || [];

    const created: any[] = [];
    update((s) => {
      for (const f of files) {
        const media = {
          id: path.basename(f.filename, path.extname(f.filename)),
          date,
          filename: f.filename,
          mime: f.mimetype,
          size: f.size,
          uploaded_at: nowIso(),
        };
        s.media.push(media);
        created.push(media);
      }
    });

    res.json({ media: created });
  });
});

router.get("/:date", (req, res) => {
  const date = req.params.date;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "invalid date" });
  const items = read()
    .media.filter((m) => m.date === date)
    .sort((a, b) => a.uploaded_at.localeCompare(b.uploaded_at));
  res.json(items);
});

router.delete("/:date/:id", (req, res) => {
  const { date, id } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "invalid date" });

  let removedFile: string | null = null;
  update((s) => {
    const idx = s.media.findIndex((m) => m.date === date && m.id === id);
    if (idx >= 0) {
      removedFile = path.join(uploadsDir, date, s.media[idx].filename);
      s.media.splice(idx, 1);
    }
  });

  if (removedFile) {
    try {
      fs.unlinkSync(removedFile);
    } catch {
      // ignore
    }
  }
  res.json({ ok: true });
});

export default router;
