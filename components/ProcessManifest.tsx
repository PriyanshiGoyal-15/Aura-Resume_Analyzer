"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, FileCheck2, Sparkles, Search } from "lucide-react";

const STEPS = [
  {
    icon: <Upload className="w-6 h-6" />,
    title: "Capture",
    desc: "Neural network extracts high-density text and structural data from your PDF.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Audit",
    desc: "Gemini Pro contextually validates your experience against 50+ enterprise ATS schemas.",
    color: "from-violet-500 to-fuchsia-500"
  },
  {
    icon: <FileCheck2 className="w-6 h-6" />,
    title: "Refine",
    desc: "Generate optimized summaries, cover letters, and a 3-phase growth roadmap.",
    color: "from-emerald-500 to-teal-500"
  }
];

export default function ProcessManifest() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Sparkles className="text-indigo-400 animate-pulse" size={18} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">System Architecture</h3>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter">How the Engine Processes Your Career Matrix</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {STEPS.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 sm:p-8 lg:p-10 bg-slate-900/40 border-white/5 relative group overflow-hidden rounded-[2rem]"
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity`} />
            
            <div className="relative z-10 space-y-5 lg:space-y-6">
              <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${step.color} p-px`}>
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-white">
                  {step.icon}
                </div>
              </div>
              
              <div className="space-y-2 lg:space-y-3">
                <h4 className="text-lg lg:text-xl font-black text-white tracking-tight">{step.title}</h4>
                <p className="text-xs lg:text-sm font-medium text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 lg:pt-6 flex items-center gap-3 border-t border-white/5 uppercase text-[8px] lg:text-[9px] font-black tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                <span>Phase 0{idx + 1} Integrated</span>
                <div className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-500 group-hover:animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Visual Lore Connector */}
      <div className="p-6 sm:p-8 glass bg-indigo-500/5 border-indigo-500/10 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Search size={20} />
           </div>
           <p className="text-sm font-medium text-slate-300">
             <span className="text-white font-black">Clinical Standard:</span> Our engine uses advanced LLM reasoning to simulate recruiter decision-making patterns.
           </p>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-500 tracking-widest uppercase">
          Latency: 140ms • Gemini-Pro 1.5
        </div>
      </div>
    </div>
  );
}
