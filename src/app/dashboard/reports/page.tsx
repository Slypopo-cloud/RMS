"use client";

import { useState, useEffect, useCallback } from "react";
import { getSalesReport, exportSalesReportCSV, getTopSellingItems, getHourlySales, getCategoryRevenue, getStaffPerformance, getLaborAnalytics } from "@/actions/analytics";
import { 
  Calendar as CalendarIcon, 
  Download,
  FileText,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Award,
  PieChart,
  Briefcase
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

interface TopItem {
    name: string;
    quantity: number;
    revenue: number;
}

interface HourlyData {
    hour: number;
    count: number;
    revenue: number;
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
    const [topItems, setTopItems] = useState<TopItem[]>([]);
    const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
    const [categoryData, setCategoryData] = useState<{category: string; revenue: number; itemsSold: number}[]>([]);
    const [staffData, setStaffData] = useState<{name: string; orderCount: number; revenue: number}[]>([]);
    const [laborData, setLaborData] = useState<{totalHours: number; estLaborCost: number; shiftCount: number}>({ totalHours: 0, estLaborCost: 0, shiftCount: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activePreset, setActivePreset] = useState<string | null>(null);

    const datePresets = [
        { label: "Today", getValue: () => ({ start: new Date(new Date().setHours(0, 0, 0, 0)), end: new Date() }) },
        { label: "Yesterday", getValue: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date(yesterday);
            yesterdayEnd.setHours(23, 59, 59, 999);
            return { start: yesterday, end: yesterdayEnd };
        }},
        { label: "This Week", getValue: () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const start = new Date(now);
            start.setDate(now.getDate() - dayOfWeek);
            start.setHours(0, 0, 0, 0);
            return { start, end: new Date() };
        }},
        { label: "Last Week", getValue: () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const start = new Date(now);
            start.setDate(now.getDate() - dayOfWeek - 7);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }},
        { label: "This Month", getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start, end: new Date() };
        }},
        { label: "Last Month", getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            return { start, end };
        }}
    ];

    const applyPreset = (preset: typeof datePresets[0]) => {
        const { start, end } = preset.getValue();
        setStartDate(start);
        setEndDate(end);
        setActivePreset(preset.label);
    };

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        const [salesResult, topResult, hourlyResult, categoryResult, staffResult, laborResult] = await Promise.all([
            getSalesReport(startDate, endDate),
            getTopSellingItems(startDate, endDate),
            getHourlySales(startDate, endDate),
            getCategoryRevenue(startDate, endDate),
            getStaffPerformance(startDate, endDate),
            getLaborAnalytics(startDate, endDate)
        ]);

        if (salesResult.success) {
            setOrders((salesResult.data as ReportOrder[]) || []);
        } else {
            toast.error(salesResult.error as string);
        }

        if (topResult.success) {
            setTopItems((topResult.data as TopItem[]) || []);
        }

        if (hourlyResult.success) {
            setHourlyData((hourlyResult.data as HourlyData[]) || []);
        }

        if (categoryResult.success) {
            setCategoryData((categoryResult.data as {category: string; revenue: number; itemsSold: number}[]) || []);
        }

        if (staffResult.success) {
            setStaffData((staffResult.data as {name: string; orderCount: number; revenue: number}[]) || []);
        }

        if (laborResult.success && laborResult.data) {
            setLaborData(laborResult.data);
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
                  onClick={async () => {
                    const result = await exportSalesReportCSV(startDate, endDate);
                    if (result.success && result.data) {
                        const blob = new Blob([result.data], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `sales_report_${formatDate(startDate, "yyyy-MM-dd")}_to_${formatDate(endDate, "yyyy-MM-dd")}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        toast.success("Ledger exported successfully");
                    } else {
                        toast.error(result.error as string || "Export failed");
                    }
                  }}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-6 py-3 rounded-2xl text-sm font-black text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-xl active:scale-95 uppercase tracking-widest md:mt-[-32px]"
                >
                    <Download className="w-4 h-4" /> Export Ledger
                </button>
            </div>

            {/* Date Range Presets */}
            <div className="glass-card rounded-3xl p-6 border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Quick Ranges</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {datePresets.map(preset => (
                        <button
                            key={preset.label}
                            onClick={() => applyPreset(preset)}
                            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                activePreset === preset.label
                                    ? 'bg-primary text-black shadow-[0_5px_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-primary/50 hover:text-white'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                    {activePreset && (
                        <button
                            onClick={() => setActivePreset(null)}
                            className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-800/50 text-slate-500 border border-slate-700 hover:text-red-400 hover:border-red-500/50 transition-all"
                        >
                            Clear
                        </button>
                    )}
                </div>
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
                                    <p className="text-3xl font-black text-white leading-none">GH₵{totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 flex flex-col justify-center border-emerald-500/20 bg-emerald-500/5 transition-all hover:scale-105">
                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <CreditCard className="w-3 h-3" /> Avg. Order
                    </p>
                    <p className="text-3xl font-black text-white">
                        GH₵{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00"}
                    </p>
                </div>

                <div className="glass-card rounded-3xl p-8 flex flex-col justify-center border-red-500/20 bg-red-500/5 transition-all hover:scale-105">
                    <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Est. Labor
                    </p>
                    <p className="text-3xl font-black text-white">
                        GH₵{laborData.estLaborCost.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                        {laborData.totalHours} Duty Hours • {laborData.shiftCount} Cycles
                    </p>
                </div>
            </div>

            {/* Top Items Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-black text-white tracking-tight">Top Culinary Performers</h3>
                    </div>
                    
                    <div className="space-y-6">
                        {topItems.length === 0 && !isLoading && (
                            <p className="text-slate-500 text-sm italic py-10 text-center">No item data for this period.</p>
                        )}
                        {topItems.map((item, idx) => (
                            <div key={item.name} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Rank #{idx + 1}</span>
                                        <h4 className="text-lg font-bold text-white">{item.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{item.quantity} sold</p>
                                        <p className="text-xs text-slate-500 font-bold">GH₵{item.revenue.toFixed(2)} revenue</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(item.quantity / (topItems[0]?.quantity || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 border-slate-800 flex flex-col items-center justify-center gap-6 text-center group">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter italic">MVP of the Menu</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            {topItems.length > 0 
                                ? <><span className="text-white font-black">{topItems[0].name}</span> is your current best seller with {topItems[0].quantity} units moved.</>
                                : "Discover your signature dish by analyzing sales distribution."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Busy Hours Section */}
            <div className="glass-card rounded-3xl p-8 border-slate-800">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-primary rotate-90" />
                        <h3 className="text-xl font-black text-white tracking-tight text-primary uppercase italic">Peak Performance Hours</h3>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex items-end gap-1 md:gap-2 px-2 border-b border-slate-800 h-48">
                        {hourlyData.map((data) => {
                            const maxCount = Math.max(...hourlyData.map(d => d.count), 1);
                            const height = (data.count / maxCount) * 100;
                            return (
                                <div key={data.hour} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                                    <div 
                                        className={`w-full ${height > 0 ? "bg-primary/20 group-hover:bg-primary transition-all rounded-t-lg" : "bg-slate-800/10"}`} 
                                        style={{ height: `${Math.max(2, height)}%` }}
                                    >
                                        {height > 0 && (
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none border border-primary/40 font-black shadow-2xl">
                                                {data.count} Orders
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between px-2">
                        {[0, 4, 8, 12, 16, 20, 23].map((h) => (
                            <div key={h} className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                {h}:00
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Busiest Window</p>
                        <p className="text-2xl font-black text-white">
                            {hourlyData.length > 0 
                                ? `${hourlyData.reduce((prev, current) => (prev.count > current.count) ? prev : current).hour}:00` 
                                : "--:--"
                            }
                        </p>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Strategic Insight</p>
                        <p className="text-sm font-bold text-slate-300">
                            Peak sales period is identified. Consider adjusting staffing levels and prep-work schedules accordingly to maintain service quality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Revenue Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-3xl p-8 border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <PieChart className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-black text-white tracking-tight">Revenue by Category</h3>
                    </div>
                    
                    <div className="space-y-5">
                        {categoryData.length === 0 && !isLoading && (
                            <p className="text-slate-500 text-sm italic py-10 text-center">No category data for this period.</p>
                        )}
                        {categoryData.map((cat, idx) => {
                            const maxRevenue = categoryData[0]?.revenue || 1;
                            const percentage = (cat.revenue / maxRevenue) * 100;
                            return (
                                <div key={cat.category} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">#{idx + 1}</span>
                                            <h4 className="text-base font-bold text-white">{cat.category}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-white">GH₵{cat.revenue.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500 font-bold">{cat.itemsSold} items</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-primary to-amber-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Staff Performance Section */}
                <div className="glass-card rounded-3xl p-8 border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <Award className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-black text-white tracking-tight">Staff Leaderboard</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {staffData.length === 0 && !isLoading && (
                            <p className="text-slate-500 text-sm italic py-10 text-center">No staff data for this period.</p>
                        )}
                        {staffData.map((staff, idx) => (
                            <div 
                                key={staff.name} 
                                className={`p-4 rounded-2xl border transition-all ${
                                    idx === 0 
                                        ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                                        : 'bg-slate-800/40 border-slate-700/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                                            idx === 0 ? 'bg-primary text-black' : 
                                            idx === 1 ? 'bg-slate-600 text-white' : 
                                            idx === 2 ? 'bg-amber-700 text-white' : 
                                            'bg-slate-700 text-slate-400'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${idx === 0 ? 'text-primary' : 'text-white'}`}>
                                                {staff.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium">{staff.orderCount} orders processed</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black ${idx === 0 ? 'text-primary' : 'text-white'}`}>
                                            GH₵{staff.revenue.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                            <span className="text-lg font-black text-white">GH₵{order.totalAmount.toFixed(2)}</span>
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

