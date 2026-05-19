import { describe, it, expect } from "vitest";
import { LESSON_SCRIPT, getStage } from "./Lesson";

describe("LESSON_SCRIPT", () => {
  it("contains every reachable stage", () => {
    const ids = new Set(LESSON_SCRIPT.map((s) => s.id));
    for (const stage of LESSON_SCRIPT) {
      if (stage.choices) {
        for (const c of stage.choices) {
          expect(ids.has(c.next)).toBe(true);
        }
      }
      if (stage.advanceWhenBarsMatch) {
        expect(ids.has(stage.advanceWhenBarsMatch.nextStage)).toBe(true);
      }
    }
  });

  it("starts at welcome and ends at win", () => {
    expect(LESSON_SCRIPT[0].id).toBe("welcome");
    expect(LESSON_SCRIPT[LESSON_SCRIPT.length - 1].id).toBe("win");
    expect(LESSON_SCRIPT[LESSON_SCRIPT.length - 1].isTerminal).toBe(true);
  });

  it("every non-terminal stage has either choices or advanceWhenBarsMatch", () => {
    for (const stage of LESSON_SCRIPT) {
      if (stage.isTerminal) continue;
      const hasExit = !!stage.choices?.length || !!stage.advanceWhenBarsMatch;
      expect(hasExit, `stage ${stage.id} has no way to advance`).toBe(true);
    }
  });

  it("getStage throws with a useful message on unknown id", () => {
    // @ts-expect-error - testing the runtime guard
    expect(() => getStage("nonexistent")).toThrow(/Unknown stage id/);
  });
});
