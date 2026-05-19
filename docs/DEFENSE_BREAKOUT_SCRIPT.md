# Defense Breakout Script — Boxy Fractions

5-minute spoken defense, target 4:30 read aloud so there is a 30-second buffer. Read in front of three cohort peers. Section headers are not spoken; bracketed stage directions are not spoken.

---

## Spoken script

**[0:00 — open]**

Boxy Fractions teaches one math lesson. Fraction equivalence. One half equals two quarters equals three sixths. Same amount of box, different names.

A nine-year-old loads it on an iPad in Safari, drags a yellow 1/2 piece onto a horizontal bar, drags two blue 1/4 pieces onto a second bar, sees that they line up perfectly, and figures out the punchline on their own. The tutor calls it equivalence after the kid has felt it, not before.

**[0:30 — the architecture in one breath]**

The app is three layers. Pure value types for the math: Fraction, Bar, Piece. A Zustand store wrapping those. React components rendering off the store. No backend, no LLM. The tutor is a state machine with branches on right and wrong moves.

That sounds boring. The reason it works on an iPad in Safari is that I used pointer events through Framer Motion for drag and drop. HTML5 drag and drop is broken on iOS Safari for non-image elements. Most prototypes ship something that works on desktop and falls over the first time a kid touches it. This one runs the same code path on mouse and touch.

**[1:15 — the math is correct because the types make it correct]**

The Fraction type normalizes sign at construction. The Bar type knows whether a placement would overflow, and throws if you try anyway. Equivalence is checked by cross-product, no simplification needed. That means the kid drags a piece, the legality check runs in one frame, the animation plays, the tutor reacts. No "wait, that should not have been allowed" moments.

There is one place this rigor pays off in front of the kid. When the second 1/4 lands and lines up exactly with the 1/2 on the bar above, the equivalence panel pops up showing 1/2 = 2/4. The kid did not solve a word problem. They watched two blue boxes equal one yellow box. That is the lesson.

**[2:15 — trade-offs]**

I chose a fraction-bar manipulative over the polyomino-placement game I originally sketched. The original concept was richer, but a five-day Grade 4 prototype with a fraction equivalence target needs something a kid can read in 30 seconds. The polyomino game is documented as Boxy 2 in the iPad roadmap and shares the entire domain layer with this version.

I chose Render Static Sites over Vercel because Vercel asks for a phone number at signup and I did not have one to give. I chose the public-repo flow on Render so I did not have to install a GitHub App. The cost is no auto-deploy on push; I trigger deploys manually. For a five-day prototype that is fine. For week two I would install the GitHub App.

I chose scripted dialogue over an LLM tutor. The brief explicitly permitted this and recommended it. A scripted tutor responds in 0 ms with the exact words I tested, every time. An LLM tutor introduces a 1-2 second pause, a token budget, and the small but real chance that a kid sees something I did not vet. For a single lesson this is the wrong place to spend the AI budget.

**[3:15 — what could break]**

Hit testing is rectangle-based. If a bar ever scrolls inside a container that scrolls inside another container that transforms during a drag, the rect could lie. I register on scroll and resize, but there is no transform observer. If we ever animate bars during a drag, that needs to change.

The state machine has no save state. A page reload mid-lesson returns the kid to the welcome screen. Acceptable for a single-sitting lesson, not for a longer curriculum.

The lesson is locked to one concept. The scaffolding to add a second lesson is the state machine itself; the manipulative does not need to change. It is a small lift, not a rewrite.

**[4:00 — what landed and what is next]**

What landed: a working web app on a public URL, deployed by a Blueprint file. Tap targets audited. Touch and mouse share one code path. Fraction math is correct because the types enforce it. Scripted tutor with branching and a win screen.

What is next, if I had a sixth day: haptics on drop. A second lesson on the same shell. Polyomino Boxy 2 with grade-bracketed levels mapped to CCSS standards 3 through 6.

That is Boxy Fractions.

**[4:30 — end]**

---

## Anticipated peer questions

**Why not use react-dnd or dnd-kit instead of rolling your own hit testing?**

Both libraries treat the DOM as the source of truth for drop targets. That works great until something between the drop target and the page root has a CSS transform mid-animation, which Framer's drag does on the dragged element. Rectangle-based hit testing keyed off `getBoundingClientRect` and refreshed on scroll and resize is a five-line module that does not get in our way. dnd-kit would have added 25 KB. For a five-day prototype with one drag gesture, custom hit testing is the right call.

**You said no LLM. Why not at least an LLM for the tutor's encouragement lines?**

For a one-sitting lesson with one concept, every line of dialogue is vetted by me. An LLM is a great choice when the surface area exceeds what a person can review. Here the entire script fits in 40 lines. Vetting the script took twenty minutes and gave me a guarantee that no kid sees something I did not write. Once we add five more lessons, the calculation changes.

**How would you measure whether a kid actually learned?**

Three things. First, did they finish without using the "Clear and try again" button more than twice. Second, on the check_sixths stage, did the first piece they reach for from the 1/6 tray suggest they understood "I need more pieces than before." Third, in a follow-up session a week later, can they answer "is 2/4 the same as 1/2?" without seeing the manipulative. The first two are instrumentable today; the third needs a teacher.

**The equivalence panel feels like the tutor is telling them the answer.**

It appears AFTER they have placed the pieces. The kid saw 1/2 and saw two 1/4s line up underneath it. The panel says "here is what you just discovered." If the panel came first, this would be a worksheet. The timing is the whole game.

**What stops the kid from just dragging pieces randomly until something works?**

Nothing, and that is intentional. Exploration is the lesson. The tutor only reacts when the placement matches the goal. A kid who drags every piece onto every bar will discover the math the same way a kid who plans every move will. The tutor never says "wrong"; it says "that 1/2 piece is too big to fit on this bar right now, try a smaller one."

---

## Critique cheat sheet for peer rounds

When listening to other defenses, listen for:

- "I used HTML5 drag-and-drop." Ask if they tested on iPad. Most have not.
- "The LLM responds with..." Ask how long the round-trip takes on a school Wi-Fi connection. Ask what the kid sees during the pause.
- "It works in Chrome but I have not tested Safari yet." That is the deliverable.
- "I built it in 24 hours." Then ask about the math correctness. Most prototypes coerce floats.
- "It is a curriculum platform." It is supposed to be one lesson.

## Vote criteria mental model

The cohort votes strongest and weakest defense. The strongest defense names a specific decision and the alternative it rejected, in two sentences. The weakest defense answers every question with "great point, I had not thought of that."

## Pre-call checklist

- Live URL loads in under 5 seconds from a cold cache.
- A 1/2 piece drags smoothly on the demo machine (test once before the call).
- Chat history starts empty.
- Browser zoom at 100%.
- ARCHITECTURE.md and this script open in adjacent tabs.
