"use client";

import {
  SearchCode,
  Box,
  Cpu,
  Zap,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewScan: () => void;
  onATSOptimize?: () => void;
  onGenerateCoverLetter?: () => void;
  hasResult?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <Box size={20} /> },
  { id: "analysis", label: "Analysis", icon: <SearchCode size={20} /> },
];

const TOOL_ITEMS = [
  { id: "ats", label: "ATS Optimizer", icon: <Zap size={18} />, action: "optimize" },
  { id: "cover", label: "Cover Letter", icon: <FileText size={18} />, action: "cover" },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  onNewScan,
  onATSOptimize,
  onGenerateCoverLetter,
  hasResult,
  isOpen,
  onClose
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 w-80 max-w-[85vw] transition-transform duration-500 z-[101] lg:relative lg:translate-x-0 lg:z-40 lg:h-screen lg:sticky lg:top-0 h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full lg:h-[calc(100vh-3rem)] m-0 lg:m-6 lg:rounded-[2.5rem] bg-slate-900 lg:bg-slate-900/60 backdrop-blur-2xl border-r lg:border border-white/5 flex flex-col shadow-2xl relative overflow-hidden group">

          {/* Sidebar Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

          {/* Brand Logo & Mobile Close */}
          <div className="p-8 lg:p-10 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-px shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                  <Cpu size={20} className="lg:size-6" />
                </div>
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-black text-white tracking-tighter uppercase leading-none">Aura</h2>
                <span className="text-[8px] lg:text-[9px] font-black text-indigo-300 tracking-[0.3em] uppercase">Resume Analyzer</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 px-6 mt-8 flex flex-col space-y-8 overflow-y-auto no-scrollbar">
            {/* Main Navigation */}
            <nav className="space-y-2">
              <h3 className="px-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Perspective</h3>
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onClose) onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group/nav relative overflow-hidden",
                      isActive
                        ? "text-white bg-white/5 border border-white/10 shadow-[0_10px_30px_rgba(99,102,241,0.1)]"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"
                      />
                    )}
                    <span className={cn(
                      "transition-colors duration-500",
                      isActive ? "text-indigo-400" : "group-hover/nav:text-indigo-300"
                    )}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-black tracking-tight uppercase">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Tools Navigation */}
            <nav className="space-y-2">
              <div className="px-6 flex items-center justify-between mb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Neural Tools</h3>
                {!hasResult && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" title="Locked: Scan Required" />
                )}
              </div>
              {TOOL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action === 'optimize' && onATSOptimize) onATSOptimize();
                    if (item.action === 'cover' && onGenerateCoverLetter) onGenerateCoverLetter();
                    if (onClose) onClose();
                  }}
                  disabled={!hasResult}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group/nav relative overflow-hidden",
                    "text-slate-500 hover:text-indigo-400 hover:bg-white/[0.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale"
                  )}
                >
                  <span className="text-slate-400 group-hover/nav:text-indigo-400 transition-colors">
                    {item.icon}
                  </span>
                  <span className="text-sm font-black tracking-tight uppercase">
                    {item.label}
                  </span>
                  {item.id === 'ats' && hasResult && (
                    <Sparkles size={12} className="ml-auto text-amber-500 animate-pulse" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Global Reset */}
          <div className="p-8 mt-auto">
            <button
              onClick={() => {
                onNewScan();
                if (onClose) onClose();
              }}
              className="w-full h-14 bg-white text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3"
            >
              <Zap size={16} fill="currentColor" />
              Initiate New Swap
            </button>
          </div>

          {/* Tech Footer */}
          <div className="p-8 border-t border-white/5 bg-black/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Integrity</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-medium text-slate-500 leading-tight">LTM: Optimized • Mode: Clinical</p>
                <p className="text-[9px] font-medium text-slate-600">v2.4.0 • Gemini 1.5</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
