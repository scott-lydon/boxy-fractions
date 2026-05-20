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
    droppedPieceIds: [],
    messages: [],
    messageCounter: 0,
    placementCounter: 0,
    revealedSolution: false,
    submitted: false,
    score: 0,
    totalCells: round.cols * round.rows,
    possibleCells: round.solutionPlacements.reduce((acc, p) => acc + p.piece.squareCount, 0),
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

describe("gameStore.resetPlacements", () => {
  beforeEach(() => {
    withSeededRound(12345);
  });

  it("returns every kid-placed piece to the tray, keeps the anchor, clears terminal state", () => {
    const { round } = useGameStore.getState();
    placeEverythingAtSolution();
    const beforeReset = useGameStore.getState();
    // Confirm pre-condition: some non-anchor placements exist.
    expect(beforeReset.grid.placements.some((p) => !p.anchor)).toBe(true);
    expect(beforeReset.trayPieceIds.length).toBe(0);
    useGameStore.getState().submit();
    expect(useGameStore.getState().submitted).toBe(true);

    useGameStore.getState().resetPlacements();
    const afterReset = useGameStore.getState();
    // Only anchors remain on the grid.
    expect(afterReset.grid.placements.every((p) => p.anchor)).toBe(true);
    // Tray now contains the full round.trayPieces id set, in original order.
    expect(afterReset.trayPieceIds.length).toBe(round.trayPieces.length);
    expect(afterReset.trayPieceIds).toEqual(round.trayPieces.map((p) => p.id));
    // Terminal state and run counters cleared.
    expect(afterReset.submitted).toBe(false);
    expect(afterReset.revealedSolution).toBe(false);
    expect(afterReset.score).toBe(0);
    expect(afterReset.messages).toEqual([]);
    // The round itself is the same instance (same rules, same anchor piece).
    expect(afterReset.round).toBe(beforeReset.round);
    expect(afterReset.totalCells).toBe(beforeReset.totalCells);
    expect(afterReset.possibleCells).toBe(beforeReset.possibleCells);
    // Reset also empties the Dropped basket — it's part of "retry the same
    // puzzle from scratch."
    expect(afterReset.droppedPieceIds).toEqual([]);
  });

  it("is a no-op when nothing is placed", () => {
    const before = useGameStore.getState();
    useGameStore.getState().resetPlacements();
    const after = useGameStore.getState();
    // Anchor-only grid stays the same.
    expect(after.grid.placements.length).toBe(before.grid.placements.length);
    expect(after.trayPieceIds.length).toBe(before.trayPieceIds.length);
  });
});

describe("gameStore.placePieceAt consume-on-fail", () => {
  it("moves the piece from tray to droppedPieceIds when the drop lands on an out-of-bounds cell", () => {
    withSeededRound(12345);
    const before = useGameStore.getState();
    // Pick a tray piece (not an anchor) and drop it at a cell well outside
    // the grid. Every snap-to-legal candidate origin will fail with
    // out_of_bounds, so the drop is rejected — and the piece must end up in
    // droppedPieceIds, not in trayPieceIds.
    const targetId = before.trayPieceIds[0];
    expect(before.droppedPieceIds).not.toContain(targetId);
    expect(before.trayPieceIds).toContain(targetId);

    useGameStore.getState().placePieceAt(targetId, before.grid.cols + 5, before.grid.rows + 5);

    const after = useGameStore.getState();
    // Tray no longer holds it.
    expect(after.trayPieceIds).not.toContain(targetId);
    // Dropped now holds it, at the tail of the list.
    expect(after.droppedPieceIds).toContain(targetId);
    expect(after.droppedPieceIds[after.droppedPieceIds.length - 1]).toBe(targetId);
    // Grid placements unchanged.
    expect(after.grid.placements.length).toBe(before.grid.placements.length);
    // A 'warn' message landed in the queue.
    const warns = after.messages.filter((m) => m.kind === "warn");
    expect(warns.length).toBeGreaterThan(0);
  });

  it("resetPlacements restores every dropped piece to the tray", () => {
    withSeededRound(12345);
    // Drop the first two tray pieces by aiming way off-grid.
    const initialTray = useGameStore.getState().trayPieceIds.slice();
    const dropA = initialTray[0];
    const dropB = initialTray[1];
    useGameStore.getState().placePieceAt(dropA, 999, 999);
    useGameStore.getState().placePieceAt(dropB, 999, 999);
    const afterDrop = useGameStore.getState();
    expect(afterDrop.droppedPieceIds).toContain(dropA);
    expect(afterDrop.droppedPieceIds).toContain(dropB);

    useGameStore.getState().resetPlacements();
    const afterReset = useGameStore.getState();
    // Dropped basket emptied.
    expect(afterReset.droppedPieceIds).toEqual([]);
    // Both pieces back in the tray.
    expect(afterReset.trayPieceIds).toContain(dropA);
    expect(afterReset.trayPieceIds).toContain(dropB);
    // Tray order matches the round's canonical ordering.
    expect(afterReset.trayPieceIds).toEqual(
      useGameStore.getState().round.trayPieces.map((p) => p.id),
    );
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
