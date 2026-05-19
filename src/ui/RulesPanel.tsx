import { useGameStore } from "../store/gameStore";
import { RULE_COLOR_FILL } from "../domain/Rule";

/**
 * Quiet rule legend. Soft color tiles, generous padding, one ratio per row.
 * The detailed explanation lives in the "How to play" carousel below the tray.
 */
export function RulesPanel() {
  const rules = useGameStore((s) => s.round.rules);
  if (rules.length === 0) return null;
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-5 w-full">
      <div className="text-amber-300/80 text-xs uppercase tracking-[0.18em] font-semibold mb-4">
        Rules
      </div>
      <div className="text-slate-500 text-[11px] mb-4 leading-relaxed">
        Placed count over new count. Equivalent ratios also work.
      </div>
      <div className="flex flex-col gap-2.5">
        {rules.map((r) => (
          <div
            key={r.color}
            className="flex items-center gap-4 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(15, 23, 42, 0.45)",
              boxShadow: `inset 0 0 0 1px ${RULE_COLOR_FILL[r.color]}33`,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg"
              style={{
                background: RULE_COLOR_FILL[r.color],
                boxShadow: `0 4px 12px ${RULE_COLOR_FILL[r.color]}40`,
              }}
              aria-label={r.color}
            />
            <div className="flex-1 text-slate-100 leading-none font-mono">
              <div className="text-2xl font-semibold tabular-nums">{r.fraction.numerator}</div>
              <div className="h-px my-1.5 bg-slate-700/60" />
              <div className="text-2xl font-semibold tabular-nums">{r.fraction.denominator}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
