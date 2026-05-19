import { Fraction } from "./Fraction";

/**
 * A draggable fraction piece. Each piece is one unit fraction (1/n) that visually
 * occupies that share of a Bar's width.
 *
 * The id is stable per fraction (e.g. id="quarter" for every 1/4) so the tray UI
 * doesn't need to track instances - the kid drags one out, it animates back, the
 * tray re-renders the same id-keyed slot. Placed pieces get a separate instanceId
 * in Bar.ts so React can tell two consecutive 1/4 placements apart.
 */
export interface Piece {
  readonly id: string;
  readonly label: string;
  readonly fraction: Fraction;
  readonly color: string;
}

export const PIECES: readonly Piece[] = [
  { id: "half", label: "1/2", fraction: new Fraction(1, 2), color: "bg-amber-400" },
  { id: "third", label: "1/3", fraction: new Fraction(1, 3), color: "bg-rose-400" },
  { id: "quarter", label: "1/4", fraction: new Fraction(1, 4), color: "bg-sky-400" },
  { id: "sixth", label: "1/6", fraction: new Fraction(1, 6), color: "bg-emerald-400" },
];

export function pieceById(id: string): Piece {
  const p = PIECES.find((piece) => piece.id === id);
  if (!p) {
    throw new Error(
      `Unknown piece id "${id}". Available: ${PIECES.map((x) => x.id).join(", ")}. ` +
        `Bug: a UI component referenced a piece id that does not exist in PIECES. ` +
        `Likely a typo in lesson script or in a drop handler.`,
    );
  }
  return p;
}
