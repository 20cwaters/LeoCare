import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import Today from "./pages/Today";
import History from "./pages/History";
import DayDetail from "./pages/DayDetail";
import TasksAdmin from "./pages/TasksAdmin";
import About from "./pages/About";

export default function App() {
  return (
    <div className="min-h-full flex flex-col max-w-md mx-auto">
      <header className="px-4 pt-5 pb-3 bg-brand-600 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">Leo Care</h1>
            <p className="text-xs text-brand-100">Daily checklist for Leo</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/day/:date" element={<DayDetail />} />
          <Route path="/tasks" element={<TasksAdmin />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-stone-200 grid grid-cols-4 text-center text-sm">
        <Tab to="/" label="Today" icon="✅" />
        <Tab to="/history" label="History" icon="📅" />
        <Tab to="/about" label="About Leo" icon="🐶" />
        <Tab to="/tasks" label="Tasks" icon="⚙️" />
      </nav>
    </div>
  );
}

function Tab({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `py-3 ${isActive ? "text-brand-700 font-semibold" : "text-stone-500"}`
      }
    >
      <div className="text-lg leading-none">{icon}</div>
      <div className="text-[11px] mt-0.5">{label}</div>
    </NavLink>
  );
}
