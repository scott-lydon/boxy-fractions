import { motion } from "framer-motion";
import type { Piece } from "../domain/Piece";
import { pieceWidthPx } from "./sizing";

/**
 * A single draggable fraction piece in the tray. Uses Framer Motion's drag
 * with snap-back-to-origin so the tray never empties - dragging is purely a
 * "place a piece" gesture, not "consume a piece."
 *
 * Touch support: Framer Motion handles pointer events natively, which means
 * mouse on desktop and touch on iPad Safari work with the same code path. We
 * do NOT use HTML5 drag-and-drop because iOS Safari support is broken for
 * non-image draggables.
 */
export function DraggablePiece({
  piece,
  onDropAt,
}: {
  piece: Piece;
  onDropAt: (x: number, y: number) => void;
}) {
  const width = pieceWidthPx(piece.fraction.valueAsDecimal());
  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragMomentum={false}
      whileTap={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, zIndex: 50, boxShadow: "0 12px 24px rgba(0,0,0,0.5)" }}
      onDragEnd={(_, info) => onDropAt(info.point.x, info.point.y)}
      className={[
        piece.color,
        "h-14 rounded-md flex items-center justify-center",
        "text-slate-900 font-bold text-lg",
        "cursor-grab active:cursor-grabbing",
        "shadow-md border-2 border-slate-900/20",
        "select-none",
      ].join(" ")}
      style={{ width, touchAction: "none" }}
    >
      {piece.label}
    </motion.div>
  );
}
