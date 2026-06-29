import { type Day } from "../lib/api";

export default function Checklist({
  day,
  onToggle,
  readOnly = false,
}: {
  day: Day;
  onToggle?: (taskId: number) => void | Promise<void>;
  readOnly?: boolean;
}) {
  if (day.tasks.length === 0) {
    return (
      <p className="text-sm text-stone-500 bg-stone-100 rounded-lg p-4">
        No tasks yet. Add some on the Tasks tab.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {day.tasks.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => onToggle?.(t.id)}
            className={`w-full text-left flex items-center gap-3 px-4 py-4 rounded-xl border transition active:scale-[0.99] ${
              t.completed
                ? "bg-emerald-50 border-emerald-300"
                : "bg-white border-stone-200"
            } ${readOnly ? "opacity-90 cursor-default" : "cursor-pointer"}`}
          >
            <span
              className={`flex-none w-7 h-7 rounded-full border-2 flex items-center justify-center text-white ${
                t.completed ? "bg-emerald-500 border-emerald-500" : "border-stone-300 bg-white"
              }`}
            >
              {t.completed ? "✓" : ""}
            </span>
            <span className="flex-1">
              <span
                className={`block font-medium ${
                  t.completed ? "text-stone-500 line-through" : "text-stone-800"
                }`}
              >
                {t.label}
              </span>
              {t.completed && t.completed_at && (
                <span className="block text-xs text-emerald-700 mt-0.5">
                  Done at {formatTime(t.completed_at)}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatTime(iso: string): string {
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
