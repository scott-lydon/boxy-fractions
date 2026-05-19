# Manual Test Plan

Boxy Fractions has no automated test runner yet. These are the manual cases I run before declaring a build demo-ready. Each is short, repeatable, and worth wiring up to Vitest later.

Run against the live URL: https://boxy-fractions.onrender.com

## Happy-path lesson flow

| # | Action | Expected |
| --- | --- | --- |
| H1 | Load the page in a desktop browser at 1280 × 800. | Chat is in a left rail. Manipulative fills the right. Tutor's welcome message appears, "Let's go!" button visible. |
| H2 | Tap "Let's go!" | Chat advances to "explore_halves". The 1/2 (yellow) piece appears in the tray. |
| H3 | Drag the 1/2 piece onto Bar A. | Piece lands in Bar A. Tutor says "Nice. The 1/2 piece covers exactly half of the box." The 1/4 piece appears in the tray. |
| H4 | Drag a 1/4 piece onto Bar B. | Piece lands in Bar B. No stage advance yet. |
| H5 | Drag a second 1/4 piece onto Bar B. | Piece lands. Tutor says "Whoa. Two 1/4s line up exactly with one 1/2." Equivalence panel appears showing 1/2 = 2/4. |
| H6 | Tap "Yes!" | Bar B clears. Tray shows only the 1/6 piece. Tutor asks how many sixths equal 1/2. |
| H7 | Drag three 1/6 pieces onto Bar B. | After the third drop, win banner appears. Tutor recites "1/2 = 2/4 = 3/6". |
| H8 | Tap "Play again". | App resets to welcome stage. |

## Overflow handling

| # | Action | Expected |
| --- | --- | --- |
| O1 | At "see_quarters" stage, drag a 1/2 piece onto Bar B (already has 1/4). | Piece does not place. Tutor warns "That 1/2 piece is too big to fit on this bar right now." |
| O2 | Fill Bar A completely with two 1/2 pieces. Then drag a 1/4 onto Bar A. | Piece does not place. Tutor warns about size. |

## Clear button

| # | Action | Expected |
| --- | --- | --- |
| C1 | Place 1/4 + 1/4 on Bar B, tap Clear (Bar B). | Bar B empties. Pieces remain in tray. |
| C2 | Tap Clear on an already-empty bar. | No-op, no errors. |

## Reset

| # | Action | Expected |
| --- | --- | --- |
| R1 | After winning, tap "Play again". | All bars clear. Chat history clears. Tutor sends welcome message. |

## iPad Safari (the actual deliverable)

| # | Action | Expected |
| --- | --- | --- |
| I1 | Open the URL on iPad in portrait. | Chat is a strip across the top. Manipulative fills the rest. No horizontal scroll. |
| I2 | Drag a tray piece. | Page does not scroll. Piece follows the finger. |
| I3 | Release a piece outside any bar. | Piece animates back to the tray. |
| I4 | Release a piece inside a bar. | Piece lands. Tutor reacts as in H3-H7. |
| I5 | Rotate to landscape. | Chat moves to the left rail. Layout reflows without losing state. Drop targets re-register. |
| I6 | Long-press a piece. | No iOS context menu (callout suppressed). Drag begins normally on movement. |
| I7 | Two-finger pinch on the bar area. | Page does not zoom (viewport meta tag). |

## Edge cases that have bitten me before (add new ones as we hit them)

| # | Action | Expected |
| --- | --- | --- |
| E1 | After a window resize during a drag. | Drop hit-testing still works. (`barRects` listens to resize and scroll.) |
| E2 | Drop a piece exactly on the boundary between two bars. | The bar whose rect contains the pointer wins. No ambiguous double-place. |
| E3 | Page reload in the middle of the lesson. | App returns to welcome stage (no persistence by design). |

## Cross-submission test inventory

Add a new row here every time the user reports an issue they found by hand. The format makes the bug regression-checkable.

(no entries yet)
