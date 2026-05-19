import { useEffect, useRef } from "react";
import { Bar as BarData } from "../domain/Bar";
import { useGameStore } from "../store/gameStore";
import { BAR_WIDTH_PX } from "./sizing";
import { clearBarRect, setBarRect } from "./barRects";
import { motion, AnimatePresence } from "framer-motion";

/**
 * One horizontal "fraction box" with stacked pieces left-to-right.
 *
 * - Registers its DOMRect in the barRects module so the drag-end handler in
 *   DraggablePiece can find it.
 * - Animates pieces in via Framer's AnimatePresence so the kid sees the piece
 *   land, not just appear.
 * - Tap the label area on the left to clear the bar.
 */
export function BarRow({
  label,
  barIndex,
  bar,
}: {
  label: string;
  barIndex: number;
  bar: BarData;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clearBar = useGameStore((s) => s.clearBar);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setBarRect(barIndex, {
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    // Re-measure once after fonts/layout settle.
    const t = setTimeout(update, 100);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      clearBarRect(barIndex);
    };
  }, [barIndex]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => clearBar(barIndex)}
        className="text-slate-400 hover:text-amber-400 active:text-amber-300 text-xs uppercase tracking-wider w-14 text-left font-semibold"
        aria-label={`Clear ${label}`}
      >
        Clear
      </button>
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs font-semibold w-10">{label}</span>
        <div
          ref={ref}
          className="bg-slate-800 border-2 border-slate-700 rounded-md h-14 flex overflow-hidden relative"
          style={{ width: BAR_WIDTH_PX }}
        >
          <AnimatePresence initial={false}>
            {bar.placed.map((p) => (
              <motion.div
                key={p.instanceId}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className={`${p.piece.color} h-full flex items-center justify-center text-slate-900 font-bold text-base border-r border-slate-900/30`}
                style={{ width: BAR_WIDTH_PX * p.piece.fraction.valueAsDecimal() }}
              >
                {p.piece.label}
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Tick marks every 1/12 for subtle grid feel */}
          <div className="absolute inset-0 pointer-events-none flex">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className="border-r border-slate-700/30 h-full"
                style={{ width: BAR_WIDTH_PX / 12 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
