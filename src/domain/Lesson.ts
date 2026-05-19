import { Fraction } from "./Fraction";

/**
 * The Boxy Fractions lesson is a linear state machine over a few stages.
 * Each stage controls three things:
 *   1. What the tutor says (script lines, pushed into chat on stage entry)
 *   2. What pieces are in the tray (so we can lock the kid to a strategy)
 *   3. How the stage advances (either a choice click in chat OR a bar reaching
 *      a target fraction)
 *
 * Stages that ask a yes/no question use `choices`. Stages that ask the kid to
 * manipulate bars use `advanceWhenBarsMatch`. Some stages clear bars on entry
 * via `onEnterClearBars` so the kid starts the next exercise fresh.
 */
export type StageId =
  | "welcome"
  | "explore_halves"
  | "see_quarters"
  | "discover_equivalence"
  | "check_sixths"
  | "win";

export interface ScriptLine {
  readonly text: string;
}

export interface Choice {
  readonly label: string;
  readonly reply: string;
  readonly next: StageId;
}

export interface AdvanceCondition {
  readonly targetBarIndex: number;
  readonly targetFraction: Fraction;
  readonly successMessage: string;
  readonly nextStage: StageId;
}

export interface Stage {
  readonly id: StageId;
  readonly script: readonly ScriptLine[];
  readonly choices?: readonly Choice[];
  readonly availablePieceIds: readonly string[];
  readonly advanceWhenBarsMatch?: AdvanceCondition;
  readonly showEquivalencePanel?: boolean;
  readonly onEnterClearBars?: readonly number[];
  readonly isTerminal?: boolean;
}

const HALF = new Fraction(1, 2);

export const LESSON_SCRIPT: readonly Stage[] = [
  {
    id: "welcome",
    script: [
      { text: "Hi! I'm your math buddy. Today we're going to play with fraction boxes." },
      { text: "These boxes look the same, but they hide a secret. Want to find it?" },
    ],
    choices: [{ label: "Let's go!", reply: "Let's go!", next: "explore_halves" }],
    availablePieceIds: [],
  },
  {
    id: "explore_halves",
    script: [
      { text: "See the long box labeled Bar A? That's one whole." },
      { text: "Drag the yellow 1/2 piece onto Bar A. See what it covers." },
    ],
    availablePieceIds: ["half"],
    advanceWhenBarsMatch: {
      targetBarIndex: 0,
      targetFraction: HALF,
      successMessage: "Nice. The 1/2 piece covers exactly half of the box. Makes sense, right?",
      nextStage: "see_quarters",
    },
  },
  {
    id: "see_quarters",
    script: [
      { text: "Now look at Bar B underneath." },
      { text: "Try filling Bar B to the same length as the 1/2 above, but use the blue 1/4 pieces." },
    ],
    availablePieceIds: ["half", "quarter"],
    advanceWhenBarsMatch: {
      targetBarIndex: 1,
      targetFraction: HALF,
      successMessage: "Whoa. Two 1/4s line up exactly with one 1/2.",
      nextStage: "discover_equivalence",
    },
  },
  {
    id: "discover_equivalence",
    script: [
      { text: "1/2 and 2/4 are the SAME amount of box. They just have different names." },
      { text: "Fractions that cover the same space are called EQUIVALENT." },
      { text: "Ready to try one more?" },
    ],
    choices: [{ label: "Yes!", reply: "Yes!", next: "check_sixths" }],
    availablePieceIds: ["half", "quarter"],
    showEquivalencePanel: true,
  },
  {
    id: "check_sixths",
    script: [
      { text: "I cleared Bar B. Now try to match the 1/2 on top using only green 1/6 pieces." },
      { text: "How many 1/6 pieces do you think will fit?" },
    ],
    availablePieceIds: ["sixth"],
    onEnterClearBars: [1],
    advanceWhenBarsMatch: {
      targetBarIndex: 1,
      targetFraction: HALF,
      successMessage: "Three sixths fill half the box. So 3/6 is the same as 1/2.",
      nextStage: "win",
    },
  },
  {
    id: "win",
    script: [
      { text: "You found it! You discovered three equivalent fractions:" },
      { text: "1/2 = 2/4 = 3/6" },
      { text: "Same amount of box, different names. That's fraction equivalence." },
      { text: "Fun fact: that's a Grade 4 Common Core math standard (4.NF.A.1). You just did fourth-grade math!" },
    ],
    availablePieceIds: ["half", "quarter", "sixth", "third"],
    isTerminal: true,
  },
];

export function getStage(id: StageId): Stage {
  const stage = LESSON_SCRIPT.find((s) => s.id === id);
  if (!stage) {
    throw new Error(
      `Unknown stage id "${id}". Valid stage ids: ${LESSON_SCRIPT.map((s) => s.id).join(", ")}. ` +
        `Bug: a stage transition referenced an id not in LESSON_SCRIPT. ` +
        `Check every "next" value in choices and advanceWhenBarsMatch.nextStage.`,
    );
  }
  return stage;
}
