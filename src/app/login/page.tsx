import LoginForm from "@/components/global/login-form";
import { Utensils } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-[0_10px_40px_rgba(245,158,11,0.3)] mb-6 rotate-3">
             <Utensils className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Vantage <span className="text-primary">RMS</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Professional Hospitality Suite v1.0</p>
        </div>
        
        <div className="glass-card rounded-[2.5rem] p-1 shadow-2xl">
          <LoginForm />
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-xs font-medium">
          &copy; 2026 Olu's Kitchen • Exceptional Dining Experience
        </p>
      </div>
    </main>
  );
}

