import { auth } from "@/auth";
import { getActiveShift, getRecentShifts } from "@/actions/shift";
import { ShiftControl } from "@/components/staff/shift-control";
import { DashboardHeader } from "@/components/global/dashboard-header";
import { 
    History, 
    Calendar, 
    User as UserIcon, 
    Clock, 
    CheckCircle2,
    Briefcase
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function ShiftsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const [activeShiftResult, recentShiftsResult] = await Promise.all([
        getActiveShift(session.user.id),
        getRecentShifts(20)
    ]);

    const activeShift = activeShiftResult.success ? activeShiftResult.data : null;
    const recentShifts = recentShiftsResult.success ? recentShiftsResult.data : [];

    const formatDuration = (start: Date, end: Date | null) => {
        if (!end) return "Active";
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
            <DashboardHeader 
                title="Staff Portal" 
                subtitle="Duty cycle and attendance orchestration" 
            />

            <ShiftControl userId={session.user.id} activeShift={activeShift} />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Duty Log Archive</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {recentShifts?.length === 0 ? (
                        <div className="glass-card rounded-3xl py-12 flex flex-col items-center justify-center text-slate-500 border-dashed border-2 border-slate-800">
                             <Briefcase className="w-12 h-12 opacity-10 mb-4" />
                             <p className="font-bold uppercase tracking-widest text-xs">No recorded duty logs found.</p>
                        </div>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        recentShifts?.map((shift: any) => (
                            <div key={shift.id} className="glass-card rounded-[2rem] p-6 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-900/40 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white leading-none mb-1">{shift.user.name}</h4>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{shift.user.role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 flex-1 max-w-2xl">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> Date
                                        </p>
                                        <p className="text-slate-200 font-bold text-sm">
                                            {new Date(shift.startTime).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Duration
                                        </p>
                                        <p className="text-slate-200 font-bold text-sm">
                                            {formatDuration(shift.startTime, shift.endTime)}
                                        </p>
                                    </div>
                                    <div className="space-y-1 hidden lg:block">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Status
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${shift.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                            <p className={`text-xs font-bold uppercase tracking-widest ${shift.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {shift.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest tabular-nums">
                                        ID: {shift.id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
