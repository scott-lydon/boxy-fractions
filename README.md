# Boxy Fractions

A Synthesis-style math tutor for a single lesson: **fraction equivalence**. A 9-year-old can run it on an iPad in Safari and discover that 1/2 = 2/4 = 3/6 by stacking boxes.

Live: https://boxy-fractions.pages.dev

Gauntlet Week 4 submission.

## What it is

Two panels, one lesson:

- **Chat tutor on the left.** Scripted, warm, branches on right and wrong moves. No LLM. Synthesis-style cadence.
- **Fraction-box manipulative on the right.** Two horizontal "bars" (each represents one whole). Drag unit-fraction pieces (1/2, 1/3, 1/4, 1/6) from the tray onto a bar. Pieces snap left to right. Tap "Clear" to reset a bar.

The lesson walks the kid through three discoveries: 1/2 is half of a whole, two 1/4 pieces fill the same length as one 1/2 piece, and three 1/6 pieces do the same. The equivalence panel and win banner appear when the kid has felt it.

## Run it locally

```
npm install
npm run dev
```

App runs on `http://localhost:5173`. Tested on Chrome, Safari, and iPad Safari.

## Build for production

```
npm run build
```

Builds to `dist/`, which is published to Cloudflare Pages:

```bash
npm run build
npx wrangler pages deploy dist --project-name boxy-fractions --branch main
```

Moved off Render on 2026-09-03. That account was suspended for non-payment and
the service was then deleted, so `https://boxy-fractions.onrender.com` returns
404 and is not coming back. The
`render.yaml` in this repository is kept only as a record of how the site used to
be built; nothing reads it any more.

Cloudflare Pages is free for this, with no per-site charge, which is the point:
this is a graded submission that has to keep resolving long after anyone stops
paying attention to it.

## Technical approach

- **Vite + React 19 + TypeScript.** Fast dev loop, native ESM, types are first-class.
- **Tailwind CSS v3.** Utility classes only, no custom stylesheet beyond base resets.
- **Framer Motion** for drag and drop. The drag uses pointer events under the hood, which means iPad Safari touch and desktop mouse run the same code path. We do not use HTML5 drag and drop because iOS Safari support is broken for non-image draggables.
- **Zustand** for the game state. One store, immutable updates, no providers.
- **Domain types** (`src/domain/`) own the rules. `Fraction` is a value object with `simplified()` and `equivalentTo()`. `Bar` is an immutable container that knows whether a placement would overflow. `Lesson.ts` is the state machine for the tutor script. UI components are dumb renderers over these types.
- **Drop detection** is rectangle-based, not DOM-based. Each `BarRow` registers its bounding rect in `src/ui/barRects.ts` on mount and on resize. The drag handler looks up the bar under the pointer at drop time. This avoids the cross-element hit-testing fragility of `elementFromPoint` and works during Framer's transform animations.

See `ARCHITECTURE.md` for the full design, `docs/IPAD_ROADMAP.md` for the iPad tap-target audit and future-work plan, `docs/MANUAL_TESTS.md` for the manual test plan, `docs/DEFENSE_BREAKOUT_SCRIPT.md` for the 5-minute cohort defense, and `docs/AI_INTERVIEW_PREP.md` for the AI video interview bank.
