import { motion } from "framer-motion";
import { useRef } from "react";
import type { Piece } from "../domain/Piece";
import { PieceView } from "./PieceView";
import { TRAY_CELL_PX, CELL_PX } from "./sizing";
import { gridCellAtPoint } from "./dropTargets";
import { useGameStore } from "../store/gameStore";

/**
 * A piece in the tray that can be picked up and dragged onto the grid.
 *
 * During the drag, the piece visually scales up to the grid's cell size
 * (CELL_PX) so the kid sees the same piece size as it will be on the grid.
 * The hot-spot is the (0,0) cell - its top-left corner tracks the pointer.
 *
 * On drop we ask dropTargets.ts which grid cell the (0,0) corner is over and
 * dispatch placePieceAt. If the placement is illegal, the store appends a
 * warning message and the piece snaps back via dragSnapToOrigin.
 */
export function DraggablePiece({ piece }: { piece: Piece }) {
  const placePieceAt = useGameStore((s) => s.placePieceAt);
  const submitted = useGameStore((s) => s.submitted);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      drag={!submitted}
      dragSnapToOrigin
      dragMomentum={false}
      whileTap={{ scale: 1.02 }}
      whileDrag={{ scale: CELL_PX / TRAY_CELL_PX, zIndex: 50, filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.4))" }}
      onDragEnd={(_, info) => {
        const dropCell = gridCellAtPoint(info.point.x, info.point.y);
        if (!dropCell) return;
        placePieceAt(piece.id, dropCell.col, dropCell.row);
      }}
      style={{ touchAction: "none", cursor: submitted ? "default" : "grab" }}
      className="select-none"
    >
      {/* Colors are SHOWN in the tray now. Hiding them was forcing the student
          to drag pieces around until something stuck, which is the opposite of
          thinking about the ratio. With the color-match constraint relaxed
          (any color may meet any color as long as box counts hit a rule ratio),
          showing colors gives the student a hint about WHICH ratio applied
          when the puzzle was generated — useful but not load-bearing. The
          adjacency glow on the grid still highlights empty cells next to
          placed colored sides. */}
      <PieceView piece={piece} cellPx={TRAY_CELL_PX} showCount />
    </motion.div>
  );
}
