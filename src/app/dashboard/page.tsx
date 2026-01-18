import { auth } from "@/auth";
import { handleSignOut } from "@/actions/auth";
import Link from "next/link";
import { 
  Calculator, 
  ChefHat, 
  ClipboardList, 
  UtensilsCrossed, 
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  FileText,
  ChevronRight,
  Users
} from "lucide-react";
import { getDashboardStats } from "@/actions/analytics";
import { RestockButton } from "@/components/global/restock-button";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  // const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
  
  const statsResult = await getDashboardStats();
  const stats = (statsResult.success && statsResult.data) 
    ? statsResult.data 
    : { todayRevenue: 0, todayOrders: 0, lowStockAlerts: 0, lowStockItems: [] };

  const allActions = [
    {
      title: "New Order (POS)",
      href: "/dashboard/pos",
      icon: Calculator,
      color: "bg-blue-500",
      description: "Create new orders for customers",
      allowedRoles: ["ADMIN", "MANAGER", "CASHIER"]
    },
    {
      title: "Kitchen Display",
      href: "/dashboard/kitchen",
      icon: ChefHat,
      color: "bg-orange-500",
      description: "View and manage active orders",
      allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"]
    },
    {
      title: "Order History",
      href: "/dashboard/orders",
      icon: ClipboardList,
      color: "bg-green-500",
      description: "View past orders and sales",
      allowedRoles: ["ADMIN", "MANAGER", "CASHIER"]
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      color: "bg-purple-500",
      description: "Manage stock levels",
      allowedRoles: ["ADMIN", "MANAGER"]
    },
    {
      title: "Tables & Reservations",
      href: "/dashboard/tables",
      icon: Users,
      color: "bg-teal-500",
      description: "Manage table layouts and guest bookings",
      allowedRoles: ["ADMIN", "MANAGER", "CASHIER"]
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: FileText,
      color: "bg-amber-500",
      description: "View sales analytics",
      allowedRoles: ["ADMIN", "MANAGER"]
    },
    {
      title: "Menu Management",
      href: "/dashboard/menu",
      icon: UtensilsCrossed,
      color: "bg-pink-500",
      description: "Update menu items and prices",
      allowedRoles: ["ADMIN", "MANAGER"]
    },
    {
      title: "User Management",
      href: "/dashboard/users",
      icon: Users,
      color: "bg-indigo-500",
      description: "Manage operator access and roles",
      allowedRoles: ["ADMIN", "MANAGER"]
    },
  ];

  const quickActions = allActions.filter(action => 
    role && action.allowedRoles.includes(role)
  );

  const allMetrics = [
    {
      label: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
      allowedRoles: ["ADMIN", "MANAGER"]
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-100",
      allowedRoles: ["ADMIN", "MANAGER", "CASHIER", "KITCHEN_STAFF"]
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockAlerts.toString(),
      icon: AlertTriangle,
      color: stats.lowStockAlerts > 0 ? "text-red-600" : "text-gray-400",
      bg: stats.lowStockAlerts > 0 ? "bg-red-100" : "bg-gray-100",
      allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"]
    }
  ];

  const metrics = allMetrics.filter(m => role && m.allowedRoles.includes(role));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* Header section with glass effect */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 p-6 glass-card rounded-2xl">
        <div>
           <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Vantage <span className="text-primary">RMS</span>
           </h1>
           <p className="text-slate-400 font-medium">Welcome back, {session?.user?.name || "User"} • <span className="text-primary/80 uppercase text-xs tracking-widest ml-1">{role || "Guest"}</span></p>
        </div>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-lg active:scale-95"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Metrics Row - Using interactive glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
             <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 rounded-full ${metric.bg} blur-3xl group-hover:opacity-20 transition-opacity`}></div>
             <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${metric.bg} ${metric.color} flex items-center justify-center shadow-inner`}>
                   <metric.icon className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
                   <p className="text-3xl font-black text-white">{metric.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Stock Alerts - Warning style */}
      {stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <div className="mb-12 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <h2 className="font-black text-2xl text-white tracking-tight">Critical Warnings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.lowStockItems.map((item: { id: string; name: string; quantity: number; unit: string; threshold: number }) => (
              <div key={item.id} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-white">{item.name}</p>
                    <p className="text-sm text-red-200/60 font-medium">In Stock: {item.quantity} {item.unit}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                   <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(10, (item.quantity / item.threshold) * 100)}%` }}
                   ></div>
                </div>
                <RestockButton 
                  itemId={item.id} 
                  itemName={item.name} 
                  threshold={item.threshold} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - Grid of high-end tiles */}
      <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
        <div className="w-2 h-8 bg-primary rounded-full"></div>
        Management Hub
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link 
            key={action.href} 
            href={action.href}
            className="block group"
          >
            <div className="glass-card rounded-2xl p-8 h-full transition-all group-hover:bg-slate-800/80 group-hover:-translate-y-2 group-hover:border-primary/40 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
               <div className={`w-16 h-16 rounded-2xl ${action.color} text-white flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all ring-4 ring-white/5`}>
                 <action.icon className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                 {action.title}
               </h3>
               <p className="text-slate-400 font-medium line-clamp-2 leading-relaxed">
                 {action.description}
               </p>
               <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Module <ChevronRight className="w-4 h-4" />
               </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Footer Info */}
      <div className="mt-16 flex justify-center">
        <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full border-slate-800/50">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <p className="text-sm font-bold text-slate-400">
               System Core v1.0.0 • Secure Session: <span className="text-slate-200">{session?.user?.email}</span>
            </p>
        </div>
      </div>
    </div>
  );
}
