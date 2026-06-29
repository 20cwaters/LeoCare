import { Router } from "express";
import { read, update, nowIso } from "../db/database";

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (s: string) => DATE_RE.test(s);

function dayPayload(date: string) {
  const s = read();
  const tasks = s.tasks
    .filter((t) => t.active)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map((t) => {
      const c = s.completions.find((c) => c.task_id === t.id && c.date === date);
      return {
        id: t.id,
        label: t.label,
        completed: !!c,
        completed_at: c?.completed_at ?? null,
      };
    });

  const note = s.notes.find((n) => n.date === date);
  return {
    date,
    tasks,
    note: note?.body ?? "",
    note_updated_at: note?.updated_at ?? null,
  };
}

router.get("/:date", (req, res) => {
  const date = req.params.date;
  if (!validDate(date)) return res.status(400).json({ error: "invalid date" });
  res.json(dayPayload(date));
});

router.post("/:date/toggle", (req, res) => {
  const date = req.params.date;
  if (!validDate(date)) return res.status(400).json({ error: "invalid date" });
  const { task_id } = req.body as { task_id?: number };
  if (!task_id) return res.status(400).json({ error: "task_id required" });

  update((s) => {
    const idx = s.completions.findIndex((c) => c.task_id === task_id && c.date === date);
    if (idx >= 0) {
      s.completions.splice(idx, 1);
    } else {
      s.completions.push({ task_id, date, completed_at: nowIso() });
    }
  });

  res.json(dayPayload(date));
});

router.put("/:date/note", (req, res) => {
  const date = req.params.date;
  if (!validDate(date)) return res.status(400).json({ error: "invalid date" });
  const { body } = req.body as { body?: string };
  const text = (body ?? "").toString();

  update((s) => {
    const existing = s.notes.find((n) => n.date === date);
    if (existing) {
      existing.body = text;
      existing.updated_at = nowIso();
    } else {
      s.notes.push({ date, body: text, updated_at: nowIso() });
    }
  });

  res.json(dayPayload(date));
});

router.get("/", (_req, res) => {
  const s = read();
  const total_tasks = s.tasks.filter((t) => t.active).length;
  const dates = new Set<string>([
    ...s.completions.map((c) => c.date),
    ...s.notes.map((n) => n.date),
  ]);
  const rows = Array.from(dates)
    .sort()
    .reverse()
    .map((date) => ({
      date,
      completed_count: s.completions.filter((c) => c.date === date).length,
      total_tasks,
      note: s.notes.find((n) => n.date === date)?.body ?? null,
    }));
  res.json(rows);
});

export default router;
