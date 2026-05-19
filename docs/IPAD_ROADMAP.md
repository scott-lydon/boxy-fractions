# iPad Roadmap

The deliverable per the Gauntlet Week 4 brief is a web app that runs in iPad Safari. This document covers tap-target audit, gesture coverage, what already works on iPad, and what would change if the lesson moved into a native iPad app.

## Today (web on iPad Safari)

### Tap and drag targets

- **Tray pieces** are sized at `max(60px, BAR_WIDTH × fraction)`. The smallest piece (1/6) renders at about 93 px wide and 56 px tall, well above Apple's 44 × 44 minimum.
- **Clear button** is a 12-character text button at the start of each bar row. Hit area extends the full row height (56 px).
- **Choice buttons** in chat are pill-shaped, 40 px tall, full-width on portrait iPad.

### Gestures

- **Drag a piece** from the tray onto a bar: pointer down, drag, release inside a bar's bounding rect. Framer Motion uses Pointer Events so the same handler runs on mouse, touch, and Apple Pencil.
- **Snap back**: release outside any bar and the piece returns to its tray slot (`dragSnapToOrigin`).
- **Clear bar**: tap the "Clear" label on the left of any row.
- **Advance lesson**: tap a yellow choice button in chat, or trigger advancement by manipulating bars.

### iPad Safari quirks we already handle

- `touch-action: none` on each draggable so iPad does not scroll the page while the piece is being dragged.
- `-webkit-touch-callout: none` on `body` so long-press does not show the iOS link/text menu.
- `-webkit-user-select: none` on `body` so dragging across text does not start a selection.
- `viewport-fit=cover` with `apple-mobile-web-app-status-bar-style=black-translucent` so the app draws under the iPad status bar when added to Home Screen.
- `maximum-scale=1` on the viewport meta tag so accidental pinch-zoom during drag does not break the layout.

### Layout breakpoints

- **Portrait iPad (768 wide).** Chat occupies a 224 px tall horizontal strip at the top, manipulative fills the rest.
- **Landscape iPad (1024 wide and above).** Chat occupies a 320 px wide left rail, manipulative fills the rest.
- The `md` Tailwind breakpoint at 768 px flips the layout, no manual switch needed.

### Tap-target audit (manual pass against the live URL on iPad Safari)

| Element | Reachable for right-hand user? | Reachable for left-hand user? | Min size | Result |
| --- | --- | --- | --- | --- |
| Tray 1/2 piece | yes | yes | 280 × 56 | pass |
| Tray 1/4 piece | yes | yes | 140 × 56 | pass |
| Tray 1/6 piece | yes | yes | 93 × 56 | pass |
| Clear button bar A | yes | yes | 56 × 56 | pass |
| Clear button bar B | yes | yes | 56 × 56 | pass |
| "Let's go!" choice | yes | yes | 96 × 40 | pass |
| "Yes!" choice | yes | yes | 64 × 40 | pass |
| Play again (win) | yes | yes | 120 × 40 | pass |

## Near-term improvements (still web)

Listed in priority order, smallest to largest investment.

1. **Haptic feedback on drop.** A tiny `navigator.vibrate(8)` on a successful placement. Safari iOS does not honor this on the web today, but the API call is harmless and lights up immediately when Apple ships support.
2. **Audio cue on equivalence reveal.** A short, soft chord when the equivalence panel appears. Web Audio works in iPad Safari but requires a user-gesture context, which we have on the first drop.
3. **Larger pieces in low-vision mode.** Detect `prefers-reduced-motion` and `prefers-contrast: more` and bump piece heights to 72 px and increase contrast on the green 1/6 piece.
4. **Add-to-Home-Screen prompt** on the win screen so the kid can re-launch the lesson as a "full-screen" web app on subsequent days.
5. **A second lesson** in the same shell: comparing fractions (1/3 vs 1/4: which is bigger?). Same manipulative, new script and acceptance conditions. The lesson state machine already supports this; only the script changes.

## If we moved to a native iPad app

A SwiftUI port of this lesson would gain:

- **System haptics** via `UIImpactFeedbackGenerator` on a placement, success, and the equivalence reveal. The Synthesis app uses this and it lands.
- **Better drag visuals.** UIKit's drag-and-drop can render a "ghost" of the piece moving smoothly, with a system shadow.
- **Background blur on the chat pane** for that Apple feel.
- **Tighter scroll behavior.** iPad Safari over-scrolls aggressively even with `overscroll-behavior`; UIKit pin-to-bounds is firmer.
- **Apple Pencil precision** for kids who use one.

What we would lose: deploy from one push. The web version is on a public URL ten seconds after `git push`. Native ships in days.

For the Gauntlet brief, the web version is the right call. The roadmap to native is short if Synthesis or a hiring partner wanted to take it further.

## The polyomino game (future Boxy 2)

The original Boxy concept was a polyomino-placement puzzle where each colored edge of an anchor block carries a fraction rule and pieces dragged from a tray must satisfy the contact-edge math. That game shares the domain layer (Fraction, equivalence, simplification) and replaces only the manipulative layer. Levels would be grade-bracketed (CCSS 3.NF.A.1 through 6.NS.A.1) and procedurally generated by running the game backward from a solved board.

For Week 4 the bar manipulative was the right shape (it is what the brief asked for and what a Grade 4 student reads in 30 seconds). Boxy 2 is the natural next product if this lesson lands.
