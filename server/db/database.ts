import fs from "fs";
import path from "path";

const DEFAULT_DB = path.resolve(__dirname, "../../data/leocare.json");
const dbPath = process.env.LEOCARE_DB_PATH || DEFAULT_DB;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export type Task = { id: number; label: string; sort_order: number; active: boolean };
export type Completion = { task_id: number; date: string; completed_at: string };
export type Note = { date: string; body: string; updated_at: string };
export type Media = {
  id: string;
  date: string;
  filename: string;
  mime: string;
  size: number;
  uploaded_at: string;
};

type Store = {
  next_task_id: number;
  tasks: Task[];
  completions: Completion[];
  notes: Note[];
  media: Media[];
  about: { body: string; updated_at: string | null };
};

export const uploadsDir = path.join(path.dirname(dbPath), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

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
    media: [],
    about: { body: DEFAULT_ABOUT, updated_at: null },
  };
}

const DEFAULT_ABOUT = `Feeding
- Breakfast: 1 cup kibble around 7am
- Dinner: 1 cup kibble around 6pm
- Treats okay in moderation, but no people food

Walks
- Loves long morning walks
- Skip the dog park if it's crowded

Health
- No allergies or medications
- Vet: <name + phone>

Quirks
- Scared of thunder — comfort him if a storm rolls in
- Will eat anything off the counter, don't leave food out
`;

function load(): Store {
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      next_task_id: parsed.next_task_id ?? 1,
      tasks: parsed.tasks ?? [],
      completions: parsed.completions ?? [],
      notes: parsed.notes ?? [],
      media: parsed.media ?? [],
      about: parsed.about ?? { body: DEFAULT_ABOUT, updated_at: null },
    };
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
