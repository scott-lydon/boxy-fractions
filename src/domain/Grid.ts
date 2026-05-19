import type { Piece } from "./Piece";
import { sideDelta, type Side } from "./Polyomino";
import type { Rule } from "./Rule";
import { ruleSatisfied } from "./Rule";

/**
 * A placement of a Piece on the grid: the piece, the grid-coords of its (0,0)
 * cell, and a unique placement id so the UI can track instances across rerenders.
 */
export interface Placement {
  readonly placementId: string;
  readonly piece: Piece;
  readonly origin: { col: number; row: number };
  readonly anchor: boolean; // true if this was a starting placement, not placed by the kid
}

/**
 * Immutable grid state. Tracks placements (anchor + kid-placed). Out-of-band
 * lookups (cellOccupier(col, row), canPlace(...), withPlacement(...)) avoid
 * exposing the placements array directly so callers don't accidentally mutate.
 */
export class Grid {
  readonly cols: number;
  readonly rows: number;
  readonly placements: readonly Placement[];

  constructor(cols: number, rows: number, placements: readonly Placement[] = []) {
    if (!Number.isInteger(cols) || cols <= 0 || !Number.isInteger(rows) || rows <= 0) {
      throw new Error(
        `Grid requires positive integer dimensions, got cols=${cols}, rows=${rows}. ` +
          `Bug: the round generator passed bad dimensions, or a default value leaked through.`,
      );
    }
    this.cols = cols;
    this.rows = rows;
    this.placements = placements;
  }

  /** Returns the placement that occupies (col, row), or null if empty / out of bounds. */
  cellOccupier(col: number, row: number): Placement | null {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null;
    for (const p of this.placements) {
      for (const c of p.piece.polyomino.cells) {
        if (p.origin.col + c.col === col && p.origin.row + c.row === row) return p;
      }
    }
    return null;
  }

  /**
   * Returns the cells (in absolute grid coords) that a candidate placement
   * of `piece` at `origin` would occupy.
   */
  static cellsFor(piece: Piece, origin: { col: number; row: number }): { col: number; row: number }[] {
    return piece.polyomino.cells.map((c) => ({ col: origin.col + c.col, row: origin.row + c.row }));
  }

  /**
   * Test whether a piece can be placed at origin. Returns a structured result
   * so the UI can give targeted feedback ("you went off the board", "you're on
   * top of another piece", "the green side of this piece must touch a piece of 5 squares").
   */
  canPlace(
    piece: Piece,
    origin: { col: number; row: number },
    rules: readonly Rule[],
  ):
    | { ok: true }
    | { ok: false; reason: "out_of_bounds" }
    | { ok: false; reason: "overlap"; col: number; row: number }
    | {
        ok: false;
        reason: "no_adjacency";
      }
    | {
        ok: false;
        reason: "color_mismatch";
        col: number;
        row: number;
        side: Side;
      }
    | {
        ok: false;
        reason: "rule_mismatch";
        color: string;
        placedCount: number;
        newCount: number;
      } {
    const cells = Grid.cellsFor(piece, origin);
    // 1. In bounds and not overlapping.
    for (const cell of cells) {
      if (cell.col < 0 || cell.row < 0 || cell.col >= this.cols || cell.row >= this.rows) {
        return { ok: false, reason: "out_of_bounds" };
      }
      const occ = this.cellOccupier(cell.col, cell.row);
      if (occ) {
        return { ok: false, reason: "overlap", col: cell.col, row: cell.row };
      }
    }

    // 2. For each external side that faces another placement, the colors must
    //    match (both sides of the shared edge agree on which rule applies) AND
    //    the rule must be satisfied by the two pieces' square counts.
    let touchedSomething = false;
    for (const cell of piece.polyomino.cells) {
      const absCol = origin.col + cell.col;
      const absRow = origin.row + cell.row;
      // For each of the 4 sides of this cell, look at the neighbor in the grid.
      const sides: Side[] = ["N", "E", "S", "W"];
      for (const side of sides) {
        const newColor = piece.colorOn(cell.col, cell.row, side);
        const { dcol, drow } = sideDelta(side);
        const neighbor = this.cellOccupier(absCol + dcol, absRow + drow);
        if (!neighbor) continue;
        touchedSomething = true;
        // Find the matching cell in the neighbor placement so we can ask its color
        // on the opposite side.
        const neighborLocalCol = absCol + dcol - neighbor.origin.col;
        const neighborLocalRow = absRow + drow - neighbor.origin.row;
        const oppositeSide: Side = side === "N" ? "S" : side === "S" ? "N" : side === "E" ? "W" : "E";
        const neighborColor = neighbor.piece.colorOn(neighborLocalCol, neighborLocalRow, oppositeSide);
        if (!newColor || !neighborColor) {
          // One side has no color, the other does -> mismatch.
          if (newColor || neighborColor) {
            return { ok: false, reason: "color_mismatch", col: absCol, row: absRow, side };
          }
          // both null = no rule on this edge; that's fine.
          continue;
        }
        if (newColor !== neighborColor) {
          return { ok: false, reason: "color_mismatch", col: absCol, row: absRow, side };
        }
        // Find the rule.
        const rule = rules.find((r) => r.color === newColor);
        if (!rule) {
          throw new Error(
            `Edge between (${absCol},${absRow}) and its ${side} neighbor is colored "${newColor}" but no Rule exists for that color. ` +
              `Bug: a piece was painted with a color that has no rule entry. Check the generator's color-to-rule alignment.`,
          );
        }
        if (
          !ruleSatisfied(rule, neighbor.piece.squareCount, piece.squareCount) &&
          !ruleSatisfied(rule, piece.squareCount, neighbor.piece.squareCount)
        ) {
          return {
            ok: false,
            reason: "rule_mismatch",
            color: newColor,
            placedCount: neighbor.piece.squareCount,
            newCount: piece.squareCount,
          };
        }
      }
    }

    // 3. The piece must touch at least one existing piece (we don't allow
    //    floating placements; this also keeps the rules from being trivially
    //    avoidable).
    if (!touchedSomething && this.placements.length > 0) {
      return { ok: false, reason: "no_adjacency" };
    }

    return { ok: true };
  }

  withPlacement(p: Placement): Grid {
    return new Grid(this.cols, this.rows, [...this.placements, p]);
  }

  withoutPlacement(placementId: string): Grid {
    return new Grid(
      this.cols,
      this.rows,
      this.placements.filter((p) => p.placementId !== placementId),
    );
  }

  /** Percentage of cells covered, [0, 1]. */
  fillRatio(): number {
    let filled = 0;
    for (const p of this.placements) filled += p.piece.squareCount;
    return filled / (this.cols * this.rows);
  }
}
