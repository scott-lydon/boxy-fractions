# AI Interview Prep — Boxy Fractions

[AI video interview portal](https://portal.gauntletai.com/video-interview) · [mirror](https://gauntlet-portal.web.app/video-interview)

The AI interview asks 4 questions in 5 minutes. ~75 seconds per turn, ~150 words per spoken answer. We do not know which 4 questions get pulled, so this is a broad bank sorted by likelihood. Top of file is the most-likely shape.

---

## 60-second elevator pitch (use as opener for any "tell me about this project" frame)

Boxy Fractions is a single-lesson math tutor for fraction equivalence. A nine-year-old loads it on an iPad in Safari, drags a yellow 1/2 piece onto a horizontal bar, drags two blue 1/4 pieces onto a second bar, sees they line up exactly, and the tutor names what they just discovered. Same amount of box, different names.

The build is three layers. Pure value types for the math, a Zustand store for game state, React for rendering. Drag uses Framer Motion's pointer events so iPad Safari touch and desktop mouse run the same code path. HTML5 drag-and-drop is broken on iOS Safari and most prototypes fall over there. This one does not.

The trade-off I made was scope. I shipped the canonical fraction-box manipulative instead of the polyomino-placement game I originally wanted, because the brief asks for a Grade 4 lesson a kid reads in 30 seconds.

---

## Always-asked meta questions

### "Walk me through the data flow of this feature/functionality."

The kid drags a tray piece. Framer Motion fires onDragEnd with the pointer's viewport position. DraggablePiece calls findBarAtPoint on a module-level rect registry that BarRow components keep up to date on mount, scroll, and resize. If a bar's rect contains the pointer, the store action placePieceOnBar runs. The action pulls the Piece from the PIECES constant, checks Bar.wouldOverflow, and either appends a tutor hint into the message log or builds a new Bar with the piece appended.

Then checkAdvance runs. It looks at the current stage's advanceWhenBarsMatch condition, asks the targeted bar for its filledFraction, and checks equivalentTo the target. If they match, it queues the success message and the next stage's intro lines into the chat. The Zustand subscription triggers re-render. Framer's AnimatePresence plays the entry animation on the new piece and the new chat lines. End to end, about 16 milliseconds.

### "What would you do differently next time, or if you had more time?"

Two things. First, I would build an automated test pass for the lesson flow. Today the manual test plan in docs/MANUAL_TESTS.md is the source of truth. The lesson state machine and the fraction math both lend themselves to unit tests; I just did not get there in five days. Vitest is installed, the scaffolding is one config file away.

Second, I would set up Render's GitHub App instead of using the public-repo flow. Right now I trigger deploys manually because the public-repo flow does not support auto-deploy on push. That is fine for a five-day prototype. For anything longer-lived I want push-to-deploy back.

If I had a sixth day I would also add haptics on drop and a second lesson on comparing fractions. The state machine supports it; only the script changes.

### "What did you find challenging?"

Two things. First, scoping. The brief is "one lesson" and my instinct was to design a curriculum. The discipline was deleting four lessons from my sketch and shipping the one that actually teaches. The polyomino-placement game I originally wanted is documented as future work and shares the domain layer, so the work is not wasted, just deferred.

Second, iPad Safari drag. I tested on desktop first, drag worked great, and I almost shipped. Then I loaded it on a real iPad and the page scrolled instead of dragging because I had not set touch-action: none on the draggable elements. That bug class is invisible on a desktop and trivial on an iPad. The fix was one CSS line; the lesson was "ship to the actual deliverable surface every day, not on the last day."

---

## Four rubric-pillar questions

### Architecture: "Walk me through your architecture decisions."

Three layers, smallest to largest. Domain types in src/domain are pure value objects with no UI knowledge. Fraction, Bar, Piece, the Lesson state machine. Every invariant lives here, every throw points back to its caller with a message that names the bug.

The store layer is one Zustand store. It owns the bars, the stage, the chat log, the counters. Actions are named, updates are immutable. The store never calls into the DOM and never imports from src/ui.

The UI layer is dumb React components that subscribe to slices of the store via Zustand selectors. They render and dispatch. No business logic in JSX. The drag-and-drop hit testing is one 30-line module that keeps a map of bar bounding rects up to date.

The reason this matters: when the kid drops a 1/4 piece on Bar B, the Bar value object decides whether the placement is legal, not the click handler. Bugs surface in domain code with a stack trace I can read.

### Scalability: "How would this scale to more lessons or more students?"

The lesson state machine is data, not code. LESSON_SCRIPT is a readonly array of stages. Adding a second lesson on "comparing fractions" or "adding fractions" is a new entry in that array; the manipulative does not change. The Bar type already supports any unit fraction up to the limit of integer overflow, which is well past any kid-relevant denominator.

For more students at once, the app is a static site. There is no server, no database, no per-user state. Render serves it from a CDN. We could be sitting at a hundred thousand concurrent kids with no architecture change; we would just need a custom domain and a slightly bigger Render tier.

The shape that does not scale is the dialogue script as a TypeScript constant. At 5 lessons it is fine; at 50 lessons I would move scripts to JSON files and load them dynamically. That is a half-day refactor when we get there.

### Security: "What are the security considerations?"

The app is a static client-side bundle with no backend, no auth, no database, no user data, no cookies, no LLM, no network calls beyond the initial HTML and JavaScript fetch. The attack surface is the size of the bundle and the host serving it.

The interesting risks are content risks, not technical. The tutor script is hand-vetted because I wrote every line. There is no LLM that could produce a sentence I did not approve. The drag-and-drop has no upload path, no URL parsing, no eval. The only third-party scripts are Tailwind via PostCSS at build time and Framer Motion in the bundle.

For the iPad use case in classrooms, the relevant concerns are physical: a kid leaving the iPad on a public Wi-Fi, the page being framed inside another site. The mitigation is the same as for any static web app: HTTPS only via Render, no cookies to leak, no auth tokens because there is no auth.

### Testing: "How did you test this?"

Manual test plan in docs/MANUAL_TESTS.md, with eight happy-path cases, three overflow cases, three reset cases, seven iPad Safari cases, and three edge cases. I run the full pass on every push before declaring a build demo-ready.

The math is testable because the Fraction and Bar types are pure value objects. Vitest is installed and configured. I have not yet written the unit tests because the domain layer is simple enough that a manual integration pass catches everything; that is honest scope management for five days, not a missing testing discipline. When the codebase grows beyond one lesson, the test suite becomes load-bearing.

The iPad pass is the part you cannot fake. The brief says "must run on iPad Safari." I test on a real iPad in portrait and landscape on every meaningful change.

---

## Anticipated AI follow-ups

### Q1 follow-up: "Why not use react-dnd or dnd-kit?"

Both treat the DOM as truth for drop targets, which works until something between the drop target and the page root has an active CSS transform mid-animation. Framer's drag transforms the dragged element, so DOM hit-testing during a drop can lie about coordinates. Rectangle-based hit testing keyed off getBoundingClientRect and refreshed on scroll and resize is a five-line module that does not have that failure mode. dnd-kit would have added 25 KB to a 330 KB bundle. For one drag gesture, custom is the right call.

### Q2 follow-up: "You said the polyomino game is future work. Why didn't you just build it?"

Because the brief says "single lesson on fraction equivalence" and the canonical Grade 4 manipulative for that concept is a bar model, not a polyomino board. A nine-year-old reads a bar in 30 seconds and a polyomino board in two minutes. For a five-day prototype that has to land with an actual kid, the bar is the right shape. The polyomino game would have been a better demo for an architecture interview and a worse lesson for a kid. I optimized for the kid.

### Q3 follow-up: "Walk me through what happens if the kid never figures it out."

The tutor never tells them the answer. It also never says "wrong." If the kid drops a 1/2 piece on a bar that cannot fit it, the tutor says "that piece is too big to fit on this bar right now, try a smaller one." That is the only negative-feedback line in the script. Otherwise the tutor waits. The bar shows them what they did. Eventually they try something else. The lesson does not advance until the goal is met, and the goal is met by dragging, not by clicking a button. If the kid gives up, that is a teaching signal we would log in a future version.

### Q4 follow-up: "How do you know the manual test pass is enough?"

I do not. It is enough for a five-day single-lesson prototype because the surface area is small. Eight happy-path cases plus a dozen edge cases covers every state transition. The day we add a second lesson, the cross-product of states explodes and Vitest becomes load-bearing.

---

## Backup bench (in priority order)

### "What does the kid actually do, click by click?"

They load the page. Tutor says hi, tap "Let's go!" to start. Drag the yellow 1/2 piece onto Bar A. Tutor reacts. Drag a blue 1/4 piece onto Bar B. Drag a second 1/4. The equivalence panel appears showing 1/2 = 2/4. Tap "Yes!" to continue. Bar B clears, tray shows only green 1/6 pieces. Drag three 1/6 pieces onto Bar B. Win banner: 1/2 = 2/4 = 3/6. Tap "Play again" to reset.

### "What was the most important technical decision?"

Pointer events through Framer Motion instead of HTML5 drag-and-drop. That is the call that made iPad Safari work at all. Everything else is downstream.

### "How does the app know when to advance the lesson?"

Each stage in LESSON_SCRIPT declares either choices (a click button advances) or advanceWhenBarsMatch (a bar reaching a target fraction advances). The store runs checkAdvance after every placement. If the target bar's filledFraction equivalentTo the target, the success message goes into the chat and the next stage's intro lines follow.

### "What is the slowest thing in the app?"

The initial bundle parse. 330 KB of JavaScript, 105 KB gzipped, parses in about 80 milliseconds on a recent iPad. Once parsed, every interaction is local state, no network.

### "What dependency would you remove first if you had to?"

Framer Motion. It is 60 KB and we use about a third of it. A hand-rolled drag would be 30 lines. We keep it because it gives us AnimatePresence for the chat messages and the equivalence panel, and the polish is worth the bytes. The day Framer breaks something, we have an exit plan.

### "How would you deploy this to ten thousand kids?"

Same way as now. Static site on Render's free tier serves about 100 GB of bandwidth per month, which is roughly a million page loads at our bundle size. Past that, custom domain plus Render Cloud Front-class CDN or move to Cloudflare Pages. The app does not change.

### "What if the kid plays with the manipulative outside the lesson order?"

Nothing breaks. The tutor only reacts to actions that match the current stage's advance condition. A kid who drags every piece onto every bar will eventually drag the right piece to advance, or will be told the piece is too big. The lesson is not a maze; it is a sandbox with a goal.

### "How do you handle the case where the kid's network drops?"

The app is fully loaded after the first request. No further network calls. The kid can finish the lesson offline.

### "What was AI-assisted and what was you?"

The architecture was my decision (the three-layer split, the rectangle hit testing, the pointer events choice, the bar manipulative over polyomino). The script for the tutor was my writing, line by line. The implementation was AI-assisted; Claude wrote large portions of the React components and the Zustand store under my direction, and I reviewed every commit. Commit ae685c8 is the initial scaffold, attributed via the "Assisted-by: Claude Code" trailer.

### "What is one thing this prototype does that production Synthesis does not?"

Honestly, nothing. Synthesis is a fully built product with adaptive difficulty, voice, hundreds of lessons, and student accounts. This is a single lesson prototype. The thing this prototype demonstrates is that the core Synthesis interaction model, a chat tutor next to a manipulative, can be reproduced from scratch in five days using web-native primitives.

---

## Escalation block

If a rebuttal does not land:

"You're right that an LLM tutor would be more flexible. The brief specifically says scripted dialogue is acceptable, and for a single 5-minute lesson with vetted content, scripted gives us 0-ms response time and a guarantee of safe content. The day we add ten more lessons, the calculation flips."

"Fair. If I were grading this, I would also push on the test coverage. Manual test plan in docs/MANUAL_TESTS.md is the truth today; Vitest is configured but not populated. That is honest scope management for five days, not a testing philosophy."

"Yes, the polyomino game is more interesting. The bar manipulative is what the brief asked for and what a Grade 4 student reads in 30 seconds. I optimized for the user, not the demo."

## Moment-of-truth block (defending AI-assisted decisions)

If asked "did the AI make decisions for you," the answer is no. The architecture decisions (three-layer split, rect-based hit testing, pointer events, bar over polyomino) were mine. Claude wrote large portions of the React components under my direction; I reviewed every commit. Commit ae685c8 is the initial scaffold with an "Assisted-by: Claude Code" trailer per the Gauntlet conventions. If we ever need to replay the audit trail, every change is in the git log.

## Things to NOT say

- "The AI decided to..." (No. I decided. The AI typed.)
- "I didn't really test it..." (Wrong. Manual test plan exists.)
- "It just works in Safari, I think." (Test it before the interview.)
- "I'm not sure why I chose Render." (You know why: no phone number at signup.)
- "Originally I wanted to build something bigger but..." (Lead with what is shipped, not what isn't.)
- Any em-dash or en-dash mid-sentence. Use commas and periods.
- "Specifically," "Concretely," "Notably" as sentence openers.
