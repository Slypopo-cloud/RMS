"use client";

import { useState } from "react";
import { 
  Plus, 
  Users, 
  Calendar, 
  Trash2, 
  Hash,
  Info
} from "lucide-react";
import { createTable, deleteTable, createReservation } from "@/actions/table";
import { toast } from "sonner";

interface Table {
    id: string;
    number: string;
    capacity: number;
    status: string;
    orders?: { id: string }[];
}

interface TableGridProps {
  tables: Table[];
}

export default function TableGrid({ tables }: TableGridProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [newTable, setNewTable] = useState({ number: "", capacity: 4 });
  const [booking, setBooking] = useState({
      customerName: "",
      customerPhone: "",
      guestCount: 2,
      startTime: "",
      durationMinutes: 120
  });

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTable(newTable.number, newTable.capacity);
    if (result.success) {
      toast.success(result.message);
      setShowAddModal(false);
      setNewTable({ number: "", capacity: 4 });
    } else {
      toast.error(result.error as string);
    }
  };

  const handleBookReservation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTable) return;

      const result = await createReservation({
          ...booking,
          startTime: new Date(booking.startTime),
          tableId: selectedTable.id
      });

      if (result.success) {
          toast.success(result.message);
          setShowBookModal(false);
          setBooking({ customerName: "", customerPhone: "", guestCount: 2, startTime: "", durationMinutes: 120 });
      } else {
          toast.error(result.error as string);
      }
  };

  const handleDelete = async (id: string, number: string) => {
      if (confirm(`Are you sure you want to delete Table ${number}?`)) {
          const result = await deleteTable(id);
          if (result.success) toast.success(result.message);
          else toast.error(result.error as string);
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "OCCUPIED": return "text-primary border-primary/20 bg-primary/5";
      case "RESERVED": return "text-blue-400 border-blue-500/20 bg-blue-500/5";
      case "OUT_OF_ORDER": return "text-red-400 border-red-500/20 bg-red-500/5";
      default: return "text-slate-400 border-slate-700 bg-slate-800/50";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
             <div className="w-2 h-8 bg-primary rounded-full"></div>
             Floor Plan
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Real-time status of all dining stations</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 text-black" strokeWidth={3} /> Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div 
            key={table.id} 
            className="glass-card rounded-2xl p-6 flex flex-col gap-5 group hover:border-primary/30 transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
               <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
                  <span className="text-xl font-black text-white">{table.number}</span>
               </div>
               <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(table.status)}`}>
                  {table.status}
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-3 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-bold">Capacity: {table.capacity} guests</span>
               </div>
               <div className="flex items-center gap-3 text-slate-400">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-bold">Orders: {table.orders?.length || 0} active</span>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex items-center gap-2">
               <button 
                 onClick={() => handleDelete(table.id, table.number)}
                 className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => {
                     setSelectedTable(table);
                     setShowBookModal(true);
                 }}
                 className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
               >
                  <Calendar className="w-4 h-4" /> Book
               </button>
            </div>
          </div>
        ))}

        {tables.length === 0 && (
          <div className="col-span-full py-20 glass-card rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-4">
             <Hash className="w-16 h-16 opacity-10" />
             <p className="font-bold uppercase tracking-widest text-xs italic">No tables configured for this bistro.</p>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-3xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight">New Station</h3>
              <p className="text-slate-500 font-medium">Add a new table to the restaurant floor</p>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Table Reference</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input
                    type="text"
                    required
                    value={newTable.number}
                    onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                    placeholder="e.g. 101, B1"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seating Capacity</label>
                <div className="relative">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input
                    type="number"
                    required
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-amber-500 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/10 active:scale-95 text-lg"
              >
                Register Table
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Book Reservation Modal */}
      {showBookModal && selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-3xl relative">
                  <button 
                      onClick={() => setShowBookModal(false)}
                      className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                  >
                      <Plus className="w-6 h-6 rotate-45" />
                  </button>

                  <div className="mb-8">
                      <h3 className="text-2xl font-black text-white tracking-tight">Table {selectedTable.number}</h3>
                      <p className="text-slate-500 font-medium">Schedule a new reservation</p>
                  </div>

                  <form onSubmit={handleBookReservation} className="space-y-5">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Guest Name</label>
                          <input
                              type="text"
                              required
                              value={booking.customerName}
                              onChange={(e) => setBooking({ ...booking, customerName: e.target.value })}
                              placeholder="John Doe"
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Guests</label>
                            <input
                                type="number"
                                required
                                max={selectedTable.capacity}
                                value={booking.guestCount}
                                onChange={(e) => setBooking({ ...booking, guestCount: parseInt(e.target.value) })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duration (Min)</label>
                            <input
                                type="number"
                                required
                                value={booking.durationMinutes}
                                onChange={(e) => setBooking({ ...booking, durationMinutes: parseInt(e.target.value) })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date & Time</label>
                          <input
                              type="datetime-local"
                              required
                              value={booking.startTime}
                              onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all invert-calendar-icon"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone (Optional)</label>
                          <input
                              type="text"
                              value={booking.customerPhone}
                              onChange={(e) => setBooking({ ...booking, customerPhone: e.target.value })}
                              placeholder="+1 234 567 890"
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                          />
                      </div>

                      <button
                          type="submit"
                          className="w-full bg-primary hover:bg-amber-500 text-black font-black py-4 rounded-xl transition-all shadow-xl shadow-primary/10 active:scale-95 text-lg mt-4"
                      >
                          Confirm Booking
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
