import { Fraction } from "./Fraction";

/**
 * A color identity for a rule. We use a small palette of accessible, kid-readable
 * colors. The palette is also accessible (no red/green pair sole-distinction; the
 * shapes' square count is always visible too).
 */
export type RuleColor =
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "yellow"
  | "cyan";

export const RULE_COLOR_PALETTE: readonly RuleColor[] = [
  "orange",
  "green",
  "blue",
  "purple",
  "pink",
  "yellow",
  "cyan",
];

/**
 * Tailwind class for each rule color. Centralized so the SVG renderer and the
 * rules panel agree on what "green" looks like.
 */
export const RULE_COLOR_FILL: Record<RuleColor, string> = {
  orange: "#f97316",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  yellow: "#eab308",
  cyan: "#06b6d4",
};

/**
 * A rule the player must satisfy when placing pieces adjacent to each other.
 *
 * Reading: "When two pieces share a side colored {color}, the placed piece's
 * square count over the new piece's square count must equal {fraction}, or any
 * equivalent fraction."
 *
 * The fraction is stored as authored (possibly unsimplified) so the kid can
 * tap to simplify it for a bonus, per the original Boxy concept.
 */
export interface Rule {
  readonly color: RuleColor;
  readonly fraction: Fraction;
}

/**
 * Does the (placedCount, newCount) pair satisfy this rule? Equivalent fractions
 * satisfy it: a rule of 2/5 is satisfied by 4/10, 6/15, etc.
 */
export function ruleSatisfied(rule: Rule, placedCount: number, newCount: number): boolean {
  const actual = new Fraction(placedCount, newCount);
  return actual.equivalentTo(rule.fraction);
}
