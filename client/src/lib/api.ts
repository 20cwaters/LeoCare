export type Task = { id: number; label: string; sort_order?: number; active?: number };
export type DayTask = { id: number; label: string; completed: boolean; completed_at: string | null };
export type Day = {
  date: string;
  tasks: DayTask[];
  note: string;
  note_updated_at: string | null;
};
export type DaySummary = {
  date: string;
  completed_count: number;
  total_tasks: number;
  note: string | null;
};
export type About = { body: string; updated_at: string | null };
export type Media = {
  id: string;
  date: string;
  filename: string;
  mime: string;
  size: number;
  uploaded_at: string;
};

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  getDay: (date: string) => req<Day>(`/api/days/${date}`),
  toggleTask: (date: string, task_id: number) =>
    req<Day>(`/api/days/${date}/toggle`, {
      method: "POST",
      body: JSON.stringify({ task_id }),
    }),
  saveNote: (date: string, body: string) =>
    req<Day>(`/api/days/${date}/note`, {
      method: "PUT",
      body: JSON.stringify({ body }),
    }),
  getHistory: () => req<DaySummary[]>(`/api/days`),
  getTasks: () => req<Task[]>(`/api/tasks`),
  addTask: (label: string) =>
    req<Task>(`/api/tasks`, { method: "POST", body: JSON.stringify({ label }) }),
  updateTask: (id: number, patch: Partial<Pick<Task, "label" | "sort_order"> & { active: boolean }>) =>
    req<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteTask: (id: number) => req<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }),
  getAbout: () => req<About>(`/api/about`),
  saveAbout: (body: string) =>
    req<About>(`/api/about`, { method: "PUT", body: JSON.stringify({ body }) }),
  getMedia: (date: string) => req<Media[]>(`/api/media/${date}`),
  uploadMedia: async (date: string, files: FileList | File[]) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    const res = await fetch(`/api/media/${date}`, { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || "upload failed");
    }
    return (await res.json()) as { media: Media[] };
  },
  deleteMedia: (date: string, id: string) =>
    req<{ ok: true }>(`/api/media/${date}/${id}`, { method: "DELETE" }),
  reset: () => req<{ ok: true }>(`/api/reset`, { method: "POST" }),
};

export function mediaUrl(m: Media): string {
  return `/media/${m.date}/${m.filename}`;
}

export function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, opts);
}
