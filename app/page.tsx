"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  FileSearch,
  RefreshCcw,
  Sparkles,
  Zap,
  Globe,
  UserCircle,
  Layout,
  Cpu,
  Type,
  CheckCircle2,
  Clock,
  SearchCode,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { analyzeResume, AnalysisResult } from "@/app/actions/analyze";
import { generateCoverLetter, generateATSOptimization } from "@/app/actions/tools";
import UploadZone from "@/components/UploadZone";
import ContentModal from "@/components/ContentModal";
import DashboardShell from "@/components/DashboardShell";
import BentoCard from "@/components/BentoCard";
import NarrativeSection from "@/components/NarrativeSection";
import RoadmapSection from "@/components/RoadmapSection";
import ProcessManifest from "@/components/ProcessManifest";

const FEATURES = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Neural Analysis",
    desc: "Powered by Gemini Pro for deep contextual audit of career signal."
  },
  {
    icon: <SearchCode className="w-6 h-6" />,
    title: "ATS Injected",
    desc: "Simulated against 50+ enterprise ATS schemas for compliance."
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Industry Rubric",
    desc: "Clinical validation against modern recruiting standards."
  }
];

const CATEGORY_ICONS: Record<string, any> = {
  contact: UserCircle,
  sections: Layout,
  skills: Cpu,
  content: FileText,
  format: Type,
};

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [jobContext, setJobContext] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Toolkit State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [persistFileName, setPersistFileName] = useState("");

  // Load state from localStorage on mount
  useEffect(() => {
    const savedResult = localStorage.getItem("resume_analysis_result");
    const savedContext = localStorage.getItem("resume_job_context");
    const savedTab = localStorage.getItem("resume_active_tab");
    const savedFileName = localStorage.getItem("resume_file_name");

    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedContext) setJobContext(savedContext);
    if (savedTab) setActiveTab(savedTab);
    if (savedFileName) setPersistFileName(savedFileName);
  }, []);

  // Persist state on changes
  useEffect(() => {
    if (result) {
      localStorage.setItem("resume_analysis_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("resume_analysis_result");
    }
  }, [result]);

  useEffect(() => {
    localStorage.setItem("resume_job_context", jobContext);
  }, [jobContext]);

  useEffect(() => {
    localStorage.setItem("resume_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("resume_file_name", persistFileName);
  }, [persistFileName]);

  const handleUpload = async (file: File, jobDescription: string) => {
    setIsAnalyzing(true);
    setCurrentFile(file);
    setPersistFileName(file.name);
    setJobContext(jobDescription);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);
      const output = await analyzeResume(formData);
      setResult(output);
      setActiveTab("analysis");
    } catch (error: any) {
      console.error(error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota") || error?.message?.includes("Throttled");
      const isTechnicalLog = error?.message?.includes("GoogleGenerativeAI") || error?.message?.includes("models/gemini");

      setModalTitle(isQuota ? "System Throttled" : "Diagnostic Failure");

      let finalMsg = error?.message || "Failed to analyze resume. Please verify the file and try again.";
      if (isTechnicalLog && isQuota) {
        finalMsg = "Daily Neural Limit Reached: Your current quota for the free diagnostic tier (20 scans/day) has been exhausted. Please wait until tomorrow for a fresh reset.";
      }

      setModalContent(finalMsg);
      setModalOpen(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleATSOptimize = async () => {
    if (!result) return;
    setModalTitle("ATS Enhancement Report");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const content = await generateATSOptimization(result.rawText, jobContext);
      setModalContent(content);
    } catch (error: any) {
      console.error(error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota");
      const isTechnicalLog = error?.message?.includes("GoogleGenerativeAI") || error?.message?.includes("models/gemini");

      setModalTitle(isQuota ? "System Throttled" : "Neural Link Failure");

      let finalMsg = error?.message || "Failed to optimize. Please check your network and try again.";
      if (isTechnicalLog && isQuota) {
        finalMsg = "High Neural Demand: The AI engine is currently throttled due to heavy traffic. Please wait a minute before retrying.";
      }

      setModalContent(finalMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!result) return;
    setModalTitle("Professional Cover Letter");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const content = await generateCoverLetter(result.rawText, jobContext);
      setModalContent(content);
    } catch (error: any) {
      console.error(error);
      const isQuota = error?.message?.includes("429") || error?.message?.includes("Quota");
      const isTechnicalLog = error?.message?.includes("GoogleGenerativeAI") || error?.message?.includes("models/gemini");

      setModalTitle(isQuota ? "System Throttled" : "Neural Link Failure");

      let finalMsg = error?.message || "Failed to generate cover letter. Please check your network and try again.";
      if (isTechnicalLog && isQuota) {
        finalMsg = "High Neural Demand: The AI engine is currently throttled due to heavy traffic. Please wait a minute before retrying.";
      }

      setModalContent(finalMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCurrentFile(null);
    setPersistFileName("");
    setJobContext("");
    setActiveTab("dashboard");
    localStorage.removeItem("resume_analysis_result");
    localStorage.removeItem("resume_job_context");
    localStorage.removeItem("resume_active_tab");
    localStorage.removeItem("resume_file_name");
  };

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNewScan={reset}
      onATSOptimize={handleATSOptimize}
      onGenerateCoverLetter={handleGenerateCoverLetter}
      overallScore={result?.score}
    >
      <div className="space-y-24 pb-20 relative">
        {/* Decorative Grid Layer */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

        {/* Dashboard View: No Result */}
        {activeTab === "dashboard" && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-32"
          >
            {/* High-End Hero Section */}
            <div className="relative space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="px-3 lg:px-4 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    Diagnostic System Online
                  </div>
                  <div className="h-px w-12 lg:w-20 bg-gradient-to-r from-indigo-500/50 to-transparent" />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[1.1] lg:leading-[0.9] group">
                  Elevate Your <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">Career Signal</span>
                </h1>

                <p className="text-sm sm:text-base lg:text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                  Bridge the gap between raw experience and recruiter perception. We use Gemini-Pro 1.5 to decode your narrative and optimize for the global talent matrix.
                </p>
              </div>

              {/* Upload Portal */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] blur-2xl opacity-10" />
                <div className="relative bg-slate-900/40 border border-white/5 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-1.5 lg:p-1">
                  <UploadZone onUpload={handleUpload} isAnalyzing={isAnalyzing} />
                </div>
              </div>
            </div>

            {/* How it Works / Process Manifest */}
            <ProcessManifest />

            {/* Feature Matrix */}
            <div className="space-y-6 sm:space-y-8 lg:space-y-12 mt-12 sm:mt-20">
              <div className="flex flex-col gap-1 lg:gap-2">
                <h3 className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] text-slate-500">Core Capabilities</h3>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tighter">Engineered for the Modern Hunt</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {FEATURES.map((item, idx) => (
                  <div key={idx} className="p-6 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 group-hover:to-indigo-500/10 transition-all" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mb-4 sm:mb-6 lg:mb-8 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-500">
                        {item.icon}
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-black text-white mb-2 lg:mb-3 tracking-tight">{item.title}</h3>
                      <p className="text-sm sm:text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Dashboard View: With Result */}
        {activeTab === "dashboard" && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                      Executive Summary
                    </span>
                    <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {result.issueCount} Issues Found
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold leading-tight max-w-2xl">
                    {result.summary}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("analysis")}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
                >
                  Explore Workspace <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 sm:p-8 lg:p-10 bg-white border border-slate-100 rounded-[2.5rem] space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Toolkit</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={handleATSOptimize} className="p-5 bg-slate-50 rounded-2xl text-left hover:bg-slate-100 transition-all group">
                    <Zap size={20} className="mb-4 text-indigo-600" />
                    <p className="font-bold text-slate-900 text-sm">ATS Optimizer</p>
                  </button>
                  <button onClick={handleGenerateCoverLetter} className="p-5 bg-slate-50 rounded-2xl text-left hover:bg-slate-100 transition-all group">
                    <FileText size={20} className="mb-4 text-indigo-600" />
                    <p className="font-bold text-slate-900 text-sm">Cover Letter</p>
                  </button>
                </div>
              </div>
              <div className="p-6 sm:p-8 lg:p-10 bg-indigo-600 rounded-[2.5rem] text-white flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200">Current Standing</h4>
                  <span className="text-[10px] font-black uppercase bg-white/20 px-3 py-1 rounded">Score: {result.score}/100</span>
                </div>
                <p className="text-2xl font-bold leading-relaxed">
                  Your resume is undergoing a FAANG-level audit. We found {result.issueCount} critical areas for optimization.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "analysis" && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            {/* Bento Grid Analysis - Show All 5 Categories */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bento Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(result.categories).map(([key, category]) => (
                  <BentoCard
                    key={key}
                    title={category.title}
                    score={category.score}
                    bentoSummary={category.bentoSummary}
                    status={category.status}
                    icon={CATEGORY_ICONS[key]}
                  />
                ))}
              </div>
            </div>

            {/* Career Narrative Section */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Career Narrative</h4>
              <NarrativeSection content={result.executiveSummary.overview} />
            </div>

            {/* 3-Phase Action Roadmap */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">3-Phase Action Roadmap</h4>
              <RoadmapSection roadmap={result.executiveSummary.roadmap} />
            </div>

            {/* Critical Weaknesses & Gap Analysis */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Critical Weaknesses</h4>
                <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-500/20">
                  Correction Layer Required
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[2rem] sm:rounded-4xl p-6 sm:p-8 lg:p-10 space-y-8">
                <div className="flex items-center gap-3 text-rose-500">
                  <AlertTriangle size={20} />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Identified Narrative Gaps</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(result.weaknesses || []).map((weakness, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-rose-200 transition-all"
                    >
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {weakness}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interview Intelligence */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Interview Intelligence</h4>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                  result.isNeural
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {result.isNeural ? (
                    <span className="flex items-center gap-1.5"><Sparkles size={10} className="animate-pulse" /> Neural Simulation Active</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Zap size={10} /> Heuristic Protocol Engaged</span>
                  )}
                </div>
              </div>
              <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden group border border-white/5">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <HelpCircle size={20} />
                    <h3 className="text-base font-bold text-white tracking-tight">Probable Interview Questions</h3>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {(result.interviewQuestions || []).map((question, idx) => (
                      <motion.div
                        key={idx}
                        className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default"
                      >
                        <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                          "{question}"
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
              </div>
            </div>

            {/* ATS Compliance Verdict Section */}
            <div className="space-y-8 pb-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ATS Compliance Verdict</h4>
              <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <FileSearch className="text-indigo-400" size={24} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Systems Diagnostic</h3>
                      <p className="text-slate-300 font-medium leading-relaxed max-w-4xl">
                        {result.executiveSummary.atsVerdict}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic Chips */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                    {Object.entries(result.executiveSummary.diagnostics || {}).map(([key, state]) => (
                      <div
                        key={key}
                        className={cn(
                          "px-4 py-2 rounded-xl flex items-center gap-3 border transition-all",
                          state === "pass" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            state === "partial" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                              "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          state === "pass" ? "bg-emerald-400" :
                            state === "partial" ? "bg-amber-400" :
                              "bg-rose-400"
                        )} />
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{key}: {state}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "analysis" && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                <FileSearch size={48} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-indigo-500 blur-3xl -z-10"
              />
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-black text-white tracking-tighter">Diagnostic Required</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                We haven't received your data matrix yet. Please transmit your resume on the
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="text-indigo-400 font-black hover:text-indigo-300 transition-colors mx-1 underline decoration-2 underline-offset-4"
                >
                  Dashboard
                </button>
                to initiate the clinical audit.
              </p>
            </div>
          </motion.div>
        )}

        {/* Coming Soon states */}
        {["projects", "library", "account", "settings"].includes(activeTab) && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <Clock size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight capitalize">{activeTab} Coming Soon</h2>
              <p className="text-slate-500 font-medium"> We're building a smarter way to manage your career assets. </p>
            </div>
          </div>
        )}
      </div>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        loading={modalLoading}
      />
    </DashboardShell>
  );
}

