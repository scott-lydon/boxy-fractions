import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { getStage } from "../domain/Lesson";

export function Chat() {
  const messages = useGameStore((s) => s.messages);
  const stage = useGameStore((s) => s.stage);
  const acceptChoice = useGameStore((s) => s.acceptChoice);
  const startLesson = useGameStore((s) => s.startLesson);
  const stageDef = getStage(stage);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startLesson();
  }, [startLesson]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <header className="p-3 border-b border-slate-800 hidden md:block">
        <h1 className="text-amber-400 font-extrabold text-xl tracking-tight">Boxy Fractions</h1>
        <p className="text-slate-500 text-xs">Fraction equivalence (Grade 4)</p>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={
                m.speaker === "tutor"
                  ? "bg-slate-800 text-slate-100 p-2.5 rounded-2xl rounded-bl-sm max-w-[88%] text-sm leading-snug"
                  : "bg-amber-500 text-slate-900 p-2.5 rounded-2xl rounded-br-sm max-w-[88%] ml-auto text-sm font-semibold leading-snug"
              }
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {stageDef.choices && stageDef.choices.length > 0 && (
        <div className="p-3 border-t border-slate-800 flex flex-wrap gap-2">
          {stageDef.choices.map((c) => (
            <button
              key={c.label}
              onClick={() => acceptChoice(c.label, c.reply, c.next)}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm shadow"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
