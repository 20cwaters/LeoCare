import { useEffect, useState } from "react";
import { api, todayLocal, formatDate, type Day } from "../lib/api";
import Checklist from "../components/Checklist";
import NoteEditor from "../components/NoteEditor";

export default function Today() {
  const [day, setDay] = useState<Day | null>(null);
  const [error, setError] = useState<string | null>(null);
  const date = todayLocal();

  useEffect(() => {
    api.getDay(date).then(setDay).catch((e) => setError(String(e)));
  }, [date]);

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!day) return <p className="text-stone-500">Loading…</p>;

  const done = day.tasks.filter((t) => t.completed).length;
  const total = day.tasks.length;

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-bold text-stone-800">{formatDate(date)}</h2>
        <p className="text-sm text-stone-500">
          {done} of {total} done
        </p>
      </section>

      <Checklist
        day={day}
        onToggle={async (taskId) => {
          const next = await api.toggleTask(date, taskId);
          setDay(next);
        }}
      />

      <NoteEditor
        initial={day.note}
        updatedAt={day.note_updated_at}
        onSave={async (body) => {
          const next = await api.saveNote(date, body);
          setDay(next);
        }}
      />
    </div>
  );
}
