import { motion } from "framer-motion";

export function EquivalencePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-500/10 border border-amber-400/40 rounded-lg p-4 text-center"
    >
      <div className="text-amber-400 text-xs uppercase tracking-widest mb-2 font-semibold">
        Equivalent Fractions
      </div>
      <div className="text-3xl font-extrabold text-slate-100">
        <span className="text-amber-400">1/2</span> = <span className="text-sky-400">2/4</span>
      </div>
    </motion.div>
  );
}
