"use client";

import { RoadmapPhase } from "@/app/actions/analyze";
import { motion } from "framer-motion";

interface RoadmapSectionProps {
  roadmap: RoadmapPhase[];
}

export default function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {(roadmap || []).map((phase, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col h-full"
        >
          <div className="p-8 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2 block">
              {phase.phase}
            </span>
            <h4 className="text-[15px] font-black text-slate-900 leading-tight">
              {phase.title}
            </h4>
          </div>

          <div className="flex-1 px-8 pb-8 flex gap-6 mt-6">
            {/* Vertical Timeline Track */}
            <div className="flex flex-col items-center gap-1 shrink-0 pt-2">
              {phase.items.map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group-last:hidden flex-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                  {i !== phase.items.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-100 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6 flex-1">
              {phase.items.map((item, itemIdx) => (
                <div key={itemIdx} className="space-y-4">
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {item}
                  </p>
                  {itemIdx !== phase.items.length - 1 && (
                    <div className="h-[1px] w-full bg-slate-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
