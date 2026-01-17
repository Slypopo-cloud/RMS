"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={dispatch} className="bg-slate-900/40 backdrop-blur-xl rounded-[2.2rem] p-8 md:p-10 border border-white/5">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm font-medium">Enter your credentials to access the nexus</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1" htmlFor="username">
              Username
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                id="username"
                type="text"
                name="username"
                placeholder="Operator ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest" htmlFor="password">
                Password
              </label>
              <button type="button" className="text-[10px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors">
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                id="password"
                type="password"
                name="password"
                placeholder="Security Key"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-xs font-bold text-red-500">{errorMessage}</p>
          </div>
        )}

        <button
          className="w-full relative group overflow-hidden bg-primary disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98] mt-4"
          aria-disabled={isPending}
          disabled={isPending}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isPending ? (
               <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                AUTHORIZE ACCESS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>

        <div className="flex items-center justify-center gap-2 pt-2">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">Admin / admin123</p>
        </div>
      </div>
    </form>
  );
}

