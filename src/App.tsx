import { GridView } from "./ui/GridView";
import { Tray } from "./ui/Tray";
import { RulesPanel } from "./ui/RulesPanel";
import { Toolbar } from "./ui/Toolbar";
import { MessagesPanel } from "./ui/MessagesPanel";
import { HowToPlay } from "./ui/HowToPlay";

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

      <main className="px-6 md:px-12 pb-16 flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">
        <section className="flex flex-col gap-8 flex-1 items-center lg:items-start">
          <GridView />
          <MessagesPanel />
          <Tray />
          <HowToPlay />
        </section>
        <aside className="w-full lg:w-72 flex-shrink-0">
          <RulesPanel />
        </aside>
      </main>
    </div>
  );
}
