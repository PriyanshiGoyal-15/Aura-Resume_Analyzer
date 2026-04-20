"use client";

import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface NarrativeSectionProps {
  content: string | string[];
}

export default function NarrativeSection({ content }: NarrativeSectionProps) {
  // Hardened parsing to handle both AI strings and AI arrays
  let points: string[] = [];

  if (Array.isArray(content)) {
    points = content;
  } else {
    points = (String(content || ""))
      .split("\n")
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p.startsWith("-") || p.startsWith("*") || p.startsWith("•") ? p.substring(1).trim() : p);
  }

  return (
    <div className="bg-white border border-slate-100 rounded-4xl p-10 space-y-8">
      <div className="flex items-center gap-3 text-indigo-600">
        <ShieldCheck size={20} />
        <h3 className="text-base font-bold text-slate-900 tracking-tight">AI insights</h3>
      </div>

      <div className="space-y-6">
        {points.length > 0 ? (
          points.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 group"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                {point}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="text-sm font-medium text-slate-400 italic">No narrative points identified for this audit segment.</p>
        )}
      </div>
    </div>
  );
}
