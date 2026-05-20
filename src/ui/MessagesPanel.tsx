import { useGameStore } from "../store/gameStore";

/**
 * Message panel: shows the latest 3 transient messages from the store. Three
 * tones:
 *
 *   info  — neutral status (e.g. submit results below 100%)
 *   warn  — placement suggestion (dusty honey, NOT red). Red read as failure
 *           and discouraged the student from trying. Honey says "I think it
 *           might land another way" without scolding.
 *   win   — completion (soft sage)
 *
 * The store has been instructed to use suggestion-voice copy for warn
 * messages, so the panel just needs to stop dressing them up like errors.
 */
export function MessagesPanel() {
  const messages = useGameStore((s) => s.messages);
  if (messages.length === 0) return null;
  const latest = messages.slice(-3);
  return (
    <div className="flex flex-col gap-1.5">
      {latest.map((m) => (
        <div
          key={m.id}
          className="text-sm rounded-md px-3 py-2"
          style={tone(m.kind)}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}

function tone(kind: "info" | "warn" | "win"): React.CSSProperties {
  switch (kind) {
    case "warn":
      // Dusty honey: same color family as the New round button so the player
      // recognises it as "the game speaking to me," not an error from the OS.
      return {
        background: "rgba(230, 200, 121, 0.10)",
        boxShadow: "inset 0 0 0 1px rgba(230, 200, 121, 0.35)",
        color: "#f0e3b5",
      };
    case "win":
      return {
        background: "rgba(168, 198, 159, 0.12)",
        boxShadow: "inset 0 0 0 1px rgba(168, 198, 159, 0.35)",
        color: "#d4e3cb",
      };
    case "info":
    default:
      return {
        background: "rgba(31, 41, 55, 0.5)",
        boxShadow: "inset 0 0 0 1px rgba(212, 200, 178, 0.18)",
        color: "#dcd4be",
      };
  }
}
