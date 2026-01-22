"use client";

import { updateOrderStatus } from "@/actions/order";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    Clock, 
    User, 
    ChefHat, 
    CheckCircle2, 
    Flame, 
    Check,
    Timer,
    RefreshCcw
} from "lucide-react";
import { toast } from "sonner";

export interface KitchenOrder {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    totalAmount: number;
    userId: string | null;
    restaurantTable: { number: string } | null;
    items: {
        id: string;
        quantity: number;
        menuItem: { name: string };
    }[];
    user: { name: string | null; username: string } | null;
}

export default function KitchenDisplay({ initialOrders }: { initialOrders: KitchenOrder[] }) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        router.refresh();
        setLastUpdated(new Date());
        setTimeout(() => setIsRefreshing(false), 1000);
    }, [router]);

    useEffect(() => {
        const interval = setInterval(() => {
            handleRefresh();
        }, 30000); // Polling every 30s instead of 10s to be less aggressive
        return () => clearInterval(interval);
    }, [handleRefresh]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        const result = await updateOrderStatus(orderId, newStatus);
        setUpdatingId(null);
        if (result.success) {
            toast.success(`Order status updated to ${newStatus}`);
            router.refresh(); 
        } else {
            toast.error("Failed to update status");
        }
    };

    const getStatusStyles = (status: string) => {
        switch(status) {
            case "PENDING": return {
                border: "border-primary/50",
                glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
                bg: "bg-primary/5",
                text: "text-primary",
                icon: Clock
            };
            case "PREPARING": return {
                border: "border-blue-500/50",
                glow: "shadow-[0_0_20px_rgba(59,130,246,0.1)]",
                bg: "bg-blue-500/5",
                text: "text-blue-400",
                icon: Flame
            };
            case "READY": return {
                border: "border-emerald-500/50",
                glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                bg: "bg-emerald-500/5",
                text: "text-emerald-400",
                icon: CheckCircle2
            };
            default: return {
                border: "border-slate-700",
                glow: "",
                bg: "bg-slate-800/50",
                text: "text-slate-400",
                icon: ChefHat
            };
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-primary" />
                        Kitchen Pipeline
                    </h2>
                    <p className="text-slate-400 font-medium">Manage active cooking orders</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-800">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Last Update</span>
                            <span className="text-[10px] font-bold text-slate-300 tabular-nums">
                                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <button 
                            onClick={handleRefresh}
                            className={`p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary hover:border-primary/50 transition-all ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {initialOrders.length === 0 && (
                    <div className="col-span-full py-24 glass-card rounded-3xl flex flex-col items-center justify-center text-slate-500 border-dashed border-2 border-slate-800">
                        <ChefHat className="w-16 h-16 opacity-10 mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">All clear! No active orders.</p>
                    </div>
                )}
                
                {initialOrders.map(order => {
                    const styles = getStatusStyles(order.status);
                    const StatusIcon = styles.icon;
                    const elapsedMinutes = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);

                    return (
                        <div 
                            key={order.id} 
                            className={`glass-card rounded-3xl p-6 flex flex-col h-full border-t-4 ${styles.border} ${styles.glow} transition-all duration-500`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-black text-2xl text-white tracking-tighter">
                                        #{order.id.slice(-4).toUpperCase()}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Timer className="w-3.5 h-3.5 text-slate-500" />
                                        <span className={`text-xs font-bold ${elapsedMinutes > 15 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {elapsedMinutes}m ago
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl ${styles.bg} ${styles.text}`}>
                                    <StatusIcon className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 mb-8">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 group">
                                        <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-white text-sm border border-slate-700/50 group-hover:border-primary/30 transition-colors">
                                            {item.quantity}
                                        </span>
                                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                                            {item.menuItem.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6 flex items-center gap-2 py-3 px-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Server: {order.user?.name || "Counter"}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                {order.status === "PENDING" && (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, "PREPARING")}
                                        disabled={updatingId === order.id}
                                        className="flex-1 bg-amber-500 text-black font-black py-3 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Flame className="w-4 h-4" />
                                        COOK
                                    </button>
                                )}
                                {order.status === "PREPARING" && (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, "READY")}
                                        disabled={updatingId === order.id}
                                        className="flex-1 bg-blue-500 text-white font-black py-3 rounded-2xl hover:bg-blue-400 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        READY
                                    </button>
                                )}
                                {order.status === "READY" && (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                                        disabled={updatingId === order.id}
                                        className="flex-1 bg-emerald-500 text-white font-black py-3 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        DONE
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

