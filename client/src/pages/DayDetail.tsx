import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatDate, todayLocal, type Day, type Media } from "../lib/api";
import Checklist from "../components/Checklist";
import NoteEditor from "../components/NoteEditor";
import MediaGallery from "../components/MediaGallery";

export default function DayDetail() {
  const { date = "" } = useParams();
  const [day, setDay] = useState<Day | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const isToday = date === todayLocal();

  useEffect(() => {
    api.getDay(date).then(setDay);
    api.getMedia(date).then(setMedia);
  }, [date]);

  if (!day) return <p className="text-stone-500">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <Link to="/history" className="text-sm text-brand-700">
          ← Back to history
        </Link>
        <h2 className="text-lg font-bold text-stone-800 mt-2">{formatDate(date)}</h2>
        {!isToday && <p className="text-xs text-stone-500">Read-only view of a past day</p>}
      </div>

      <Checklist
        day={day}
        readOnly={!isToday}
        onToggle={
          isToday
            ? async (taskId) => {
                const next = await api.toggleTask(date, taskId);
                setDay(next);
              }
            : undefined
        }
      />

      <NoteEditor
        initial={day.note}
        updatedAt={day.note_updated_at}
        readOnly={!isToday}
        onSave={
          isToday
            ? async (body) => {
                const next = await api.saveNote(date, body);
                setDay(next);
              }
            : undefined
        }
      />

      <MediaGallery
        date={date}
        items={media}
        readOnly={!isToday}
        onChange={async () => setMedia(await api.getMedia(date))}
      />
    </div>
  );
}
