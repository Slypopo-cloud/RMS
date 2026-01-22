"use client";

import { useEffect } from "react";
import { ChefHat, RefreshCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public Menu Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
      <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center text-black mb-8 rotate-3 shadow-2xl">
        <ChefHat className="w-10 h-10" />
      </div>
      
      <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
        Our Kitchen is <br />
        <span className="text-primary italic">Recalibrating</span>
      </h2>
      <p className="text-slate-400 max-w-sm font-medium text-lg leading-relaxed mb-10">
        We encountered a slight delay in preparing your digital experience. Please try re-initializing the portal.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="w-full bg-primary hover:bg-amber-400 text-black font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
          Refresh Menu
        </button>
        <Link
          href="/menu"
          className="w-full bg-transparent text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] hover:text-white transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Return to Catalog
        </Link>
      </div>
    </main>
  );
}
