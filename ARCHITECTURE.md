# Architecture

Boxy Fractions is a single-page web app that teaches one lesson: fraction equivalence. The architecture is deliberately small because the brief is small. Three things had to be true: the math had to be correct, the drag-and-drop had to work on iPad Safari, and the tutor script had to feel like a person, not a wizard.

## Layered model

The code splits into three layers:

1. **Domain.** Pure value objects with no UI awareness. `Fraction`, `Bar`, `Piece`, and the lesson state machine. Every invariant lives here. The domain throws clear exceptions on misuse so a UI bug surfaces with a stack trace that names the offending call site.
2. **Store.** Zustand. Wraps the domain in a single observable state container. Exposes named actions (`placePieceOnBar`, `clearBar`, `acceptChoice`). Updates are immutable. Stage transitions and bar-clear-on-enter hooks live here.
3. **UI.** React components that subscribe to slices of the store via Zustand selectors. Components are deliberately dumb. They render and dispatch, nothing else.

No data fetching. No backend. The lesson is fully client-side; there is nothing to authenticate.

## Domain types

`Fraction` is the foundational value type. Two things it does that pay rent every day: it normalizes the sign onto the numerator at construction, and it can answer `equivalentTo(other)` via cross-product without ever simplifying. That keeps the legality checks fast and free of intermediate `Fraction` instances.

`Bar` is an immutable list of placed pieces with one derived value (`filledFraction()`). The reducer in `filledFraction()` does fraction addition the textbook way, then simplifies once at the end. Throwing on overflow forces every drop handler to gate on `wouldOverflow()` first. The kid never sees a broken animation because the legality check ran one frame too late.

`Lesson.ts` exports `LESSON_SCRIPT` as a readonly array of stages, each with a script, an optional list of `choices`, an optional list of `availablePieceIds`, and either a click-button advance (`choices`) or a manipulative-driven advance (`advanceWhenBarsMatch`). Tutors that try to teach more than one thing at a time tend to teach nothing. Boxy Fractions teaches exactly one.

## Drag and drop

Framer Motion's `drag` prop uses pointer events under the hood. Pointer events unify mouse, touch, and pen across desktop and iPad Safari. This is the only drag system in modern browsers that does so consistently. HTML5 `draggable` is unreliable on iOS Safari for non-image elements and was rejected.

`DraggablePiece` is the only component that dispatches placements. On `onDragEnd` it reports the pointer's viewport coordinates. `findBarAtPoint(x, y)` in `src/ui/barRects.ts` returns the bar index whose registered rect contains that point, or `null`. The rect registry is a module-level `Map<number, DropRect>`, updated by each `BarRow` on mount, resize, and scroll. Keeping the registry out of the Zustand store means a window resize does not re-render the world.

The piece snaps back to its tray position via `dragSnapToOrigin`. The tray never empties. A placement is a "copy onto bar", not a "move from tray". This matches the way physical manipulatives work in classrooms.

## Tutor state machine

Stages are nodes. Transitions are edges. The edges are either:

- a click on a button in chat (declared in the stage's `choices` array), or
- a bar reaching a target fraction (declared in `advanceWhenBarsMatch`).

When a placement updates a bar, `checkAdvance()` in the store walks the current stage's advance condition and, if it matches, queues the success message and the next stage's intro lines into the chat. The chat scroller follows.

Some stages clear bars on entry via `onEnterClearBars`. This lets the script say "I cleared bar B for you" and have that be literally true.

## Why a "fraction box" manipulative and not the polyomino-placement game

The user's first sketch was a polyomino-placement game (Boxy) with fraction rules attached to colored edges. That game is great. It is not the Synthesis brief. The brief asks for a "fraction box the student can poke, combine, split, and smash" and the most legible kid-facing version of that is a horizontal bar with snap-in unit-fraction pieces. The polyomino game is documented as future work in the iPad roadmap; the bar manipulative is the right shape for a five-day Grade 4 prototype.

## Performance

The build is 330 KB of JavaScript and 11 KB of CSS, both gzipped to about 110 KB and 3 KB respectively. The app is interactive on first paint because the bundle is the whole product; there is no follow-up fetch. Framer's tree-shaking removes the unused gesture primitives. We do not need Suspense; the lesson is a single chunk.

Drag updates run at 60 fps on a 2018 iPad Pro because the only thing that moves during a drag is one transform on the dragged element. Re-renders are bounded to a single `<motion.div>` and its parent tray.

## Failure modes and observability

Every domain method throws a typed `Error` with a message that names the offending input, the invariant that was violated, and the most likely root cause. Example: `Fraction denominator cannot be zero (numerator was 5). Bug: a divide-by-zero reached this code path...`. When something breaks, the stack trace plus the message is enough to find the bug without a debugger.

The app has no telemetry pipeline today. For a longer-lived deployment, error reports would go to a hosted Sentry or similar; the wiring is one constructor and a few lines in `main.tsx`.

## Future directions

The polyomino Boxy game would replace the bar manipulative with an n × n grid and pentomino-style pieces, with the fraction rule attached to colored edges of anchor blocks rather than to a target bar fill. That game shares the entire domain layer (Fraction, equivalence, simplify) and replaces only the UI layer. The lesson script becomes a curriculum of grade-bracketed levels with the Common Core mapping already documented in `lecture-flashcard-ledger.md`.
