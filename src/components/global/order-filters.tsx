"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

interface OrderFiltersProps {
    onSearch: (query: string) => void;
    onStatusFilter: (status: string) => void;
    onPaymentFilter: (payment: string) => void;
}

export function OrderFilters({ onSearch, onStatusFilter, onPaymentFilter }: OrderFiltersProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedPayment, setSelectedPayment] = useState("ALL");

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        onStatusFilter(value);
    };

    const handlePaymentChange = (value: string) => {
        setSelectedPayment(value);
        onPaymentFilter(value);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedStatus("ALL");
        setSelectedPayment("ALL");
        onSearch("");
        onStatusFilter("ALL");
        onPaymentFilter("ALL");
    };

    const hasActiveFilters = searchQuery || selectedStatus !== "ALL" || selectedPayment !== "ALL";

    return (
        <div className="glass-card rounded-3xl p-6 mb-6 border-slate-800">
            <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-white tracking-tight">Search & Filter</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs font-black text-slate-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by Order ID or Table..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white font-medium text-sm outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-4 text-white font-bold text-sm outline-none appearance-none focus:border-primary/50 transition-all cursor-pointer"
                >
                    <option value="ALL" className="bg-slate-900">All Statuses</option>
                    <option value="PENDING" className="bg-slate-900">Pending</option>
                    <option value="PREPARING" className="bg-slate-900">Preparing</option>
                    <option value="READY" className="bg-slate-900">Ready</option>
                    <option value="COMPLETED" className="bg-slate-900">Completed</option>
                    <option value="CANCELLED" className="bg-slate-900">Cancelled</option>
                </select>

                {/* Payment Filter */}
                <select
                    value={selectedPayment}
                    onChange={(e) => handlePaymentChange(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-4 text-white font-bold text-sm outline-none appearance-none focus:border-primary/50 transition-all cursor-pointer"
                >
                    <option value="ALL" className="bg-slate-900">All Payments</option>
                    <option value="PENDING" className="bg-slate-900">Pending</option>
                    <option value="PAID" className="bg-slate-900">Paid</option>
                    <option value="REFUNDED" className="bg-slate-900">Refunded</option>
                </select>
            </div>
        </div>
    );
}
