"use client";

import { useState } from "react";
import { 
    Calendar, 
    Clock, 
    Phone, 
    Users, 
    XCircle, 
    CheckCircle2, 
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cancelReservation, completeReservation } from "@/actions/table";
import { toast } from "sonner";

interface Reservation {
    id: string;
    customerName: string;
    customerPhone: string | null;
    guestCount: number;
    startTime: Date;
    endTime: Date | null;
    status: string;
    table: {
        number: string;
    };
}

export default function ReservationList({ initialReservations }: { initialReservations: Reservation[] }) {
    const [reservations, setReservations] = useState(initialReservations);
    const [filterDate, setFilterDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this reservation?")) return;
        const result = await cancelReservation(id);
        if (result.success) {
            toast.success("Reservation cancelled");
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "CANCELLED" } : r));
        } else {
            toast.error(result.error as string);
        }
    };

    const handleComplete = async (id: string) => {
        const result = await completeReservation(id);
        if (result.success) {
            toast.success("Checked in successfully");
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "COMPLETED" } : r));
        } else {
            toast.error(result.error as string);
        }
    };

    const filtered = reservations.filter(r => 
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customerPhone && r.customerPhone.includes(searchQuery)) ||
        r.table.number.includes(searchQuery)
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "COMPLETED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            default: return "bg-slate-800 text-slate-400 border-slate-700";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-4 bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
                    <button 
                        onClick={() => setFilterDate(new Date(filterDate.setDate(filterDate.getDate() - 1)))}
                        className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black text-white whitespace-nowrap">
                            {filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <button 
                        onClick={() => setFilterDate(new Date(filterDate.setDate(filterDate.getDate() + 1)))}
                        className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setFilterDate(new Date())}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        Today
                    </button>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search guests or tables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-primary/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filtered.map(reservation => (
                    <div key={reservation.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center shadow-inner group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1 group-hover:text-primary">Table</span>
                                <span className="text-xl font-black text-white group-hover:text-primary">{reservation.table.number}</span>
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-white mb-1">{reservation.customerName}</h3>
                                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        {reservation.guestCount} Guests
                                    </div>
                                    {reservation.customerPhone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-primary" />
                                            {reservation.customerPhone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(reservation.status)}`}>
                                {reservation.status}
                            </div>
                            
                            {reservation.status === "CONFIRMED" && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleComplete(reservation.id)}
                                        className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                        title="Check In"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleCancel(reservation.id)}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                        title="Cancel"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-4">
                        <Calendar className="w-16 h-16 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-xs italic">No bookings found for this search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
