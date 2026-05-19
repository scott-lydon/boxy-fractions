import { Manipulative } from "./ui/Manipulative";
import { Chat } from "./ui/Chat";

export default function App() {
  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-950">
      <header className="md:hidden p-3 border-b border-slate-800 text-center">
        <h1 className="text-amber-400 font-extrabold text-xl tracking-tight">Boxy Fractions</h1>
      </header>
      <aside className="md:w-80 lg:w-96 md:h-full h-56 md:border-r border-b md:border-b-0 border-slate-800 flex flex-col">
        <Chat />
      </aside>
      <main className="flex-1 flex items-center justify-center p-3 md:p-6 overflow-auto">
        <Manipulative />
      </main>
    </div>
  );
}
