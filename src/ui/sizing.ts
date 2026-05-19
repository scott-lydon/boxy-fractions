/**
 * One source of truth for the visual width of the "whole" bar. Tray pieces and
 * placed pieces both compute their pixel width from this value, so a 1/2 tray
 * piece is visually the same size as a 1/2 piece on the bar - that visual identity
 * IS the lesson (kid sees the tray piece and the placed piece as the same thing).
 *
 * 560px is chosen to comfortably fit on iPad portrait (768px wide) inside the
 * main column once chat is stacked above, and on iPad landscape (1024-1366px)
 * with chat in a left rail. Update both portrait/landscape css if you change it.
 */
export const BAR_WIDTH_PX = 560;

export function pieceWidthPx(decimalFraction: number): number {
  const ideal = BAR_WIDTH_PX * decimalFraction;
  // Floor at 60px so the smallest pieces (1/6 -> ~93px) stay tappable on a 9-year-old's
  // finger. If a future piece is smaller than 1/8, revisit this floor or the lesson.
  return Math.max(60, ideal);
}
