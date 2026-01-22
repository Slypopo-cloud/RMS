
import Link from 'next/link';
import { ChefHat, ChevronLeft } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function DashboardHeader({ title, subtitle, showBack = true }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 glass-card rounded-2xl border-l-4 border-l-primary">
      <div className="flex items-center gap-4">
        {showBack && (
          <Link 
            href="/dashboard" 
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm font-medium">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Olu&apos;s Kitchen</span>
      </div>
    </div>
  );
}
