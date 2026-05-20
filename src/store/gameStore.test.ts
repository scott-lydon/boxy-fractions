import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./gameStore";
import { generateRound, gridFromRound } from "../domain/Generator";

/**
 * Bug-driven tests for gameStore. These tests bypass the (random-seeded)
 * default constructor of the store by injecting a deterministic seeded round
 * through useGameStore.setState. That gives a stable scenario the test can
 * walk through deterministically.
 */

function withSeededRound(seed: number, opts: { cols?: number; rows?: number; maxPieceSize?: number; voidFraction?: number } = {}) {
  const round = generateRound({
    cols: opts.cols ?? 4,
    rows: opts.rows ?? 4,
    maxPieceSize: opts.maxPieceSize ?? 3,
    seed,
    voidFraction: opts.voidFraction ?? 0,
  });
  useGameStore.setState({
    round,
    grid: gridFromRound(round),
    trayPieceIds: round.trayPieces.map((p) => p.id),
    messages: [],
    messageCounter: 0,
    placementCounter: 0,
    revealedSolution: false,
    submitted: false,
    score: 0,
    maxPossiblePercent:
      Math.round(
        (round.solutionPlacements.reduce((acc, p) => acc + p.piece.squareCount, 0) /
          (round.cols * round.rows)) * 100,
      ),
  });
  return round;
}

/**
 * Place every tray piece at its known-correct solution origin. The seeded
 * round's solutionPlacements are guaranteed to be self-consistent (the
 * generator built them from a valid tiling).
 */
function placeEverythingAtSolution() {
  const { round } = useGameStore.getState();
  const place = useGameStore.getState().placePieceAt;
  for (const sp of round.solutionPlacements) {
    const isAnchor = round.anchorPlacements.some((a) => a.piece.id === sp.piece.id);
    if (isAnchor) continue;
    // Pick any cell of the piece as the drop cell. snap-to-legal will resolve
    // it to the correct origin (it tries every local cell of the piece as a
    // hot-spot). Use the first local cell — its absolute coord is origin+cell.
    const c0 = sp.piece.polyomino.cells[0];
    const drop = { col: sp.origin.col + c0.col, row: sp.origin.row + c0.row };
    place(sp.piece.id, drop.col, drop.row);
  }
}

describe("gameStore.placePieceAt + win message", () => {
  beforeEach(() => {
    withSeededRound(12345);
  });

  it("win message re-fires after remove + re-place (the appendMessage dedupe should not silence a fresh win)", () => {
    // Drain the tray onto the solution.
    placeEverythingAtSolution();
    const afterFirstWin = useGameStore.getState();
    expect(afterFirstWin.trayPieceIds.length).toBe(0);
    const winMessages1 = afterFirstWin.messages.filter((m) => m.kind === "win");
    expect(winMessages1.length).toBeGreaterThan(0);

    // Now remove one placement (so tray length goes back to 1) and re-place it.
    const lastPlaced = afterFirstWin.grid.placements.find((p) => !p.anchor)!;
    useGameStore.getState().removePlacement(lastPlaced.placementId);
    expect(useGameStore.getState().trayPieceIds.length).toBe(1);

    // Re-place at the solution origin (drop on a real cell of the piece).
    const sp = afterFirstWin.round.solutionPlacements.find(
      (s) => s.piece.id === lastPlaced.piece.id,
    )!;
    const c0 = sp.piece.polyomino.cells[0];
    useGameStore
      .getState()
      .placePieceAt(sp.piece.id, sp.origin.col + c0.col, sp.origin.row + c0.row);
    const afterSecondWin = useGameStore.getState();
    expect(afterSecondWin.trayPieceIds.length).toBe(0);

    // The win message should fire AGAIN. If it does not, the player who removes
    // and re-places the last piece gets no "Tap Submit to score" prompt.
    const winMessages2 = afterSecondWin.messages.filter((m) => m.kind === "win");
    expect(winMessages2.length).toBe(winMessages1.length + 1);
  });
});

describe("gameStore.placePieceAt contract after terminal states", () => {
  it("does not allow placement after submit", () => {
    withSeededRound(12345);
    // Place exactly one tray piece, then submit, then try to place another.
    const { round } = useGameStore.getState();
    const sp0 = round.solutionPlacements.find(
      (s) => !round.anchorPlacements.some((a) => a.piece.id === s.piece.id),
    )!;
    const sp0c = sp0.piece.polyomino.cells[0];
    useGameStore
      .getState()
      .placePieceAt(sp0.piece.id, sp0.origin.col + sp0c.col, sp0.origin.row + sp0c.row);
    const placementCountBeforeSubmit = useGameStore.getState().grid.placements.length;

    useGameStore.getState().submit();
    expect(useGameStore.getState().submitted).toBe(true);

    // Try to place another piece. After submit, the placement contract should
    // reject this (the UI disables drag, but the store action is public).
    const sp1 = round.solutionPlacements.find(
      (s) =>
        s.piece.id !== sp0.piece.id &&
        !round.anchorPlacements.some((a) => a.piece.id === s.piece.id),
    )!;
    const sp1c = sp1.piece.polyomino.cells[0];
    useGameStore
      .getState()
      .placePieceAt(sp1.piece.id, sp1.origin.col + sp1c.col, sp1.origin.row + sp1c.row);

    // EXPECTED: the placement count should not change because we already
    // submitted. OBSERVED (current code): the placement DOES go through,
    // because placePieceAt has no submitted guard.
    expect(useGameStore.getState().grid.placements.length).toBe(placementCountBeforeSubmit);
  });

  it("does not allow placement after revealSolution", () => {
    withSeededRound(12345);
    const { round } = useGameStore.getState();
    useGameStore.getState().revealSolution();
    expect(useGameStore.getState().revealedSolution).toBe(true);

    // After Reveal, tray is empty AND removePlacement is a no-op on revealed
    // pieces (covered separately). To isolate the placePieceAt-after-reveal
    // contract from the removePlacement-after-reveal contract, inject a piece
    // id into the tray directly. Otherwise the only path to a populated tray
    // would be the bug we just fixed in removePlacement.
    const target = useGameStore.getState().grid.placements.find((p) => !p.anchor);
    if (!target) return;
    useGameStore.setState((s) => ({ ...s, trayPieceIds: [target.piece.id] }));

    const placedCountBefore = useGameStore.getState().grid.placements.length;
    const sp = round.solutionPlacements.find((s) => s.piece.id === target.piece.id)!;
    const c0 = sp.piece.polyomino.cells[0];
    useGameStore
      .getState()
      .placePieceAt(sp.piece.id, sp.origin.col + c0.col, sp.origin.row + c0.row);

    // EXPECTED: the placement contract no-ops while revealedSolution is true,
    // regardless of how the tray was populated.
    expect(useGameStore.getState().grid.placements.length).toBe(placedCountBefore);
  });
});

describe("gameStore.removePlacement on reveal results", () => {
  it("does not let the player remove a revealed (auto-placed) solution piece", () => {
    withSeededRound(12345);
    useGameStore.getState().revealSolution();
    const placedBefore = useGameStore.getState().grid.placements.length;

    // After reveal, every placement is anchor:false. The current removePlacement
    // happily removes them. EXPECTED: revealed placements are sticky.
    const target = useGameStore.getState().grid.placements.find((p) => !p.anchor);
    if (!target) return;
    useGameStore.getState().removePlacement(target.placementId);

    expect(useGameStore.getState().grid.placements.length).toBe(placedBefore);
  });
});
