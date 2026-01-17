"use client";

import { useState, useEffect, useCallback } from "react";
import { getSalesReport } from "@/actions/analytics";
import { 
  Calendar as CalendarIcon, 
  Download,
  FileText,
  TrendingUp,
  CreditCard,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

const formatDate = (date: Date, pattern: string) => {
    if (pattern === "yyyy-MM-dd") {
        return date.toISOString().split('T')[0];
    }
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

import { DashboardHeader } from "@/components/global/dashboard-header";

interface ReportOrderItem {
    quantity: number;
    menuItem: {
        name: string;
    };
}

interface ReportOrder {
    id: string;
    updatedAt: Date | string;
    totalAmount: number;
    items: ReportOrderItem[];
    user: {
        name: string | null;
    } | null;
}

export default function ReportsPage() {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState(new Date());
    const [orders, setOrders] = useState<ReportOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        const result = await getSalesReport(startDate, endDate);
        if (result.success) {
            setOrders((result.data as ReportOrder[]) || []);
        } else {
            toast.error(result.error as string);
        }
        setIsLoading(false);
    }, [startDate, endDate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReports();
    }, [fetchReports]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <DashboardHeader 
                    title="Sales Analytics" 
                    subtitle="Deep dive into your revenue stream" 
                    showBack={true}
                />
                <button 
                  onClick={() => toast.info("Export feature coming soon!")}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-6 py-3 rounded-2xl text-sm font-black text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-xl active:scale-95 uppercase tracking-widest md:mt-[-32px]"
                >
                    <Download className="w-4 h-4" /> Export Ledger
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 glass-card rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-primary/5 blur-3xl rounded-full"></div>
                    
                    <div className="flex flex-wrap gap-8 items-center relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3" /> Start Date
                            </label>
                            <input 
                                type="date" 
                                value={formatDate(startDate, "yyyy-MM-dd")}
                                onChange={(e) => setStartDate(new Date(e.target.value))}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3" /> End Date
                            </label>
                            <input 
                                type="date" 
                                value={formatDate(endDate, "yyyy-MM-dd")}
                                onChange={(e) => setEndDate(new Date(e.target.value))}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="h-12 w-px bg-slate-800 mx-4 hidden md:block"></div>
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Revenue</p>
                                    <p className="text-3xl font-black text-white leading-none">${totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 flex flex-col justify-center border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <CreditCard className="w-3 h-3" /> Avg. Order
                    </p>
                    <p className="text-3xl font-black text-white">
                        ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00"}
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-slate-800">
                <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-black text-white tracking-tight">Order Logs</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {orders.length} RECORDS FOUND
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-24 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-slate-800 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-slate-600 uppercase tracking-widest text-xs">Synchronizing Records...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-24 text-center text-slate-600 space-y-4">
                            <FileText className="w-12 h-12 opacity-10 mx-auto" />
                            <p className="font-bold uppercase tracking-widest text-xs italic">No sales discovered in this timeframe.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/60 uppercase tracking-widest text-[10px] font-black text-slate-500">
                                    <th className="px-8 py-5">Timestamp</th>
                                    <th className="px-8 py-5">Reference</th>
                                    <th className="px-8 py-5">Components</th>
                                    <th className="px-8 py-5">Operator</th>
                                    <th className="px-8 py-5 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/10">
                                {orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 text-sm font-bold text-slate-400 whitespace-nowrap">
                                            {formatDate(new Date(order.updatedAt), "")}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-slate-500 group-hover:text-primary transition-colors">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.map((item, idx) => (
                                                    <span key={idx} className="bg-slate-800/80 text-white border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-black">
                                                        {item.quantity}× {item.menuItem.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-400">
                                            {order.user?.name || "Counter"}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-lg font-black text-white">${order.totalAmount.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

