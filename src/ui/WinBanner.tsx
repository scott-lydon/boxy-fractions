import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export function WinBanner() {
  const reset = useGameStore((s) => s.reset);
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      className="bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl p-5 text-center text-slate-900 shadow-xl"
    >
      <div className="text-xs uppercase tracking-widest font-bold opacity-80 mb-1">
        You did it
      </div>
      <div className="text-2xl font-extrabold mb-1">1/2 = 2/4 = 3/6</div>
      <div className="text-sm opacity-90 mb-3">Three names, same amount of box.</div>
      <button
        onClick={reset}
        className="bg-slate-900 text-amber-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-800 active:bg-slate-700"
      >
        Play again
      </button>
    </motion.div>
  );
}
