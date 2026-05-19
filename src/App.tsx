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
          <h1 className="text-slate-100 font-semibold text-3xl md:text-4xl tracking-tight">
            Boxy <span className="text-amber-300">Fractions</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md">
            Drop pieces so colored sides satisfy each color's fraction rule.
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
