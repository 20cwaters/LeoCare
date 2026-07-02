import { useEffect, useState } from "react";
import { api, type Task } from "../lib/api";

export default function TasksAdmin() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [resetting, setResetting] = useState(false);

  const reload = () => api.getTasks().then(setTasks);

  useEffect(() => {
    reload();
  }, []);

  if (!tasks) return <p className="text-stone-500">Loading…</p>;

  async function add() {
    if (!newLabel.trim()) return;
    await api.addTask(newLabel.trim());
    setNewLabel("");
    reload();
  }

  async function move(id: number, dir: -1 | 1) {
    if (!tasks) return;
    const idx = tasks.findIndex((t) => t.id === id);
    const swap = tasks[idx + dir];
    if (!swap) return;
    const a = tasks[idx];
    await api.updateTask(a.id, { sort_order: swap.sort_order ?? 0 });
    await api.updateTask(swap.id, { sort_order: a.sort_order ?? 0 });
    reload();
  }

  async function saveEdit(id: number) {
    if (!editLabel.trim()) return;
    await api.updateTask(id, { label: editLabel.trim() });
    setEditing(null);
    reload();
  }

  async function remove(id: number) {
    if (!confirm("Remove this task from the checklist?")) return;
    await api.deleteTask(id);
    reload();
  }

  async function handleReset() {
    const first = confirm(
      "End of trip reset — this deletes ALL checkmarks, notes, and uploaded photos/videos from every day. Your task list and About Leo will be kept.\n\nContinue?"
    );
    if (!first) return;
    const typed = prompt('Type "reset" to confirm.');
    if (typed?.trim().toLowerCase() !== "reset") return;
    setResetting(true);
    try {
      await api.reset();
      alert("Done. Ready for next trip.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-bold text-stone-800">Daily tasks</h2>
        <p className="text-sm text-stone-500">These show up on the checklist every day.</p>
      </section>

      <section>
        <div className="flex gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a task (e.g. 'Brush teeth')"
            className="flex-1 rounded-xl border border-stone-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={add}
            className="px-4 rounded-xl bg-brand-600 text-white font-semibold active:bg-brand-700"
          >
            Add
          </button>
        </div>
      </section>

      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li
            key={t.id}
            className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-2"
          >
            {editing === t.id ? (
              <>
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(t.id)}
                  className="flex-1 rounded-lg border border-stone-200 p-2"
                  autoFocus
                />
                <button onClick={() => saveEdit(t.id)} className="text-brand-700 font-semibold px-2">
                  Save
                </button>
                <button onClick={() => setEditing(null)} className="text-stone-500 px-2">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <button
                    onClick={() => move(t.id, -1)}
                    disabled={i === 0}
                    className="text-stone-500 disabled:opacity-30 px-1"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(t.id, 1)}
                    disabled={i === tasks.length - 1}
                    className="text-stone-500 disabled:opacity-30 px-1"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>
                <span className="flex-1 text-stone-800">{t.label}</span>
                <button
                  onClick={() => {
                    setEditing(t.id);
                    setEditLabel(t.label);
                  }}
                  className="text-brand-700 px-2"
                >
                  Edit
                </button>
                <button onClick={() => remove(t.id)} className="text-red-600 px-2">
                  Remove
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <section className="pt-6 mt-4 border-t border-stone-200">
        <h3 className="text-sm font-semibold text-stone-700">End of trip</h3>
        <p className="text-xs text-stone-500 mt-1 mb-3">
          When Casey & his wife are back, wipe checkmarks, notes, and uploaded media so the
          app is ready for next time. Task list and About Leo will stay.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold active:bg-red-700 disabled:opacity-60"
        >
          {resetting ? "Resetting…" : "Reset trip data"}
        </button>
      </section>
    </div>
  );
}
