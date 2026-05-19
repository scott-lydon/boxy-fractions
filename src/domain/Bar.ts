import { Fraction } from "./Fraction";
import type { Piece } from "./Piece";

/**
 * One "fraction box" - a horizontal track that represents 1 whole. Pieces stack
 * left-to-right. The bar enforces the invariant that placed pieces sum to <= 1.
 *
 * State is immutable. withPiece() and cleared() return new Bar instances. This
 * makes the store updates pure and lets us reason about equivalence at any
 * snapshot without worrying about mutation.
 */
export interface PlacedPiece {
  /** Unique per placement so React can key two consecutive 1/4 drops separately. */
  readonly instanceId: string;
  readonly piece: Piece;
}

export class Bar {
  readonly placed: readonly PlacedPiece[];

  constructor(placed: readonly PlacedPiece[] = []) {
    this.placed = placed;
  }

  /** Sum of placed pieces, returned as a simplified Fraction. Empty bar -> 0/1. */
  filledFraction(): Fraction {
    if (this.placed.length === 0) return new Fraction(0, 1);
    let num = 0;
    let den = 1;
    for (const p of this.placed) {
      // a/b + c/d = (a*d + c*b) / (b*d)
      num = num * p.piece.fraction.denominator + p.piece.fraction.numerator * den;
      den = den * p.piece.fraction.denominator;
    }
    return new Fraction(num, den).simplified();
  }

  /** True if adding this piece would push the bar past 1 whole. */
  wouldOverflow(piece: Piece): boolean {
    const current = this.filledFraction();
    const cn = current.numerator;
    const cd = current.denominator;
    const pn = piece.fraction.numerator;
    const pd = piece.fraction.denominator;
    // current + piece > 1   <=>   cn*pd + pn*cd > cd*pd
    return cn * pd + pn * cd > cd * pd;
  }

  /** Place a piece. Throws if it would overflow - callers must check wouldOverflow first. */
  withPiece(piece: Piece, instanceId: string): Bar {
    if (this.wouldOverflow(piece)) {
      throw new Error(
        `Cannot place ${piece.label} on bar: current fill is ${this.filledFraction().toString()} ` +
          `and adding ${piece.fraction.toString()} would exceed 1 whole. ` +
          `Bug: callers must check wouldOverflow() before withPiece(). Likely a drop handler ` +
          `bypassed the legality check.`,
      );
    }
    return new Bar([...this.placed, { instanceId, piece }]);
  }

  cleared(): Bar {
    return new Bar([]);
  }
}
