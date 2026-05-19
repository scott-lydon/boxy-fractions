import { useGameStore } from "../store/gameStore";
import { DraggablePiece } from "./DraggablePiece";

export function Tray() {
  const round = useGameStore((s) => s.round);
  const trayPieceIds = useGameStore((s) => s.trayPieceIds);

  // Build a stable mapping from id to piece.
  const idToPiece = new Map(round.trayPieces.map((p) => [p.id, p]));
  const pieces = trayPieceIds.map((id) => idToPiece.get(id)).filter((p) => p !== undefined);

  if (pieces.length === 0) {
    return (
      <div className="border border-dashed border-slate-700 rounded-md p-6 text-center text-slate-500 text-sm">
        Tray is empty. Hit Submit to score or New Round for a new puzzle.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md p-4">
      <div className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-semibold">
        Parts ({pieces.length})
      </div>
      <div className="flex flex-wrap gap-5 items-start">
        {pieces.map((p) => (
          <DraggablePiece key={p!.id} piece={p!} />
        ))}
      </div>
    </div>
  );
}
