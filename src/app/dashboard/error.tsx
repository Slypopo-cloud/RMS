"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8 shadow-2xl shadow-red-500/10">
        <AlertCircle className="w-12 h-12" />
      </div>
      
      <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Technical Distortion</h2>
      <p className="text-slate-400 max-w-md font-medium text-lg leading-relaxed mb-10">
        The system encountered an unexpected structural anomaly. Our core services are currently stabilizing.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={() => reset()}
          className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
        >
          <RefreshCcw className="w-4 h-4" />
          Re-initialize
        </button>
        <Link
          href="/dashboard"
          className="flex-1 bg-slate-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          Base Command
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left max-w-2xl w-full overflow-hidden">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Debug Metadata</p>
          <code className="text-xs text-red-400 font-mono break-all">{error.message}</code>
        </div>
      )}
    </div>
  );
}
