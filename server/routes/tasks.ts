import { Router } from "express";
import { read, update } from "../db/database";

const router = Router();

router.get("/", (_req, res) => {
  const s = read();
  const active = s.tasks
    .filter((t) => t.active)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map(({ id, label, sort_order, active }) => ({ id, label, sort_order, active: active ? 1 : 0 }));
  res.json(active);
});

router.post("/", (req, res) => {
  const { label } = req.body as { label?: string };
  if (!label || !label.trim()) return res.status(400).json({ error: "label required" });
  let created: any;
  update((s) => {
    const sort_order = s.tasks.reduce((m, t) => Math.max(m, t.sort_order), -1) + 1;
    const task = { id: s.next_task_id++, label: label.trim(), sort_order, active: true };
    s.tasks.push(task);
    created = task;
  });
  res.json(created);
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { label, sort_order, active } = req.body as {
    label?: string;
    sort_order?: number;
    active?: boolean;
  };
  let updated: any;
  update((s) => {
    const t = s.tasks.find((t) => t.id === id);
    if (!t) return;
    if (label !== undefined) t.label = label.trim();
    if (sort_order !== undefined) t.sort_order = sort_order;
    if (active !== undefined) t.active = active;
    updated = t;
  });
  if (!updated) return res.status(404).json({ error: "not found" });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  update((s) => {
    const t = s.tasks.find((t) => t.id === id);
    if (t) t.active = false;
  });
  res.json({ ok: true });
});

export default router;
