import { useGameStore } from "../store/gameStore";

export function MessagesPanel() {
  const messages = useGameStore((s) => s.messages);
  if (messages.length === 0) return null;
  const latest = messages.slice(-3);
  return (
    <div className="flex flex-col gap-1.5">
      {latest.map((m) => (
        <div
          key={m.id}
          className={
            m.kind === "warn"
              ? "bg-rose-900/30 border border-rose-500/50 text-rose-200 text-sm rounded-md px-3 py-2"
              : m.kind === "win"
                ? "bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 text-sm rounded-md px-3 py-2"
                : "bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2"
          }
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
