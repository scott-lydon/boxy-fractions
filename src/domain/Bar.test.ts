import { describe, it, expect } from "vitest";
import { Bar } from "./Bar";
import { pieceById } from "./Piece";
import { Fraction } from "./Fraction";

describe("Bar", () => {
  it("starts empty", () => {
    const bar = new Bar();
    expect(bar.placed.length).toBe(0);
    expect(bar.filledFraction().equivalentTo(new Fraction(0, 1))).toBe(true);
  });

  it("sums placed pieces", () => {
    let bar = new Bar();
    bar = bar.withPiece(pieceById("quarter"), "i1");
    expect(bar.filledFraction().toString()).toBe("1/4");
    bar = bar.withPiece(pieceById("quarter"), "i2");
    expect(bar.filledFraction().equivalentTo(new Fraction(1, 2))).toBe(true);
  });

  it("rejects placements that would overflow", () => {
    let bar = new Bar();
    bar = bar.withPiece(pieceById("half"), "i1");
    bar = bar.withPiece(pieceById("half"), "i2");
    expect(bar.wouldOverflow(pieceById("quarter"))).toBe(true);
    expect(() => bar.withPiece(pieceById("quarter"), "i3")).toThrow(/exceed 1 whole/);
  });

  it("reaches 1/2 with three sixths (the lesson's check_sixths step)", () => {
    let bar = new Bar();
    bar = bar.withPiece(pieceById("sixth"), "i1");
    bar = bar.withPiece(pieceById("sixth"), "i2");
    bar = bar.withPiece(pieceById("sixth"), "i3");
    expect(bar.filledFraction().equivalentTo(new Fraction(1, 2))).toBe(true);
  });

  it("cleared returns an empty bar without mutating", () => {
    let bar = new Bar();
    bar = bar.withPiece(pieceById("half"), "i1");
    const fresh = bar.cleared();
    expect(bar.placed.length).toBe(1);
    expect(fresh.placed.length).toBe(0);
  });
});
