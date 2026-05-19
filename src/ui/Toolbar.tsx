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
        className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow"
      >
        New round
      </button>
      <button
        onClick={() => submit()}
        disabled={submitted || revealed}
        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-full font-bold text-sm shadow"
      >
        Submit
      </button>
      <button
        onClick={() => revealSolution()}
        disabled={revealed}
        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-full text-sm border border-slate-600"
      >
        Reveal answer
      </button>
      {submitted && (
        <div className="ml-auto bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-full text-sm font-bold">
          Score: {score}%
        </div>
      )}
    </div>
  );
}
