import { useGameStore } from "../store/gameStore";
import { DraggablePiece } from "./DraggablePiece";

/**
 * Counter badge for the "Parts" header. Mirrors PieceView's count badge so
 * the two counters (how-many-parts-left, how-many-boxes-in-this-piece) read
 * as the same vocabulary. Same dark circle fill (rgba(31, 36, 47, 0.82)),
 * same cream numeral (#f5efe3), bold weight, tight letter spacing.
 *
 * Sized off SVG (not just a CSS circle) so the numeral is centered the same
 * way PieceView centers its number — text rendering with CSS line-height in
 * a small badge tends to drift a pixel or two; the SVG approach is what the
 * on-piece badge already does, so we copy it for visual identity.
 */
function PartsCountBadge({ count }: { count: number }) {
  const px = 22;
  const cx = px / 2;
  const cy = px / 2;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      role="img"
      aria-label={`${count} parts`}
    >
      <circle cx={cx} cy={cy} r={px * 0.46} fill="rgba(31, 36, 47, 0.82)" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={px * 0.55}
        fontWeight={700}
        fill="#f5efe3"
        style={{ letterSpacing: -0.5 }}
      >
        {count}
      </text>
    </svg>
  );
}

export function Tray() {
  const round = useGameStore((s) => s.round);
  const trayPieceIds = useGameStore((s) => s.trayPieceIds);

  // Build a stable mapping from id to piece.
  const idToPiece = new Map(round.trayPieces.map((p) => [p.id, p]));
  const pieces = trayPieceIds.map((id) => idToPiece.get(id)).filter((p) => p !== undefined);

  if (pieces.length === 0) {
    return (
      <div className="w-full max-w-3xl rounded-2xl border border-dashed border-slate-700/50 p-8 text-center text-slate-500 text-sm">
        Tray is empty. Hit <em>Submit</em> to score or <em>New round</em> for a new puzzle.
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-3xl rounded-2xl p-6"
      style={{
        background: "rgba(31, 41, 55, 0.45)",
        backdropFilter: "blur(6px)",
        boxShadow: "inset 0 0 0 1px rgba(212, 200, 178, 0.10)",
      }}
    >
      <div
        className="text-xs uppercase tracking-[0.18em] font-semibold mb-4 flex items-center gap-2"
        style={{ color: "rgba(212, 200, 178, 0.7)" }}
      >
        <span>Parts</span>
        {/* Count badge: same dark circle + cream numeral as PieceView's
            per-piece box count. Reusing the on-piece visual idiom here means
            the "how many parts are left" readout and the "how many boxes is
            this piece" readout speak the same language — both are counts,
            both look the same. The previous "(N)" parens read as a label
            modifier, not a count. */}
        <PartsCountBadge count={pieces.length} />
      </div>
      <div className="flex flex-wrap gap-6 items-start">
        {pieces.map((p) => (
          <DraggablePiece key={p!.id} piece={p!} />
        ))}
      </div>
    </div>
  );
}
