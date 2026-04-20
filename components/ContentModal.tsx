"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download, FileText, FileSearch, AlertCircle } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  loading: boolean;
}

export default function ContentModal({ isOpen, onClose, title, content, loading }: ContentModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isError = title.includes("Failure") || title.includes("Throttled");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-12 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/10"
          >
            {/* Cyber-Premium Header */}
            <div className="p-8 md:p-10 border-b border-white/5 flex items-center justify-between bg-slate-900/40 relative z-10">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg transition-colors",
                  isError ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                )}>
                  {isError ? <AlertCircle size={28} className="animate-pulse" /> : <FileSearch size={28} />}
                </div>
                <div>
                  <h3 className={cn("text-2xl md:text-3xl font-black tracking-tight", isError ? "text-rose-400" : "text-white")}>{title}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5">Neural Generation Output</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center text-slate-500 transition-all hover:text-white hover:rotate-90 duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-10 md:p-16 custom-scrollbar bg-slate-950/20">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-4 max-w-sm">
                    <p className="text-xl font-black text-white tracking-tight">Intelligence Matrix Active</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing neural patterns...</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "prose prose-invert prose-lg lg:prose-xl max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:leading-relaxed prose-strong:font-black prose-hr:border-white/5",
                    isError ? "prose-p:text-rose-200/60" : "prose-headings:text-white prose-p:text-slate-400 prose-strong:text-indigo-400"
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </motion.div>
              )}
            </div>

            {/* Premium Footer Actions */}
            <div className="p-8 md:p-10 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-3 text-slate-500">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]", isError ? "bg-rose-500" : "bg-emerald-500")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isError ? "System Throttle Warning" : "Document Integrity Verified"}</span>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {!isError ? (
                  <>
                    <button
                      onClick={handleDownload}
                      disabled={loading || !content}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] font-black text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                    >
                      <Download size={18} />
                      Download (.md)
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={loading || !content}
                      className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-[1.25rem] font-black transition-all shadow-2xl disabled:opacity-50",
                        copied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white text-slate-950 hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? "Copied" : "Copy Content"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-12 py-4 rounded-[1.25rem] font-black bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Close Neural Link
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

