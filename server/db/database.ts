import fs from "fs";
import path from "path";

const DEFAULT_DB = path.resolve(__dirname, "../../data/leocare.json");
const dbPath = process.env.LEOCARE_DB_PATH || DEFAULT_DB;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export type Task = { id: number; label: string; sort_order: number; active: boolean };
export type Completion = { task_id: number; date: string; completed_at: string };
export type Note = { date: string; body: string; updated_at: string };

type Store = {
  next_task_id: number;
  tasks: Task[];
  completions: Completion[];
  notes: Note[];
};

const DEFAULT_TASKS = [
  "Morning feeding (breakfast)",
  "Morning walk",
  "Fresh water",
  "Midday potty break",
  "Playtime / enrichment",
  "Evening feeding (dinner)",
  "Evening walk",
];

function emptyStore(): Store {
  const tasks: Task[] = DEFAULT_TASKS.map((label, i) => ({
    id: i + 1,
    label,
    sort_order: i,
    active: true,
  }));
  return {
    next_task_id: tasks.length + 1,
    tasks,
    completions: [],
    notes: [],
  };
}

function load(): Store {
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const initial = emptyStore();
    save(initial);
    return initial;
  }
}

function save(s: Store) {
  const tmp = dbPath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, dbPath);
}

let store: Store = load();

export function read(): Store {
  return store;
}

export function update(mutator: (s: Store) => void): Store {
  mutator(store);
  save(store);
  return store;
}

export function nowIso(): string {
  return new Date().toISOString();
}
