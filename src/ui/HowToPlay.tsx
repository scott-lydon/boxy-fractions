import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RULE_COLOR_FILL } from "../domain/Rule";

/**
 * Inline how-to-play, paged. One idea per card. The kid steps forward through
 * five short cards instead of reading a wall of text. Lives at the bottom of
 * the play column so it does not compete with the grid for attention.
 */
export function HowToPlay() {
  const [page, setPage] = useState(0);
  const total = PAGES.length;

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
      <div className="px-6 py-4 border-b border-slate-800/40 flex items-center justify-between">
        <div className="text-amber-300/90 font-semibold text-sm uppercase tracking-[0.18em]">
          How to play
        </div>
        <div className="text-slate-500 text-xs font-mono">
          {page + 1} / {total}
        </div>
      </div>
      <div className="px-6 py-6 min-h-[180px] relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {PAGES[page]}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="px-6 py-4 border-t border-slate-800/40 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="text-slate-400 hover:text-slate-200 disabled:opacity-30 text-sm"
        >
          ← Back
        </button>
        <div className="flex gap-1.5">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                background: i === page ? "#fcd34d" : "rgba(148,163,184,0.25)",
              }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={page === total - 1}
          className="text-slate-200 hover:text-amber-300 disabled:opacity-30 text-sm font-semibold"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const PAGES: React.ReactNode[] = [
  <div key="goal">
    <h3 className="text-slate-100 text-lg font-semibold mb-2">Fill the grid</h3>
    <p className="text-slate-400 text-sm leading-relaxed">
      The grid starts with one piece already placed. Drag pieces from the tray to
      cover as many cells as you can. The grid intentionally has gaps; you do not
      need to fill it perfectly.
    </p>
  </div>,

  <div key="pieces">
    <h3 className="text-slate-100 text-lg font-semibold mb-2">The tray hides colors</h3>
    <p className="text-slate-400 text-sm leading-relaxed">
      Each tray piece shows its <em>shape</em> and a <em>count</em> (the number in the
      middle). Colors stay hidden until you place the piece, so you cannot shape-match
      the answer. You reason about <em>counts</em> first.
    </p>
  </div>,

  <div key="rules">
    <h3 className="text-slate-100 text-lg font-semibold mb-2">Read the rules</h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-3">
      Each rule is a color and a ratio. Top number is the placed piece's count,
      bottom is the new piece's. So <span className="text-slate-200 font-mono">2/3</span> means:
    </p>
    <div className="flex items-center gap-3 bg-slate-900/60 rounded-lg p-3 border border-slate-800/60">
      <div className="flex flex-col items-center">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <rect x="0" y="0" width="40" height="20" fill="#f5efe3" stroke="rgba(148,163,184,0.4)" />
          <rect x="0" y="20" width="40" height="20" fill="#f5efe3" stroke="rgba(148,163,184,0.4)" />
        </svg>
        <span className="text-slate-500 text-[10px] mt-1">2 squares</span>
      </div>
      <div className="w-2 h-12 rounded" style={{ background: RULE_COLOR_FILL.green, opacity: 0.8 }} />
      <div className="flex flex-col items-center">
        <svg width="40" height="60" viewBox="0 0 40 60">
          <rect x="0" y="0" width="40" height="20" fill="#f5efe3" stroke="rgba(148,163,184,0.4)" />
          <rect x="0" y="20" width="40" height="20" fill="#f5efe3" stroke="rgba(148,163,184,0.4)" />
          <rect x="0" y="40" width="40" height="20" fill="#f5efe3" stroke="rgba(148,163,184,0.4)" />
        </svg>
        <span className="text-slate-500 text-[10px] mt-1">3 squares</span>
      </div>
      <div className="text-slate-300 text-xs leading-snug flex-1">
        A 2-piece touches a 3-piece across a green edge. <span className="text-slate-500">Equivalent ratios work too (4/6, 6/9).</span>
      </div>
    </div>
  </div>,

  <div key="place">
    <h3 className="text-slate-100 text-lg font-semibold mb-2">Place a piece</h3>
    <p className="text-slate-400 text-sm leading-relaxed">
      Drag from the tray and drop on the grid. If the colors and counts line up
      with every neighbor, it sticks. If not, it bounces back and a hint appears.
      Tap any placed piece to remove it; anchors stay.
    </p>
  </div>,

  <div key="hints">
    <h3 className="text-slate-100 text-lg font-semibold mb-2">Follow the glow</h3>
    <p className="text-slate-400 text-sm leading-relaxed">
      Empty cells next to a placed colored side glow softly in that color. That
      glow is your hint: the next piece you place there will need to expose that
      color on the touching side, and its count must satisfy that color's rule.
    </p>
  </div>,
];
