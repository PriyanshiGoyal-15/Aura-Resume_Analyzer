"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, FileSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (file: File, jobDescription: string) => void;
  isAnalyzing: boolean;
}

export default function UploadZone({ onUpload, isAnalyzing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndUpload = (file: File, jd: string) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.");
      return;
    }
    setError(null);
    onUpload(file, jd);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file, jobDescription);
  }, [onUpload, jobDescription]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Job Context Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group group/jd"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-0 group-hover/jd:opacity-100 transition duration-500 pointer-events-none" />
        <div className="relative bg-slate-900/40 border border-white/5 backdrop-blur-xl rounded-3xl p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <FileSearch size={18} />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Context</h3>
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">Optional Optimization</span>
          </div>
          <textarea
            placeholder="Paste target job description or role requirements here to calibrate the audit matrix..."
            className="w-full h-32 p-4 rounded-2xl bg-white/[0.03] border border-white/5 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none text-slate-300 text-sm sm:text-base font-medium outline-none placeholder:text-slate-600"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>
      </motion.div>

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] p-1",
          isDragging ? "scale-[1.03]" : "scale-100"
        )}
        whileHover={{ scale: isAnalyzing ? 1 : 1.01 }}
      >
        {/* Animated Background Glow */}
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-indigo-500/30 rounded-[2.6rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000",
          isDragging && "opacity-100 blur-3xl scale-110"
        )} />

        <div className={cn(
          "relative h-48 sm:h-64 md:h-80 flex flex-col items-center justify-center space-y-4 sm:space-y-6 border-2 border-dashed transition-all overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]",
          isDragging
            ? "border-indigo-400 bg-indigo-500/10 ring-4 ring-indigo-500/5 shadow-inner"
            : "border-white/10 bg-slate-900/40 backdrop-blur-xl hover:border-white/20 hover:bg-slate-900/60"
        )}>
          {/* Shimmer Effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
          />

          {/* Visual Content (Background) */}
          <div className={cn(
            "p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/5 transition-all duration-500 shadow-sm",
            isDragging ? "scale-110 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10" : "group-hover:scale-110"
          )}>
            {isAnalyzing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <div className="relative">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-400" />
                  <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-indigo-400/10 blur-xl rounded-full" />
                </div>
              </motion.div>
            ) : (
              <div className="relative">
                <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-400" />
                {!isAnalyzing && (
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-400 rounded-full blur-sm opacity-40" />
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="text-center px-4 sm:px-6">
            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase italic">
              {isAnalyzing ? "Syncing Grid..." : "Transmit Resume"}
            </h3>
            <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-1 lg:mt-2">
              {isDragging ? "Neural Drop Terminal" : "Drag & Drop Data Matrix (PDF)"}
            </p>
          </div>

          {!isAnalyzing && (
            <div className="px-6 py-2.5 sm:px-8 sm:py-3.5 bg-white text-slate-950 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2">
              Initiate Upload
            </div>
          )}

          {/* Invisible Clickable Input (Strictly on TOP) */}
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer z-50"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) validateAndUpload(file, jobDescription);
            }}
            disabled={isAnalyzing}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl"
          >
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-600">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
