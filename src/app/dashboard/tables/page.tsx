import { getTables, getReservationsByDate } from "@/actions/table";
import TableGrid from "@/components/global/table-grid";
import ReservationList from "@/components/global/reservation-list";
import { DashboardHeader } from "@/components/global/dashboard-header";
import { LayoutGrid, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

interface TableWithOrders {
    id: string;
    number: string;
    capacity: number;
    status: string;
    orders?: { id: string }[];
}

interface Reservation {
    id: string;
    customerName: string;
    customerPhone: string | null;
    guestCount: number;
    startTime: Date;
    endTime: Date | null;
    status: string;
    restaurantTable: {
        number: string;
    };
}

export default async function TablesPage() {
  const [tablesResult, reservationsResult] = await Promise.all([
    getTables(),
    getReservationsByDate(new Date())
  ]);

  const tables = (tablesResult.success ? tablesResult.data : []) as TableWithOrders[];
  const reservations = (reservationsResult.success ? reservationsResult.data : []) as Reservation[];

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader 
        title="Bistro Blueprint" 
        subtitle="Manage seating flow and guest bookings" 
      />

      {/* Tabs Container */}
      <div className="space-y-8">
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 w-fit mx-auto md:mx-0">
          <div className="flex items-center gap-1">
             <a href="#floor-plan" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-black text-xs tracking-widest transition-all">
                <LayoutGrid className="w-4 h-4" /> FLOOR PLAN
             </a>
             <a href="#bookings" className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 hover:text-white font-black text-xs tracking-widest transition-all">
                <ClipboardList className="w-4 h-4" /> RESERVATIONS
             </a>
          </div>
        </div>

        <div id="floor-plan" className="target:block">
            <TableGrid tables={tables} />
        </div>

        <div id="bookings" className="hidden target:block space-y-8">
            <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                      Upcoming Bookings
                   </h2>
                   <p className="text-slate-500 text-sm font-medium mt-1">Confirmed reservations for today</p>
                </div>
            </div>
            <ReservationList initialReservations={reservations} />
        </div>
      </div>
    </div>
  );
}
