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
};

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
