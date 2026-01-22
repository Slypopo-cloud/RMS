"use client";

import { useState } from "react";
import { createReservation } from "@/actions/table";
import { toast } from "sonner";
import { Users, Calendar, Clock, Phone, User as UserIcon, MessageSquare } from "lucide-react";

interface ReservationFormProps {
  tables: { id: string; number: string; capacity: number }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReservationForm({ tables, onSuccess, onCancel }: ReservationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    guestCount: 2,
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    durationMinutes: 120,
    tableId: tables[0]?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const result = await createReservation({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        guestCount: Number(formData.guestCount),
        startTime,
        durationMinutes: Number(formData.durationMinutes),
        tableId: formData.tableId,
      });

      if (result.success) {
        toast.success("Reservation confirmed!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error as string || "Failed to create reservation");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Details */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
              <UserIcon className="w-3 h-3" /> Guest Name
            </label>
            <input
              required
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
              <Phone className="w-3 h-3" /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="+1234567890"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
              <Users className="w-3 h-3" /> Guest Count
            </label>
            <input
              required
              type="number"
              min="1"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold"
            />
          </div>
        </div>

        {/* Schedule & Table */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Time
              </label>
              <input
                required
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Duration (min)
            </label>
            <select
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold appearance-none"
            >
              <option value={60}>1 Hour</option>
              <option value={90}>1.5 Hours</option>
              <option value={120}>2 Hours</option>
              <option value={180}>3 Hours</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
              <Users className="w-3 h-3" /> Preferred Table
            </label>
            <select
              required
              value={formData.tableId}
              onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition-all text-sm font-bold appearance-none"
            >
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.number} (Cap: {table.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-6 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          disabled={isLoading}
          type="submit"
          className="flex-1 py-3 px-6 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isLoading ? "Confirming..." : "Confirm Reservation"}
        </button>
      </div>
    </form>
  );
}
