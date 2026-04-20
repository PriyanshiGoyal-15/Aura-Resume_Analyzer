"use client";

import { motion } from "framer-motion";

interface ScoreCircleProps {
  score: number;
  size?: number;
}

export default function ScoreCircle({ score, size = 180 }: ScoreCircleProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#10b981"; // Emerald
    if (s >= 50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="relative flex items-center justify-center p-4 bg-white rounded-full glass-card border-none shadow-[0_20px_50px_rgba(37,99,235,0.08)]" style={{ width: size + 40, height: size + 40 }}>
      {/* Outer Glow Ring */}
      <motion.div 
        animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full blur-3xl transition-colors duration-1000"
        style={{ backgroundColor: getScoreColor(score) }}
      />
      
      <svg width={size} height={size} className="rotate-[-90deg] relative z-10">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(15, 23, 42, 0.05)"
          strokeWidth="12"
        />
        {/* Progress Circle with Glow */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getScoreColor(score)}
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="flex items-baseline gap-0.5">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-6xl font-black tracking-tighter text-slate-900"
          >
            {score}
          </motion.span>
          <span className="text-xl font-bold text-slate-400">/100</span>
        </div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600/80 mt-1"
        >
          Score Accuracy
        </motion.span>
      </div>
    </div>
  );
}
