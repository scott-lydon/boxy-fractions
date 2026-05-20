import { create } from "zustand";
import { Grid } from "../domain/Grid";
import { generateRound, gridFromRound, type GeneratedRound } from "../domain/Generator";
import type { Piece } from "../domain/Piece";
import type { Placement } from "../domain/Grid";

export interface GameMessage {
  readonly id: string;
  readonly text: string;
  readonly kind: "info" | "warn" | "win";
}

interface StoreData {
  round: GeneratedRound;
  grid: Grid;
  // pieces still available in the tray (subset of round.trayPieces, minus those placed)
  trayPieceIds: string[];
  messages: GameMessage[];
  messageCounter: number;
  placementCounter: number;
  revealedSolution: boolean;
  submitted: boolean;
  score: number; // 0..100
  // Ceiling % the player COULD reach if every piece in the round were placed.
  // Round generator removes void tiles; this caps fill at < 100% so the player
  // can see up-front what "perfect" looks like for this puzzle.
  maxPossiblePercent: number;
}

interface StoreActions {
  placePieceAt: (pieceId: string, gridCol: number, gridRow: number) => void;
  removePlacement: (placementId: string) => void;
  newRound: (cols?: number, rows?: number, maxPieceSize?: number) => void;
  revealSolution: () => void;
  submit: () => void;
}

export type GameStore = StoreData & StoreActions;

function initialRound(cols: number, rows: number, maxPieceSize: number): GeneratedRound {
  // Keep regenerating until we have a usable round (at least 2 tiles + 1 anchor + at least 1 tray piece).
  for (let i = 0; i < 25; i++) {
    const r = generateRound({ cols, rows, maxPieceSize });
    if (r.trayPieces.length >= 1 && r.rules.length >= 1) return r;
  }
  throw new Error(
    `Generator failed to produce a usable round after 25 attempts for cols=${cols}, rows=${rows}, maxPieceSize=${maxPieceSize}. ` +
      `Bug: either the grid is too small to produce variety, or the tile() function is rejecting too many candidates. ` +
      `Try a larger grid or larger maxPieceSize.`,
  );
}

function appendMessage(s: StoreData, kind: GameMessage["kind"], text: string): StoreData {
  return {
    ...s,
    messages: [...s.messages, { id: `msg-${s.messageCounter + 1}`, kind, text }],
    messageCounter: s.messageCounter + 1,
  };
}

const DEFAULT_COLS = 6;
const DEFAULT_ROWS = 5;
const DEFAULT_MAX_PIECE_SIZE = 5;

/**
 * The most you could ever fill: every solution piece placed. The generator
 * voids some tiles by design, so this is the puzzle's ceiling (< 100% on most
 * rounds). Surfaced live in the toolbar so the player knows the target.
 */
function maxPossiblePercentFor(round: GeneratedRound): number {
  let cells = 0;
  for (const p of round.solutionPlacements) cells += p.piece.squareCount;
  const total = round.cols * round.rows;
  if (total === 0) {
    throw new Error(
      `Round has zero cells (cols=${round.cols}, rows=${round.rows}). ` +
        `Bug: a round was generated with empty dimensions. Check the round generator inputs.`,
    );
  }
  return Math.round((cells / total) * 100);
}

const initialData = (): StoreData => {
  const round = initialRound(DEFAULT_COLS, DEFAULT_ROWS, DEFAULT_MAX_PIECE_SIZE);
  // No intro message in the panel: the header subtitle, rules panel, and
  // How-to-play carousel already explain the goal. A third copy in the message
  // panel was redundant chrome that competed with real, actionable feedback
  // (placement errors, win confirmation) for the player's attention.
  return {
    round,
    grid: gridFromRound(round),
    trayPieceIds: round.trayPieces.map((p) => p.id),
    messages: [],
    messageCounter: 0,
    placementCounter: 0,
    revealedSolution: false,
    submitted: false,
    score: 0,
    maxPossiblePercent: maxPossiblePercentFor(round),
  };
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialData(),

  placePieceAt: (pieceId, gridCol, gridRow) => {
    set((s) => {
      const piece = pieceById(s.round, pieceId);
      if (!piece) return appendMessage(s, "warn", `Unknown piece id ${pieceId}.`);
      if (!s.trayPieceIds.includes(pieceId)) {
        return appendMessage(s, "warn", `Piece ${pieceId} is no longer in the tray.`);
      }
      const result = s.grid.canPlace(piece, { col: gridCol, row: gridRow }, s.round.rules);
      if (!result.ok) {
        const reason = explainReason(result);
        return appendMessage(s, "warn", reason);
      }
      const placementId = `placement-${s.placementCounter + 1}`;
      const placement: Placement = {
        placementId,
        piece,
        origin: { col: gridCol, row: gridRow },
        anchor: false,
      };
      const newGrid = s.grid.withPlacement(placement);
      const newTray = s.trayPieceIds.filter((id) => id !== pieceId);
      let next: StoreData = {
        ...s,
        grid: newGrid,
        trayPieceIds: newTray,
        placementCounter: s.placementCounter + 1,
      };
      if (newTray.length === 0) {
        next = appendMessage(next, "win", "You placed every piece! Hit Submit to score.");
      }
      return next;
    });
  },

  removePlacement: (placementId) => {
    set((s) => {
      const placement = s.grid.placements.find((p) => p.placementId === placementId);
      if (!placement || placement.anchor) return s;
      const newGrid = s.grid.withoutPlacement(placementId);
      // Restore the piece to the tray.
      return {
        ...s,
        grid: newGrid,
        trayPieceIds: [...s.trayPieceIds, placement.piece.id],
      };
    });
  },

  newRound: (cols, rows, maxPieceSize) => {
    set(() => {
      const round = initialRound(
        cols ?? DEFAULT_COLS,
        rows ?? DEFAULT_ROWS,
        maxPieceSize ?? DEFAULT_MAX_PIECE_SIZE,
      );
      // Same as initial: no intro message. The toolbar's filled/possible
      // readout resets visibly when a new round starts, which is the only
      // status the player needs.
      return {
        round,
        grid: gridFromRound(round),
        trayPieceIds: round.trayPieces.map((p) => p.id),
        messages: [],
        messageCounter: 0,
        placementCounter: 0,
        revealedSolution: false,
        submitted: false,
        score: 0,
        maxPossiblePercent: maxPossiblePercentFor(round),
      };
    });
  },

  revealSolution: () => {
    set((s) => {
      // Replace the grid with the full solution.
      const newGrid = new Grid(
        s.round.cols,
        s.round.rows,
        s.round.solutionPlacements.map((p, i) => ({
          ...p,
          placementId: `reveal-${i}`,
          anchor: false,
        })),
      );
      return {
        ...s,
        grid: newGrid,
        trayPieceIds: [],
        revealedSolution: true,
        messages: [
          ...s.messages,
          {
            id: `msg-${s.messageCounter + 1}`,
            kind: "info",
            text: "Showing one solution. Tap New Round to play again.",
          },
        ],
        messageCounter: s.messageCounter + 1,
      };
    });
  },

  submit: () => {
    set((s) => {
      const fill = s.grid.fillRatio();
      const score = Math.round(fill * 100);
      return {
        ...s,
        submitted: true,
        score,
        messages: [
          ...s.messages,
          {
            id: `msg-${s.messageCounter + 1}`,
            kind: score === 100 ? "win" : "info",
            text:
              score === 100
                ? `Perfect! You filled the whole grid.`
                : `You filled ${score}% of the grid. Tap a placed piece to remove it and try again, or Reveal the answer.`,
          },
        ],
        messageCounter: s.messageCounter + 1,
      };
    });
  },
}));

function pieceById(round: GeneratedRound, id: string): Piece | undefined {
  for (const p of round.trayPieces) if (p.id === id) return p;
  for (const a of round.anchorPlacements) if (a.piece.id === id) return a.piece;
  return undefined;
}

function explainReason(
  r: Exclude<ReturnType<Grid["canPlace"]>, { ok: true }>,
): string {
  switch (r.reason) {
    case "out_of_bounds":
      return "That piece would hang off the edge of the grid. Shift it so all of its boxes land inside.";
    case "overlap":
      // Common cause: the player dragged the piece so its TOP-LEFT box landed on
      // a cell occupied by another piece (often the anchor itself). The whole
      // piece's footprint has to fall on empty cells — drop the piece offset by
      // a cell or two so the top-left clears the existing pieces.
      return `Every box of the piece has to land on an empty cell. Cell (${r.col}, ${r.row}) is already taken — try shifting one cell over.`;
    case "no_adjacency":
      return "Pieces must touch another piece. Place this one next to an existing piece.";
    case "rule_mismatch":
      // Show the bare ratio both ways so the student can match against the
      // rules panel without having to know which order "counts".
      return `Those two pieces would meet in a ${r.placedCount}:${r.newCount} ratio. No rule allows that ratio.`;
  }
}
