"use client";

import { useState, useEffect, useRef } from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  title: string;
  score: number;
  bentoSummary: string;
  status: "success" | "warning" | "error";
  icon: LucideIcon;
}

export default function BentoCard({
  title,
  score,
  bentoSummary,
  status,
  icon: Icon
}: BentoCardProps) {
  const isStrong = score >= 90;
  const isGood = score >= 70 && score < 90;
  const isNeedsFix = score < 70;

  const getStatusLabel = () => {
    if (isStrong) return "STRONG";
    if (isGood) return "GOOD";
    return "NEEDS FIX";
  };

  const getThemeColor = () => {
    if (status === 'success') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    if (status === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
  };

  const getBarColor = () => {
    if (status === 'success') return 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
    if (status === 'warning') return 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
    return 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Check for overflow on mount and when summary changes
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
        setShowButton(isOverflowing || isExpanded);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [bentoSummary, isExpanded]);

  // SVG Circle Logic
  const RADIUS = 20;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="glass-card p-6 md:p-10 flex flex-col h-full group hover:bg-slate-900/60 transition-all duration-500 hover:translate-y-[-4px] relative overflow-hidden rounded-[2.5rem]">
      {/* Animated Scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-[100px] w-full -translate-y-full group-hover:animate-scan pointer-events-none" />

      {/* Top Header Layer */}
      <div className="flex items-start justify-between mb-8 lg:mb-10 relative z-10">
        <div className={cn(
          "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
          getThemeColor()
        )}>
          <Icon size={22} className="lg:size-[26px]" />
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                className="stroke-white/5 lg:hidden"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r={RADIUS}
                className="stroke-white/5 hidden lg:block"
                strokeWidth="3.5"
                fill="transparent"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="18"
                className={cn("lg:hidden transition-colors duration-500",
                  status === 'success' ? "stroke-emerald-400" :
                    status === 'warning' ? "stroke-amber-400" :
                      "stroke-rose-400"
                )}
                strokeWidth="3"
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDasharray: 2 * Math.PI * 18 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 18) - (score / 100) * (2 * Math.PI * 18) }}
                style={{ strokeDasharray: 2 * Math.PI * 18 }}
                transition={{ duration: 2 }}
              />
              <motion.circle
                cx="28"
                cy="28"
                r={RADIUS}
                className={cn("hidden lg:block transition-colors duration-500",
                  status === 'success' ? "stroke-emerald-400" :
                    status === 'warning' ? "stroke-amber-400" :
                      "stroke-rose-400"
                )}
                strokeWidth="3.5"
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDasharray: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: offset }}
                style={{ strokeDasharray: CIRCUMFERENCE }}
                transition={{ duration: 2 }}
              />
            </svg>
            <span className="absolute text-[10px] lg:text-[11px] font-black text-white">{score}</span>
          </div>
          <span className={cn(
            "text-[8px] lg:text-[9px] font-black tracking-[0.2em] px-2.5 lg:px-3 py-1 rounded-full border shadow-sm",
            status === 'success' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
              status === 'warning' ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                "text-rose-400 bg-rose-500/10 border-rose-500/20"
          )}>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Content Layer */}
      <div className="space-y-4 lg:space-y-6 flex-1 relative z-10">
        <div>
          <h4 className="text-lg lg:text-xl font-black text-white tracking-tight mb-2 lg:mb-3 transition-colors group-hover:text-indigo-300">{title}</h4>
          <p
            ref={textRef}
            className={cn(
              "text-xs lg:text-sm font-medium text-slate-400 leading-relaxed transition-all duration-300",
              !isExpanded && "line-clamp-4"
            )}
          >
            {bentoSummary}
          </p>
          {showButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] lg:text-[10px] font-black uppercase text-indigo-400 mt-3 lg:mt-4 hover:text-indigo-300 transition-colors tracking-[0.2em] flex items-center gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              {isExpanded ? "Minimize Log" : "Expand Brief"}
            </button>
          )}
        </div>

        {status !== 'success' && (
          <div className="flex items-center gap-2 lg:gap-3 py-2 lg:py-2.5 px-3 lg:px-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl group-hover:bg-amber-500/5 group-hover:border-amber-500/10 transition-all duration-500">
            <Sparkles size={12} className="text-amber-400 shrink-0 animate-pulse lg:size-[14px]" />
            <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Patch Required</span>
          </div>
        )}
      </div>

      {/* Bottom Progress Layer */}
      <div className="mt-8 lg:mt-10 relative z-10">
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className={cn("h-full rounded-full transition-all relative z-10", getBarColor())}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer -z-0" />
        </div>
      </div>
    </div>
  );
}
