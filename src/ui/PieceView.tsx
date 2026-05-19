import type { Piece } from "../domain/Piece";
import type { Side } from "../domain/Polyomino";
import { RULE_COLOR_FILL } from "../domain/Rule";

/**
 * Pure-SVG renderer for a single Piece. Each cell of the polyomino is drawn as
 * a square divided into four triangles by the cell's diagonals. External sides
 * that carry a rule color render that triangle filled; internal seams and
 * uncolored external sides get a neutral fill.
 *
 * The piece's square count is rendered as a centered badge so the kid can see
 * "this is a 5-square piece" at a glance (matches the hand-sketched concept).
 */
export function PieceView({
  piece,
  cellPx,
  showCount = true,
  faded = false,
}: {
  piece: Piece;
  cellPx: number;
  showCount?: boolean;
  faded?: boolean;
}) {
  const { cols, rows } = piece.polyomino.bounds;
  const w = cols * cellPx;
  const h = rows * cellPx;

  // Find the bounding box centroid for the count badge.
  let sumCol = 0;
  let sumRow = 0;
  for (const c of piece.polyomino.cells) {
    sumCol += c.col + 0.5;
    sumRow += c.row + 0.5;
  }
  const cx = (sumCol / piece.polyomino.cells.length) * cellPx;
  const cy = (sumRow / piece.polyomino.cells.length) * cellPx;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ opacity: faded ? 0.45 : 1, overflow: "visible", touchAction: "none" }}
    >
      {piece.polyomino.cells.map((c) => (
        <CellG key={`${c.col},${c.row}`} piece={piece} col={c.col} row={c.row} cellPx={cellPx} />
      ))}
      {showCount && (
        <g pointerEvents="none">
          <circle cx={cx} cy={cy} r={cellPx * 0.32} fill="rgba(15,23,42,0.92)" />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={cellPx * 0.36}
            fontWeight={800}
            fill="#fef9c3"
          >
            {piece.squareCount}
          </text>
        </g>
      )}
    </svg>
  );
}

function CellG({
  piece,
  col,
  row,
  cellPx,
}: {
  piece: Piece;
  col: number;
  row: number;
  cellPx: number;
}) {
  const x0 = col * cellPx;
  const y0 = row * cellPx;
  const x1 = x0 + cellPx;
  const y1 = y0 + cellPx;
  const cx = x0 + cellPx / 2;
  const cy = y0 + cellPx / 2;

  // 4 triangles, one per side. Internal sides render with a soft neutral fill
  // so the cell is visually solid even when uncolored.
  const sides: { side: Side; points: string }[] = [
    { side: "N", points: `${x0},${y0} ${x1},${y0} ${cx},${cy}` },
    { side: "E", points: `${x1},${y0} ${x1},${y1} ${cx},${cy}` },
    { side: "S", points: `${x1},${y1} ${x0},${y1} ${cx},${cy}` },
    { side: "W", points: `${x0},${y1} ${x0},${y0} ${cx},${cy}` },
  ];

  return (
    <g>
      {sides.map(({ side, points }) => {
        const color = piece.colorOn(col, row, side);
        const fill = color ? RULE_COLOR_FILL[color] : "#f8fafc";
        return <polygon key={side} points={points} fill={fill} stroke="rgba(15,23,42,0.25)" strokeWidth={0.5} />;
      })}
      {/* Outer outline */}
      <rect x={x0} y={y0} width={cellPx} height={cellPx} fill="none" stroke="rgba(15,23,42,0.6)" strokeWidth={1.5} />
    </g>
  );
}
