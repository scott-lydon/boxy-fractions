import { GridView } from "./ui/GridView";
import { Tray } from "./ui/Tray";
import { RulesPanel } from "./ui/RulesPanel";
import { Toolbar } from "./ui/Toolbar";
import { MessagesPanel } from "./ui/MessagesPanel";
import { HowToPlay } from "./ui/HowToPlay";

export default function App() {
  return (
    <div className="h-full w-full overflow-auto bg-slate-950 text-slate-100">
      <header className="px-4 md:px-8 pt-5 pb-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-amber-400 font-extrabold text-2xl md:text-3xl tracking-tight">Boxy Fractions</h1>
          <p className="text-slate-500 text-xs md:text-sm">
            Drop pieces so colored sides satisfy their fraction rule. Tap a placed piece to remove it.
          </p>
        </div>
        <Toolbar />
      </header>

      <main className="px-4 md:px-8 pb-8 flex flex-col lg:flex-row gap-6">
        <section className="flex flex-col gap-4 flex-1 items-center lg:items-start">
          <HowToPlay />
          <GridView />
          <MessagesPanel />
          <Tray />
        </section>
        <aside className="w-full lg:w-80 flex-shrink-0">
          <RulesPanel />
        </aside>
      </main>
    </div>
  );
}
