import { useState } from "react";
import { api, mediaUrl, type Media } from "../lib/api";

export default function MediaGallery({
  date,
  items,
  readOnly = false,
  onChange,
}: {
  date: string;
  items: Media[];
  readOnly?: boolean;
  onChange?: () => void | Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Media | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      await api.uploadMedia(date, files);
      await onChange?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this?")) return;
    await api.deleteMedia(date, id);
    await onChange?.();
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-stone-700">Photos & videos</h3>
        <span className="text-xs text-stone-500">{items.length}</span>
      </div>

      {!readOnly && (
        <label
          className={`block cursor-pointer text-center rounded-xl border-2 border-dashed p-4 mb-3 transition ${
            uploading ? "border-stone-200 bg-stone-50 text-stone-400" : "border-brand-500 bg-brand-50 text-brand-700"
          }`}
        >
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          <div className="text-2xl">📷</div>
          <div className="text-sm font-semibold mt-1">
            {uploading ? "Uploading…" : "Add photos or video"}
          </div>
          <div className="text-xs mt-0.5 text-stone-500">
            Tap to take a new photo or pick from your library
          </div>
        </label>
      )}

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {items.length === 0 ? (
        readOnly ? (
          <p className="text-xs text-stone-500">No photos this day.</p>
        ) : null
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map((m) => (
            <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100">
              <button
                type="button"
                onClick={() => setLightbox(m)}
                className="w-full h-full block"
              >
                {m.mime.startsWith("video/") ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-stone-900 text-white">
                    <video
                      src={mediaUrl(m)}
                      className="w-full h-full object-cover opacity-80"
                      preload="metadata"
                      muted
                      playsInline
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow">
                      ▶
                    </span>
                  </div>
                ) : (
                  <img
                    src={mediaUrl(m)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
              {!readOnly && (
                <button
                  onClick={() => remove(m.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                  aria-label="Delete"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          {lightbox.mime.startsWith("video/") ? (
            <video
              src={mediaUrl(lightbox)}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={mediaUrl(lightbox)}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}
    </section>
  );
}
