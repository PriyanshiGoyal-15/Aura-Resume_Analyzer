"use client";

import { CheckCircle2, AlertCircle, XCircle, ChevronDown, Sparkles, AlertTriangle, LucideIcon, Target } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisCardProps {
  title: string;
  score: number;
  strengths: string[];
  improvements: string[];
  missing: string[];
  status: "success" | "warning" | "error";
  icon?: LucideIcon;
}

export default function AnalysisCard({
  title,
  score,
  strengths = [],
  improvements = [],
  missing = [],
  status,
  icon: Icon = Target
}: AnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "success": return <CheckCircle2 className="text-emerald-500" size={24} />;
      case "warning": return <AlertCircle className="text-amber-500" size={24} />;
      case "error": return <XCircle className="text-red-500" size={24} />;
    }
  };

  return (
    <div className={cn(
      "group relative rounded-[2.5rem] transition-all duration-500 glass-card glass-glow overflow-hidden h-full flex flex-col",
      isOpen ? "bg-white ring-2 ring-blue-500/10 shadow-2xl" : "bg-white/50 hover:bg-white hover:translate-y-[-8px] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-blue-300/50"
    )}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-teal-50/30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between gap-6 relative z-10"
      >
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative shrink-0",
            status === 'success' ? "bg-emerald-50 text-emerald-600" :
              status === 'warning' ? "bg-amber-50 text-amber-600" :
                "bg-red-50 text-red-600"
          )}>
            <Icon size={32} />
            <div className={cn(
              "absolute inset-0 blur-2xl opacity-10",
              status === 'success' ? "bg-emerald-500" :
                status === 'warning' ? "bg-amber-500" :
                  "bg-red-500"
            )} />
          </div>
          <div className="text-left">
            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">{title || "Audit Segment"}</h4>
            <div className="flex items-center gap-4">
              <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    score > 80 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                />
              </div>
              <span className="text-xs font-black text-slate-400">{score}%</span>
            </div>
          </div>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center transition-all duration-300 shadow-sm shrink-0",
          isOpen ? "bg-slate-900 text-white rotate-180" : "bg-white text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600"
        )}>
          <ChevronDown size={22} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="px-8 pb-10 pt-2 space-y-8">
              <div className="h-px bg-slate-100" />

              {/* Strengths Section */}
              {strengths.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Mastered</span>
                  </div>
                  <div className="space-y-3">
                    {strengths.map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 group/item"
                      >
                        <p className="text-[15px] font-bold text-slate-700 leading-relaxed">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements Section */}
              {improvements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Sparkles size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Opportunities</span>
                  </div>
                  <div className="space-y-3">
                    {improvements.map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        key={idx}
                        className="flex gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 group/item"
                      >
                        <p className="text-[15px] font-bold text-slate-700 leading-relaxed">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Section */}
              {missing.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Foundational Gaps</span>
                  </div>
                  <div className="space-y-3">
                    {missing.map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                        key={idx}
                        className="flex gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-100/50 group/item"
                      >
                        <p className="text-[15px] font-bold text-slate-700 leading-relaxed">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
