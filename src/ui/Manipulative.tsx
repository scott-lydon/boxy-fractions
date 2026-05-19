import { useGameStore } from "../store/gameStore";
import { getStage } from "../domain/Lesson";
import { BarRow } from "./BarRow";
import { Tray } from "./Tray";
import { EquivalencePanel } from "./EquivalencePanel";
import { WinBanner } from "./WinBanner";

export function Manipulative() {
  const stage = useGameStore((s) => s.stage);
  const bars = useGameStore((s) => s.bars);
  const stageDef = getStage(stage);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-5">
      <div className="space-y-3">
        <BarRow label="Bar A" barIndex={0} bar={bars[0]} />
        <BarRow label="Bar B" barIndex={1} bar={bars[1]} />
      </div>
      {stageDef.showEquivalencePanel && <EquivalencePanel />}
      {stageDef.isTerminal && <WinBanner />}
      <Tray />
    </div>
  );
}
