import { GridView } from "./ui/GridView";
import { Tray, Dropped } from "./ui/Tray";
import { RulesPanel } from "./ui/RulesPanel";
import { Toolbar } from "./ui/Toolbar";
import { MessagesPanel } from "./ui/MessagesPanel";
import { HowToPlay } from "./ui/HowToPlay";

/**
 * Two-column layout: TEXT on the left, INTERACTION on the right.
 *
 * Per the design sketch — and matching the SuperBuilders guidance the user
 * referenced — instructional surfaces (Rules, How-to-play, in-flight
 * feedback messages) live in one column and the live game surfaces (the
 * grid, the Parts basket, the Dropped basket) live in the other. The
 * earlier layout interleaved them: Rules on the right but Grid + Tray +
 * How-to-play stacked on the left meant the student had to bounce between
 * a text panel on one side and a column that mixed text and interaction on
 * the other.
 *
 * On narrow screens the two columns stack (text first, then interaction)
 * so a phone reader still sees the rule context above the grid, which is
 * the priority order when scrolling is unavoidable.
 */
export default function App() {
  return (
    <div className="h-full w-full overflow-auto text-slate-100">
      <header className="px-6 md:px-12 pt-8 pb-6 flex items-center justify-between gap-6 flex-wrap max-w-6xl mx-auto">
        <div>
          <h1
            className="font-semibold text-3xl md:text-4xl tracking-tight"
            style={{ color: "#e8e0cc" }}
          >
            Boxy{" "}
            <span style={{ color: "#e6c879" /* dusty honey, matches yellow rule */ }}>
              Fractions
            </span>
          </h1>
          <p className="text-sm mt-1.5 max-w-md" style={{ color: "rgba(212, 200, 178, 0.55)" }}>
            Place pieces so touching pieces share one of the count ratios in the rules panel.
          </p>
        </div>
        <Toolbar />
      </header>

      <main className="px-6 md:px-12 pb-16 grid gap-10 max-w-6xl mx-auto lg:grid-cols-[18rem_1fr]">
        {/* TEXT column — the things the student READS. Rules, then the
            paged how-to-play. On narrow screens this column comes first so
            scrolling readers get the rule context before the grid. */}
        <aside className="flex flex-col gap-8 order-1 lg:order-1 min-w-0">
          <RulesPanel />
          <HowToPlay />
        </aside>

        {/* INTERACTION column — the things the student DOES. Grid up top,
            in-flight feedback message underneath, then the two baskets side
            by side (Parts where you pick from, Dropped where what you spent
            sits). The two baskets are arranged in a tight grid so the
            "alive vs spent" comparison is one glance, not a scroll. */}
        <section className="flex flex-col gap-6 order-2 lg:order-2 items-start min-w-0">
          <GridView />
          <MessagesPanel />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Tray />
            <Dropped />
          </div>
        </section>
      </main>
    </div>
  );
}
