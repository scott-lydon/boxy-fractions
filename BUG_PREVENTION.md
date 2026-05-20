# Bug / issue prevention — Boxy Fractions

Running checklist of past incidents and the rules they spawned. Every new
feature should be reviewed against this list before merge so the same bug
class does not re-appear. Cross-reference the global checklist at
`/Users/scottlydon/Documents/Claude/Projects/BUG_PREVENTION.md`.

## S — Spec & stack discipline

### S1. Verify the assignment's stack constraints (and the user's account constraints) before scaffolding

**Issue (2026-05-18).** Initial scaffold proposed SwiftUI because the
user's preferences default to Swift. The Gauntlet "Hiring Partner"
brief is a web project. User asked, "swiftui? Is that what the
assignment calls for? Do research on superbuilders, and let me know if
you think swiftui is the right call." A second round had Vercel chosen
as the deploy target; user replied, "We can't use vercel because they
require a phone number I don't have." Two separate ratchets for the
same mistake: picking the stack from a global default without grepping
the spec or the user's account constraints.

**Prevention.** Before any scaffold step, do three explicit reads:
(1) the assignment doc, surfacing every line that names a stack,
runtime, framework, or platform, (2) the user's stated personal
preferences for any constraint that disqualifies a SaaS (phone number,
region, VPN, payment, age verification), (3) the user's other parallel
projects (openemr, adversary, akin) to mirror their established stack
choices when the assignment is silent. Write a one-line rationale next
to the chosen stack ("Vite + React because the assignment says
'browser-based' and Render works without a phone number"). If the
rationale is "the user's global default", that is a failure mode,
re-read.

### S2. Transcribe reference images into a written spec before writing code

**Issue (2026-05-18).** User uploaded screenshots of the Boxy game
they had invented (grid, rules, parts with NSEW colors, an answer
reveal). First implementation rendered loosely-related squares but
missed the rule blocks, the per-side colors on parts, the count
labels, and the answer reveal. User: "I have no idea what this is...
Did you look to the pictures I sent? I don't see the game that I
invented in any way shape or form."

**Prevention.** When the user uploads images that describe the
intended UI or mechanic, the first artifact is a numbered written
transcription saved as `docs/SPEC_FROM_IMAGES.md` (or appended to
`ARCHITECTURE.md` if it already exists). Each visible element, label,
arrow, and caption becomes a numbered bullet. The implementation then
ticks each item off in the PR description. Concretely for Boxy: every
new game-mechanic PR must list "grid present", "rules block present",
"parts have NSEW colors", "parts show box count", "answer reveal
present", "ratio explained at the rule and on the part". Missing items
fail the PR, not a future review round.

## D — Discoverability & affordance

### D1. The thing the student is being asked to think about must not be solvable by surface cues

**Issue (2026-05-18).** Parts in the tray rendered with their NSEW
colors already painted. The user wrote, "the parts that can be dragged
on already have their color on them and because the parts are too
unique, the student can sidestep the challenge by recognizing how the
pieces fit." A follow-up reinforced it: "the student can keep trying
until it works without thinking."

**Prevention.** For each interactive learning task, write one line in
the component header: "the student is being asked to think about X."
Then enumerate every visible cue on the screen and ask, "does this cue
make X visible without the student thinking about it?" Any cue that
does is removed, hidden behind a reveal, or replaced with a neutral
encoding (number only, no shape distinction; uniform shape, no color;
etc). A unit test asserts the rendered tray shows no per-side color on
parts in the tray.

### D2. UI that does not communicate its required input is a bug, not user error

**Issue (2026-05-18).** User repeated across two sessions: "I'm still
having trouble with it. It isn't making sense to me yet. Maybe I'm
missing something. If I'm missing something, we need to have the ui
make it more obvious."

**Prevention.** Treat "I don't know what to do here" as a UI defect.
Before closing a UI ticket, run the screen by a fresh reader (the
qa-adversary subagent counts) with the prompt, "without reading the
README, describe what you are supposed to do on this screen." If the
reply omits any required action, the screen fails. Every interactive
control needs (a) a visible label or icon, (b) a one-line instruction
at the top of the section, (c) an example or animated hint that the
first action triggers.

## M — Math, rules, and solvability

### M1. Ratio rules must label both quantities and units at the rule and at the part

**Issue (2026-05-18).** Rule rendered as "3/5" with no indication of
whether the numerator was the placed part's box count, the new part's
box count, side-touching boxes, or total boxes. User: "I have no idea
what smaller larger is about, there is no reason why the numerator
can't be larger than the denominator as well."

**Prevention.** Every ratio rule in the UI carries both the units and
the direction explicitly: "placed boxes / new boxes = 3 / 5" with
"placed = 5 boxes" and "new = 3 boxes" labels next to the candidate
piece. No "larger / smaller" language. A unit test parses the rendered
rule string and asserts both labels are present.

### M2. Every puzzle must be solvable; verify by solving it programmatically before shipping

**Issue (2026-05-18).** Rule said placed/new = 3/5; the only placeable
quantity satisfying it with a current 5-box piece would be 25/3 = 8.33
boxes. No part in the tray had a count that satisfied any rule. User
walked through the math: "5 * 5 / 3 = x or 25/3 or 8.3. None of the
blocks match that count in any way shape or form."

**Prevention.** The puzzle generator and the candidate-set validator
share the same rule predicates. Before a puzzle is committed to a
level, a `validatePuzzle(rules, pieces)` function enumerates the
candidate set and asserts at least one valid placement exists for each
rule. A test fixture covers every level and asserts non-empty
candidate sets per rule.

## L — Layout & panels

### L1. Answer / detail panels must pin to the viewport with a scrollable body, not follow window growth

**Issue (2026-05-18).** Answer panel grew with the window; content
below the fold remained clipped regardless of resize. User: "I can't
see the answers below because they cut off by the window even if I
expand the window it moves with it. Please fix that."

**Prevention.** Any panel intended to be fully readable uses fixed
viewport positioning (`position: fixed` with `inset: 0` and a max
height of `100dvh`) and wraps its body in a scroll container. A
Playwright or Vitest DOM test resizes the viewport to 600x400 and
asserts the panel's overflow yields a scrollbar, never clipped text.

### L2. One notification at a time, with a visible dismiss control

**Issue (2026-05-18).** Multiple toasts stacked simultaneously, and
the user could not dismiss them. User: "We should only have one at a
time and a way to dismiss it." Resolved in commit `e962ba0`.

**Prevention.** Notifications go through a single queue component that
displays one item at a time and queues the rest. Every notification
ships with a dismiss button (visible "X" plus `aria-label="Dismiss"`).
A render test asserts only one notification is in the DOM when two
are enqueued.

## R — Regressions

### R1. A change that drops a previously-stated behavior is a regression even when the change report does not call it one

**Issue (2026-05-18).** A later edit caused parts in the basket to
render filled instead of blank, undoing a deliberate earlier choice.
User: "Also the parts basket should have them blank so that was a
regression of sorts. please update whatever misguided you to make
that regression."

**Prevention.** Every PR carries a "behavior watch list" in its
description: behaviors the user has explicitly asked for in earlier
chats, with one line each. Before merging, grep the diff against each
watch-list item and confirm the diff does not undo it. Tests pin the
ones that can be asserted programmatically (basket renders parts with
no per-side color, etc).

## Q — QA loop discipline

### Q1. The qa-adversary review fires on every assignment-touching code change unless the user explicitly tells you to hold off

**Issue (2026-05-18).** User asked twice in two sessions: "In
previous chats I asked you to create a QA flow of sorts that has a
separate context and reviews the deployed version. Did you run that?
or not" and later "You should be running qa adversary every time you
add/modify or create code from an assignment unless I explicitly tell
you to hold off. What do you need to do to ensure that happens?"

**Prevention.** Add a project-local `CLAUDE.md` rule at the Boxy repo
root stating: "after any Edit/Write to files under `src/`, the next
action is a qa-adversary subagent invocation against the deployed
URL." Implement the trigger as a git pre-push hook so it cannot be
forgotten on a deploy push: the hook spawns the subagent and posts the
review to a `qa-reviews/<sha>.md` file. The commit lands only when the
review file is non-empty.

## T — Tooling fallbacks

### T1. Do not fall back to a paste-block when the cowork-terminal MCP is available

**Issue (2026-05-18).** User: "I thought you said terminal is alive.
Why are you giving me terminal commands?" The session had access to
`mcp__cowork-terminal__execute_command` but Claude rendered a copy
block for the user to paste into Terminal anyway.

**Prevention.** Before emitting a paste-block, confirm one of the
listed terminal fallbacks has failed with a concrete error: (1)
`mcp__cowork-terminal__execute_command` returned a non-zero exit and
the error is not "workspace still starting", (2) the bridge
`mcp__claude-code-bridge__delegate_to_claude_code` returned an error
that is not a 401 auth issue. On a fresh session, the first
cowork-terminal call may report "workspace still starting"; retry once
after 3 seconds before falling through.

## G — Gitflow & multi-repo

### G1. New Gauntlet projects mirror the gitflow of the user's existing parallel projects

**Issue (2026-05-18).** Initial Boxy scaffold created only a GitHub
repo; the Gauntlet brief requires a GitLab mirror in parallel and
matching branch protections. User: "Remember for this Gauntlet project
scope we also need a gitlab repo in parallel to the github repo. Look
to the openemr project for their gitflow strategy."

**Prevention.** Before `git init` on any Gauntlet-scoped project,
read the `.gitlab-ci.yml` and `.github/workflows/` of openemr and
adversary, then mirror the chosen pattern: GitHub primary with GitLab
mirror, `main` protected, feature branches via PR, paired CI in both.
A scaffold script at `scripts/gauntlet-init.sh` automates the two
remotes, the branch protections, and the CI templates so the choice
is not a per-project remembered step.
