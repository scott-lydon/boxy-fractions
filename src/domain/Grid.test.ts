import { describe, it, expect } from "vitest";
import { Grid, type Placement } from "./Grid";
import { Piece, type SideColorMap } from "./Piece";
import { Polyomino, type Side } from "./Polyomino";
import { Fraction } from "./Fraction";
import type { Rule, RuleColor } from "./Rule";

/**
 * Behavior-shaped tests for the "placed wins" color contract in Grid.canPlace.
 *
 * The bug these tests pin down (from the user, reported four times):
 *
 *   Two 2-box pieces. The placed one shows a purple triangle at the seam.
 *   The new one shows a blue triangle at the same seam. The old check
 *   accepted the placement because 2:2 = 1:1 satisfies the blue rule.
 *   But the placed piece's purple triangle was claiming the seam, and
 *   purple is the 1:2 rule, which 2:2 violates. Under placed-wins, only
 *   the placed neighbor's color picks the rule for that seam.
 *
 * Plus the visual-cleanup half of the design: when colors differ at a seam
 * but the placed-side rule IS satisfied, the placement goes through with
 * the new piece's conflicting triangle cleared (so the seam reads as one
 * color, the placed one's).
 *
 * Builds hand-rolled 2-cell horizontal pieces so the test specifies the
 * exact side colors and counts and isn't at the mercy of the random
 * generator. The generator has its own tests indirectly via the store.
 */

/**
 * Build a 2-cell horizontal domino at local cells (0,0) and (1,0) with the
 * caller-supplied side colors. Lets each test write the exact seam color it
 * wants. Internal sides (E of cell 0,0 and W of cell 1,0) are never colored
 * — the Piece constructor enforces that invariant.
 */
function makeDomino(
  id: string,
  colors: {
    leftN?: RuleColor;
    leftS?: RuleColor;
    leftW?: RuleColor;
    rightN?: RuleColor;
    rightS?: RuleColor;
    rightE?: RuleColor;
  },
): Piece {
  const poly = new Polyomino([
    { col: 0, row: 0 },
    { col: 1, row: 0 },
  ]);
  const map = new Map<string, Partial<Record<Side, RuleColor>>>();
  const left: Partial<Record<Side, RuleColor>> = {};
  if (colors.leftN) left.N = colors.leftN;
  if (colors.leftS) left.S = colors.leftS;
  if (colors.leftW) left.W = colors.leftW;
  if (Object.keys(left).length > 0) map.set("0,0", left);
  const right: Partial<Record<Side, RuleColor>> = {};
  if (colors.rightN) right.N = colors.rightN;
  if (colors.rightS) right.S = colors.rightS;
  if (colors.rightE) right.E = colors.rightE;
  if (Object.keys(right).length > 0) map.set("1,0", right);
  return new Piece(id, poly, map as SideColorMap);
}

/**
 * Build a 1-cell piece for the simple seam-only tests. Lets us write
 * "a 2-box piece with purple on its right side, placed at (1, 1)" and not
 * worry about a second cell's geometry. Square count comes from the
 * caller because the test wants to control box counts independently of
 * the polyomino's actual cell count — that's how the original bug was
 * formulated ("a 2-box piece with purple"). We synthesize a 2-cell piece
 * (horizontal) where only one cell carries the relevant colored side.
 */

const rules: readonly Rule[] = [
  { color: "purple", fraction: new Fraction(1, 2) }, // 1:2
  { color: "blue", fraction: new Fraction(1, 1) }, // 1:1
  { color: "green", fraction: new Fraction(2, 5) },
];

describe("Grid.canPlace placed-wins color contract", () => {
  it("rejects: new piece's blue at seam vs placed's purple at seam, 2:2 violates purple (1:2)", () => {
    // Placed piece: 2-box domino at (0,0)-(1,0). Right cell's East side is
    // purple. So at col=2, row=0 (the cell just east of the placed piece),
    // the placed side facing that empty cell is colored purple.
    const placed = makeDomino("placed", { rightE: "purple" });
    const placedPlacement: Placement = {
      placementId: "anchor-0",
      piece: placed,
      origin: { col: 0, row: 0 },
      anchor: true,
    };
    const grid = new Grid(6, 4, [placedPlacement]);

    // New piece: 2-box domino. Its left cell's West side is blue. So when
    // dropped at origin (2,0), the new piece occupies (2,0)-(3,0), and the
    // seam is between absolute col=2 (new piece's left cell) and col=1
    // (placed piece's right cell). New piece's W color on its left cell is
    // blue; placed piece's E color on its right cell is purple.
    const incoming = makeDomino("new", { leftW: "blue" });

    const result = grid.canPlace(incoming, { col: 2, row: 0 }, rules);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("rule_mismatch");
    if (result.reason !== "rule_mismatch") return;
    // The seam color in the failure is the placed neighbor's color (purple,
    // not blue) — proving the "placed wins" semantics.
    expect(result.edgeColor).toBe("purple");
    expect(result.placedCount).toBe(2);
    expect(result.newCount).toBe(2);
  });

  it("accepts + reports edgesToClear: new's blue at seam vs placed's purple at seam, 2:4 satisfies purple (1:2)", () => {
    // Same setup but the new piece is a 4-box piece (so 2:4 = 1:2 satisfies
    // purple). Placement should succeed AND report the new piece's W color
    // at its (0,0) cell as an edge to clear, because the seam belongs to
    // the placed piece's purple now and the new piece's blue triangle
    // would visually contradict it.
    const placed = makeDomino("placed", { rightE: "purple" });
    const placedPlacement: Placement = {
      placementId: "anchor-0",
      piece: placed,
      origin: { col: 0, row: 0 },
      anchor: true,
    };
    const grid = new Grid(6, 4, [placedPlacement]);

    // 4-box rectangle: 2 cells wide x 2 cells tall, with leftN/leftW set?
    // Use the same horizontal-domino structure but make a 4-cell piece.
    const poly4 = new Polyomino([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ]);
    // Color the West side of (0,0) blue — this is the cell that will sit
    // adjacent to the placed neighbor's purple-East side.
    const map: Map<string, Partial<Record<Side, RuleColor>>> = new Map();
    map.set("0,0", { W: "blue" });
    // Also paint a non-conflicting color elsewhere so we can confirm only
    // the conflicting side gets cleared, not every color.
    map.set("1,0", { N: "green" });
    const incoming = new Piece("new", poly4, map as SideColorMap);

    const result = grid.canPlace(incoming, { col: 2, row: 0 }, rules);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.edgesToClear.length).toBe(1);
    expect(result.edgesToClear[0]).toEqual({ localCol: 0, localRow: 0, side: "W" });

    // The clear, applied to the piece, should remove blue from (0,0)/W but
    // keep green on (1,0)/N — matching the user's stated expectation that
    // "the block with blue should only have green and purple [etc.]" (here,
    // green is preserved; blue is cleared).
    const cleared = incoming.withClearedColors(result.edgesToClear);
    expect(cleared.colorOn(0, 0, "W")).toBeNull();
    expect(cleared.colorOn(1, 0, "N")).toBe("green");
  });

  it("accepts with no clearing when both sides agree on color at the seam", () => {
    // Placed has purple at the East side; new piece also has purple at the
    // West side. No conflict; ratio 2:4 satisfies purple (1:2).
    const placed = makeDomino("placed", { rightE: "purple" });
    const placedPlacement: Placement = {
      placementId: "anchor-0",
      piece: placed,
      origin: { col: 0, row: 0 },
      anchor: true,
    };
    const grid = new Grid(6, 4, [placedPlacement]);

    const poly4 = new Polyomino([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ]);
    const map: Map<string, Partial<Record<Side, RuleColor>>> = new Map();
    map.set("0,0", { W: "purple" });
    const incoming = new Piece("new", poly4, map as SideColorMap);

    const result = grid.canPlace(incoming, { col: 2, row: 0 }, rules);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.edgesToClear.length).toBe(0);
  });

  it("falls back to any-rule check when neither side carries a color at the seam", () => {
    // Both pieces have no color on the touching sides. Ratio 2:2 = 1:1
    // satisfies the blue rule (any-rule fallback).
    const placed = makeDomino("placed", {}); // no colors anywhere
    const placedPlacement: Placement = {
      placementId: "anchor-0",
      piece: placed,
      origin: { col: 0, row: 0 },
      anchor: true,
    };
    const grid = new Grid(6, 4, [placedPlacement]);
    const incoming = makeDomino("new", {});

    const result = grid.canPlace(incoming, { col: 2, row: 0 }, rules);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.edgesToClear.length).toBe(0);
  });

  it("rejects with a rule_mismatch reporting null edgeColor when no color anywhere and no rule matches", () => {
    // No colors on either seam side; we want a ratio that none of the rules
    // allow. Use a placed 2-box and a new 3-box piece: 2:3 ≠ 1:2 (purple),
    // ≠ 1:1 (blue), ≠ 2:5 (green). All three rules are kept in the set so
    // the test fails only on the ratio, not on missing-rule machinery.
    const placed = makeDomino("placed", {});
    const placedPlacement: Placement = {
      placementId: "anchor-0",
      piece: placed,
      origin: { col: 0, row: 0 },
      anchor: true,
    };
    const grid = new Grid(6, 4, [placedPlacement]);

    // 3-box piece: 3 cells in a row. Placed occupies cols 0,1; new dropped
    // at (2,0) occupies cols 2,3,4 — all in bounds for a 6-wide grid.
    const poly3 = new Polyomino([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
    ]);
    const incoming = new Piece("new", poly3, new Map() as SideColorMap);

    const result = grid.canPlace(incoming, { col: 2, row: 0 }, rules);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("rule_mismatch");
    if (result.reason !== "rule_mismatch") return;
    expect(result.edgeColor).toBeNull();
    expect(result.placedCount).toBe(2);
    expect(result.newCount).toBe(3);
  });
});
