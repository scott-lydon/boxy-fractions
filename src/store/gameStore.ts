import { create } from "zustand";
import { Bar } from "../domain/Bar";
import { pieceById } from "../domain/Piece";
import { getStage } from "../domain/Lesson";
import type { StageId } from "../domain/Lesson";

export interface ChatMessage {
  readonly id: string;
  readonly speaker: "tutor" | "kid";
  readonly text: string;
}

interface StoreData {
  bars: Bar[];
  stage: StageId;
  messages: ChatMessage[];
  instanceCounter: number;
  messageCounter: number;
}

interface StoreActions {
  placePieceOnBar: (pieceId: string, barIndex: number) => void;
  clearBar: (barIndex: number) => void;
  acceptChoice: (label: string, reply: string, next: StageId) => void;
  startLesson: () => void;
  reset: () => void;
}

export type GameStore = StoreData & StoreActions;

function appendMessage(s: StoreData, speaker: "tutor" | "kid", text: string): StoreData {
  return {
    ...s,
    messages: [
      ...s.messages,
      { id: `msg-${s.messageCounter + 1}`, speaker, text },
    ],
    messageCounter: s.messageCounter + 1,
  };
}

function pushStageIntro(s: StoreData, next: StageId): StoreData {
  const stage = getStage(next);
  let state: StoreData = { ...s, stage: next };
  if (stage.onEnterClearBars) {
    const newBars = [...state.bars];
    for (const idx of stage.onEnterClearBars) {
      if (newBars[idx]) newBars[idx] = newBars[idx].cleared();
    }
    state = { ...state, bars: newBars };
  }
  for (const line of stage.script) {
    state = appendMessage(state, "tutor", line.text);
  }
  return state;
}

function checkAdvance(s: StoreData): StoreData {
  const stage = getStage(s.stage);
  const cond = stage.advanceWhenBarsMatch;
  if (!cond) return s;
  const bar = s.bars[cond.targetBarIndex];
  if (!bar) {
    throw new Error(
      `Stage ${stage.id} references targetBarIndex ${cond.targetBarIndex} but only ` +
        `${s.bars.length} bars exist. Bug: lesson script targets a bar that the store ` +
        `did not allocate. Increase initial bar count or fix the stage's targetBarIndex.`,
    );
  }
  if (bar.filledFraction().equivalentTo(cond.targetFraction)) {
    let next = appendMessage(s, "tutor", cond.successMessage);
    return pushStageIntro(next, cond.nextStage);
  }
  return s;
}

const initialData = (): StoreData => ({
  bars: [new Bar(), new Bar()],
  stage: "welcome",
  messages: [],
  instanceCounter: 0,
  messageCounter: 0,
});

export const useGameStore = create<GameStore>((set) => ({
  ...initialData(),

  startLesson: () => {
    set((s) => {
      if (s.messages.length > 0) return s; // already started
      return pushStageIntro(s, "welcome");
    });
  },

  placePieceOnBar: (pieceId, barIndex) => {
    const piece = pieceById(pieceId);
    set((s) => {
      const currentBar = s.bars[barIndex];
      if (!currentBar) {
        throw new Error(
          `Invalid barIndex ${barIndex}. Bars available: ${s.bars.length}. ` +
            `Bug: a drop target reported a barIndex outside the configured range.`,
        );
      }
      if (currentBar.wouldOverflow(piece)) {
        return appendMessage(
          s,
          "tutor",
          `That ${piece.label} piece is too big to fit on this bar right now. Try a smaller one, or clear the bar.`,
        );
      }
      const instanceId = `inst-${s.instanceCounter + 1}`;
      const newBars = [...s.bars];
      newBars[barIndex] = currentBar.withPiece(piece, instanceId);
      const newState: StoreData = {
        ...s,
        bars: newBars,
        instanceCounter: s.instanceCounter + 1,
      };
      return checkAdvance(newState);
    });
  },

  clearBar: (barIndex) => {
    set((s) => {
      if (!s.bars[barIndex]) {
        throw new Error(
          `Cannot clear bar ${barIndex}: out of range (bars: ${s.bars.length}). ` +
            `Bug: a Clear button reported a barIndex that does not exist.`,
        );
      }
      const newBars = [...s.bars];
      newBars[barIndex] = newBars[barIndex].cleared();
      return { ...s, bars: newBars };
    });
  },

  acceptChoice: (_label, reply, next) => {
    set((s) => {
      const withKid = appendMessage(s, "kid", reply);
      return pushStageIntro(withKid, next);
    });
  },

  reset: () => {
    set(() => initialData());
  },
}));
