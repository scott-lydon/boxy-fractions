import { useState } from "react";

/**
 * Inline how-to-play. Defaults to OPEN on first load so the user can see what
 * they are looking at; collapses with one tap. Persists collapsed-state via
 * useState (does not need to survive page reloads, since a returning user has
 * already learned the rules).
 */
export function HowToPlay() {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full max-w-3xl bg-slate-900/70 border border-slate-700 rounded-md">
      <button
        className="w-full px-4 py-2 flex items-center justify-between text-left text-amber-400 font-semibold text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>How to play</span>
        <span className="text-slate-500 text-xs">{open ? "hide" : "show"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-slate-300 text-sm leading-relaxed space-y-2">
          <p>
            <span className="text-amber-400 font-semibold">1. The grid.</span> One{" "}
            <span className="text-amber-400">anchor</span> piece (orange outline) is already placed for you.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">2. The pieces.</span> Each piece is an irregular shape. The
            number in the middle is its <em>square count</em>. The colored triangles on a cell's sides are the colors
            that piece exposes on those sides.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">3. The rules.</span> Each color has a fraction in the rules
            panel. Top number is the placed piece's square count, bottom number is the new piece's. Equivalent ratios
            also satisfy (so 2/5 is the same rule as 4/10).
          </p>
          <p>
            <span className="text-amber-400 font-semibold">4. To place.</span> Drag a piece from the Parts tray onto
            the grid. When your piece touches another piece across a colored side, both sides must show the same
            color AND the two pieces' counts must satisfy that color's rule.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">5. To undo.</span> Tap a placed piece to remove it. Anchors
            can't be removed.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">6. Finish.</span> Hit <em>Submit</em> to score (filled
            percentage). <em>Reveal answer</em> shows one valid solution. <em>New round</em> rerolls.
          </p>
        </div>
      )}
    </div>
  );
}
