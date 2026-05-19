/**
 * Module-level registry of bar drop-target rectangles.
 *
 * Framer Motion's drag onDragEnd gives us a pointer position in viewport coords
 * but no concept of "drop target." We register each Bar's getBoundingClientRect
 * here on mount and on resize, then DraggablePiece looks up the bar under the
 * pointer at drop time. Keeping this out of the Zustand store avoids re-rendering
 * the whole tree every time a window resizes.
 */

export interface DropRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const rects = new Map<number, DropRect>();

export function setBarRect(index: number, rect: DropRect): void {
  rects.set(index, rect);
}

export function clearBarRect(index: number): void {
  rects.delete(index);
}

export function findBarAtPoint(x: number, y: number): number | null {
  for (const [index, r] of rects.entries()) {
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return index;
    }
  }
  return null;
}
