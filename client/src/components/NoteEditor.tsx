import { useEffect, useRef, useState } from "react";

export default function NoteEditor({
  initial,
  updatedAt,
  onSave,
  readOnly = false,
}: {
  initial: string;
  updatedAt: string | null;
  onSave?: (body: string) => Promise<void> | void;
  readOnly?: boolean;
}) {
  const [body, setBody] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSaved = useRef(initial);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setBody(initial);
    lastSaved.current = initial;
  }, [initial]);

  useEffect(() => {
    if (readOnly || !onSave) return;
    if (body === lastSaved.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      setStatus("saving");
      await onSave(body);
      lastSaved.current = body;
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1200);
    }, 700);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [body, onSave, readOnly]);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-semibold text-stone-700">Notes</label>
        <span className="text-xs text-stone-500">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "idle" && updatedAt && `Updated ${formatWhen(updatedAt)}`}
        </span>
      </div>
      <textarea
        value={body}
        readOnly={readOnly}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Anything Casey & his wife should know? E.g. 'Leo seemed extra tired today, ate everything.'"
        rows={6}
        className="w-full rounded-xl border border-stone-200 bg-white p-3 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </section>
  );
}

function formatWhen(iso: string): string {
  const dt = new Date(iso);
  return dt.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
