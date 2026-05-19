import { useGameStore } from "../store/gameStore";
import { DraggablePiece } from "./DraggablePiece";
import { findBarAtPoint } from "./barRects";

export function Tray() {
  const pieces = useGameStore((s) => s.availablePieces());
  const placePieceOnBar = useGameStore((s) => s.placePieceOnBar);

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
