import { useGameStore } from "../store/gameStore";

export function Toolbar() {
  const newRound = useGameStore((s) => s.newRound);
  const revealSolution = useGameStore((s) => s.revealSolution);
  const submit = useGameStore((s) => s.submit);
  const submitted = useGameStore((s) => s.submitted);
  const score = useGameStore((s) => s.score);
  const revealed = useGameStore((s) => s.revealedSolution);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => newRound()}
        className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
        style={{
          background: "linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%)",
          color: "#0a0e1a",
          boxShadow: "0 6px 16px rgba(245,158,11,0.25)",
        }}
      >
        New round
      </button>
      <button
        onClick={() => submit()}
        disabled={submitted || revealed}
        className="px-5 py-2 rounded-full text-sm font-medium border transition-colors disabled:opacity-40"
        style={{
          background: "rgba(30, 41, 59, 0.5)",
          borderColor: "rgba(148, 163, 184, 0.25)",
          color: "#e2e8f0",
        }}
      >
        Submit
      </button>
      <button
        onClick={() => revealSolution()}
        disabled={revealed}
        className="px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-40"
        style={{
          color: "#94a3b8",
        }}
      >
        Reveal answer
      </button>
      {submitted && (
        <div
          className="px-4 py-1.5 rounded-full text-sm font-semibold tabular-nums"
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            color: "#fcd34d",
          }}
        >
          {score}%
        </div>
      )}
    </div>
  );
}
