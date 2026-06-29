import { useEffect, useRef, useState } from "react";
import { api, type About as AboutType } from "../lib/api";

export default function About() {
  const [about, setAbout] = useState<AboutType | null>(null);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSaved = useRef("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    api.getAbout().then((a) => {
      setAbout(a);
      setBody(a.body);
      lastSaved.current = a.body;
    });
  }, []);

  useEffect(() => {
    if (about === null) return;
    if (body === lastSaved.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      setStatus("saving");
      const next = await api.saveAbout(body);
      lastSaved.current = body;
      setAbout(next);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1200);
    }, 700);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [body, about]);

  if (about === null) return <p className="text-stone-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <section>
        <h2 className="text-lg font-bold text-stone-800">About Leo</h2>
        <p className="text-sm text-stone-500">
          Standing info for whoever is watching Leo — feeding, walks, vet, quirks. Saves automatically.
        </p>
      </section>

      <div className="flex items-baseline justify-between">
        <span className="text-xs text-stone-500">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "idle" && about.updated_at && `Updated ${formatWhen(about.updated_at)}`}
          {status === "idle" && !about.updated_at && "Not edited yet"}
        </span>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={20}
        className="w-full rounded-xl border border-stone-200 bg-white p-3 text-stone-800 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
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
