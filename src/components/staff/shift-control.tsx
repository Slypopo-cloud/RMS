"use client";

import { useState } from "react";
import { clockIn, clockOut } from "@/actions/shift";
import { 
    Clock, 
    Play, 
    Square, 
    Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShiftControlProps {
    userId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeShift: any | null;
}

export function ShiftControl({ userId, activeShift }: ShiftControlProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClockIn = async () => {
        setIsLoading(true);
        const result = await clockIn(userId);
        setIsLoading(false);
        if (result.success) {
            toast.success("Shift initiated. Have a productive duty cycle!");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleClockOut = async () => {
        setIsLoading(true);
        const result = await clockOut(activeShift.id);
        setIsLoading(false);
        if (result.success) {
            toast.success("Shift terminated. Thank you for your service.");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-slate-800 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors duration-700"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center text-primary shadow-inner">
                    <Clock className={`w-14 h-14 ${activeShift ? 'animate-pulse' : ''}`} />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                        <Briefcase className="w-3 h-3" />
                        Duty Station 01
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {activeShift ? "Duty Cycle: Active" : "Station: Standby"}
                    </h2>
                    <p className="text-slate-400 font-medium max-w-md">
                        {activeShift 
                          ? `Commenced at ${new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Data synchronization in progress.` 
                          : "Synchronize your presence with the central hub to begin task fulfillment."}
                    </p>
                </div>

                <div className="shrink-0">
                    {activeShift ? (
                        <button 
                            onClick={handleClockOut}
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-400 text-white px-10 py-5 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            Terminate Shift
                        </button>
                    ) : (
                        <button 
                            onClick={handleClockIn}
                            disabled={isLoading}
                            className="bg-primary hover:bg-amber-400 text-black px-10 py-5 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Commence Shift
                        </button>
                    )}
                </div>
            </div>

            {activeShift && (
                <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol ID</p>
                        <p className="text-white font-bold tabular-nums">#{activeShift.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Elapsed Time</p>
                        <p className="text-primary font-bold">Calculating...</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-emerald-500 font-bold">Encrypted</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
