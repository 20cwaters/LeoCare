import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, type DaySummary } from "../lib/api";

export default function History() {
  const [days, setDays] = useState<DaySummary[] | null>(null);

  useEffect(() => {
    api.getHistory().then(setDays);
  }, []);

  if (!days) return <p className="text-stone-500">Loading…</p>;
  if (days.length === 0)
    return (
      <p className="text-sm text-stone-500 bg-stone-100 rounded-lg p-4">
        No history yet. Once items are checked off or notes saved, they'll show up here.
      </p>
    );

  return (
    <ul className="space-y-2">
      {days.map((d) => (
        <li key={d.date}>
          <Link
            to={`/day/${d.date}`}
            className="block bg-white border border-stone-200 rounded-xl p-4 active:scale-[0.99]"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-stone-800">{formatDate(d.date)}</span>
              <span className="text-xs text-stone-500">
                {d.completed_count}/{d.total_tasks} done
              </span>
            </div>
            {d.note && (
              <p className="text-sm text-stone-600 mt-1 line-clamp-2 whitespace-pre-wrap">
                {d.note}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
