"use client";

import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu } from "lucide-react";
import { useState } from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewScan: () => void;
  onATSOptimize?: () => void;
  onGenerateCoverLetter?: () => void;
  overallScore?: number;
}

export default function DashboardShell({
  children,
  activeTab,
  onTabChange,
  onNewScan,
  onATSOptimize,
  onGenerateCoverLetter,
  overallScore
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-[#020617] text-slate-50 relative overflow-hidden">
      {/* Background Aurora Effects */}
      <div className="nebula-blob w-[500px] h-[500px] bg-indigo-600/20 top-[-100px] right-[-100px]" />
      <div className="nebula-blob w-[400px] h-[400px] bg-violet-600/20 bottom-[-50px] left-[-100px]" />

      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewScan={onNewScan}
        onATSOptimize={onATSOptimize}
        onGenerateCoverLetter={onGenerateCoverLetter}
        hasResult={overallScore !== undefined}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Cyber-Premium Floating Header */}
        <header className="h-[60px] sm:h-[70px] lg:h-[90px] px-4 sm:px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 z-20">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <Menu size={18} className="sm:size-5" />
            </button>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)] shrink-0" />
                <h1 className="text-[10px] sm:text-sm lg:text-xl font-black text-white tracking-tighter uppercase truncate">Neural Audit Terminal</h1>
              </div>
              <p className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] lg:tracking-[0.3em] mt-0.5 lg:mt-1.5 lg:ml-5 whitespace-nowrap truncate">
                Sync: Active • Precision Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
            {overallScore !== undefined && (
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-3 lg:px-6 py-1 lg:py-2.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl group hover:bg-white/[0.08] transition-all duration-500 shadow-2xl">
                <div className="relative w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="12" cy="12" r="10" className="stroke-white/5 sm:hidden" strokeWidth="1.5" fill="transparent" />
                    <circle cx="16" cy="16" r="14" className="stroke-white/5 hidden sm:block lg:hidden" strokeWidth="2" fill="transparent" />
                    <circle cx="20" cy="20" r="18" className="stroke-white/5 hidden lg:block" strokeWidth="2" fill="transparent" />
                    <motion.circle
                      cx="12" cy="12" r="10"
                      className="stroke-indigo-400 sm:hidden"
                      strokeWidth="1.5"
                      fill="transparent"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 63 }}
                      animate={{ strokeDashoffset: 63 - (overallScore / 100) * 63 }}
                      style={{ strokeDasharray: 63 }}
                      transition={{ duration: 2 }}
                    />
                    <motion.circle
                      cx="16" cy="16" r="14"
                      className="stroke-indigo-400 hidden sm:block lg:hidden"
                      strokeWidth="2"
                      fill="transparent"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 88 }}
                      animate={{ strokeDashoffset: 88 - (overallScore / 100) * 88 }}
                      style={{ strokeDasharray: 88 }}
                      transition={{ duration: 2 }}
                    />
                    <motion.circle
                      cx="20" cy="20" r="18"
                      className="stroke-indigo-400 hidden lg:block"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 113 }}
                      animate={{ strokeDashoffset: 113 - (overallScore / 100) * 113 }}
                      style={{ strokeDasharray: 113 }}
                      transition={{ duration: 2 }}
                    />
                  </svg>
                  <span className="absolute text-[8px] sm:text-[9px] lg:text-[11px] font-black text-indigo-300">{overallScore}</span>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">Diagnostic Index</span>
                  <span className="text-xs lg:text-sm font-black text-white mt-0.5 lg:mt-1">Matrix: {overallScore}/100</span>
                </div>
              </div>
            )}
            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-500 cursor-pointer shadow-xl">
              <User size={16} className="sm:size-[18px] lg:size-[22px]" />
            </div>
          </div>
        </header>

        {/* Scalable Workspace Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
