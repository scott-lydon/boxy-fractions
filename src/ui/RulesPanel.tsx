import { useGameStore } from "../store/gameStore";
import { RULE_COLOR_FILL } from "../domain/Rule";

/**
 * Rules legend.
 *
 * Each rule is a color + a "smaller box count : larger box count" ratio.
 * When two pieces touch each other, the smaller piece's box count over the
 * larger piece's box count must match this ratio (or an equivalent like
 * 6:10 for 3:5).
 *
 * The original wording was "placed count over new count" which sounded like
 * an ordered division, so a player would multiply / divide trying to reach
 * the number on screen. That was wrong: the rule is a ratio of squares, not
 * a division of any one piece's count by another. This panel now names the
 * two terms explicitly so the math is obvious.
 */
export function RulesPanel() {
  const rules = useGameStore((s) => s.round.rules);
  if (rules.length === 0) return null;
  return (
    <div
      className="rounded-2xl p-5 w-full"
      style={{
        background: "rgba(31, 41, 55, 0.45)",
        backdropFilter: "blur(6px)",
        boxShadow: "inset 0 0 0 1px rgba(212, 200, 178, 0.10)",
      }}
    >
      <div
        className="text-xs uppercase tracking-[0.18em] font-semibold mb-2"
        style={{ color: "rgba(212, 200, 178, 0.7)" }}
      >
        Rules
      </div>
      <div className="text-slate-400 text-[11px] mb-1 leading-relaxed">
        When two pieces touch, count their boxes. The
        <span className="text-slate-200"> smaller box count </span>
        over the
        <span className="text-slate-200"> larger box count </span>
        must equal one of these ratios (or an equivalent like 6:10 for 3:5).
      </div>
      <div className="text-slate-500 text-[11px] mb-4 leading-relaxed italic">
        Example: a 3-box piece touching a 5-box piece gives 3:5.
      </div>
      <div className="flex flex-col gap-2.5">
        {rules.map((r) => (
          <div
            key={r.color}
            className="flex items-center gap-4 rounded-xl px-3 py-3"
            style={{
              background: "rgba(20, 27, 41, 0.55)",
              boxShadow: `inset 0 0 0 1px ${RULE_COLOR_FILL[r.color]}40`,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0"
              style={{
                background: RULE_COLOR_FILL[r.color],
                boxShadow: `0 4px 10px ${RULE_COLOR_FILL[r.color]}30`,
              }}
              aria-label={r.color}
            />
            <div className="flex-1 flex items-baseline gap-2 leading-none">
              <div className="flex flex-col text-[10px] uppercase tracking-wider text-slate-500">
                <span>smaller</span>
                <span className="mt-3">larger</span>
              </div>
              <div className="text-slate-100 font-mono">
                <div className="text-2xl font-semibold tabular-nums">{r.fraction.numerator}</div>
                <div
                  className="h-px my-1.5"
                  style={{ background: `${RULE_COLOR_FILL[r.color]}55` }}
                />
                <div className="text-2xl font-semibold tabular-nums">{r.fraction.denominator}</div>
              </div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider ml-1 self-center">
                boxes
                <br />
                boxes
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
