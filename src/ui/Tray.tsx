import { useMemo } from "react";
import { useGameStore } from "../store/gameStore";
import { DraggablePiece } from "./DraggablePiece";
import { findBarAtPoint } from "./barRects";
import { PIECES } from "../domain/Piece";
import { getStage } from "../domain/Lesson";

/**
 * Tray reads the current stage's availablePieceIds (a stable readonly array on
 * the stage constant) and filters PIECES in a useMemo. We deliberately do NOT
 * call any store method that returns a freshly-allocated array on each invocation,
 * because Zustand would see a "new" value every render and trigger an infinite
 * update loop. Lesson learned the hard way - React error #185 in production.
 */
export function Tray() {
  const stage = useGameStore((s) => s.stage);
  const placePieceOnBar = useGameStore((s) => s.placePieceOnBar);
  const pieces = useMemo(() => {
    const ids = getStage(stage).availablePieceIds;
    return PIECES.filter((p) => ids.includes(p.id));
  }, [stage]);

  if (pieces.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-lg p-6 text-center text-slate-500 text-sm">
        Tap a button in the chat to start.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="text-slate-500 text-xs uppercase tracking-wider mb-3 font-semibold">
        Drag a piece onto a bar
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {pieces.map((p) => (
          <DraggablePiece
            key={p.id}
            piece={p}
            onDropAt={(x, y) => {
              const idx = findBarAtPoint(x, y);
              if (idx !== null) placePieceOnBar(p.id, idx);
            }}
          />
        ))}
      </div>
    </div>
  );
}
