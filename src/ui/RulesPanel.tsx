import { useGameStore } from "../store/gameStore";
import { RULE_COLOR_FILL } from "../domain/Rule";

/**
 * The rule legend. For each rule, shows a swatch of the rule's color plus the
 * fraction ("placed / new"). Per the hand-sketched concept, the numerator means
 * "of the placed block" and the denominator means "of the new block".
 */
export function RulesPanel() {
  const rules = useGameStore((s) => s.round.rules);
  if (rules.length === 0) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md p-4 w-full">
      <div className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-semibold">
        Rules
      </div>
      <div className="text-slate-500 text-[11px] mb-3 leading-snug">
        For each color, the top number is the placed piece's square count, and
        the bottom number is the new piece's. Equivalent ratios also satisfy.
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rules.map((r) => (
          <div key={r.color} className="flex items-center gap-3 bg-slate-800/50 rounded p-2">
            <div
              className="w-7 h-7 rounded"
              style={{ background: RULE_COLOR_FILL[r.color] }}
              aria-label={r.color}
            />
            <div className="text-slate-100 text-xl font-extrabold leading-none">
              <div className="border-b border-slate-100 pb-0.5">{r.fraction.numerator}</div>
              <div className="pt-0.5">{r.fraction.denominator}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
