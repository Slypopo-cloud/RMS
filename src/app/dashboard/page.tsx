import { auth, signOut } from "@/auth";
import Link from "next/link";
import { 
  Calculator, 
  ChefHat, 
  ClipboardList, 
  UtensilsCrossed, 
  Package 
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const isAdminOrManager = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";

  const quickActions = [
    {
      title: "New Order (POS)",
      href: "/dashboard/pos",
      icon: Calculator,
      color: "bg-blue-500",
      description: "Create new orders for customers"
    },
    {
      title: "Kitchen Display",
      href: "/dashboard/kitchen",
      icon: ChefHat,
      color: "bg-orange-500",
      description: "View and manage active orders"
    },
    {
      title: "Order History",
      href: "/dashboard/orders",
      icon: ClipboardList,
      color: "bg-green-500",
      description: "View past orders and sales"
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      color: "bg-purple-500",
      description: "Manage stock levels"
    },
  ];

  if (isAdminOrManager) {
    quickActions.push({
      title: "Menu Management",
      href: "/dashboard/menu",
      icon: UtensilsCrossed,
      color: "bg-pink-500",
      description: "Update menu items and prices"
    });
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
           <p className="text-gray-600 mt-1">Welcome back, {session?.user?.name || "User"}!</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link 
            key={action.href} 
            href={action.href}
            className="block group"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-blue-200">
               <div className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                 <action.icon className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                 {action.title}
               </h3>
               <p className="text-sm text-gray-500">
                 {action.description}
               </p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">System Status</h3>
        <p className="text-sm text-blue-700">
           Logged in as <span className="font-bold">{session?.user?.role}</span>. All systems operational.
        </p>
      </div>
    </div>
  );
}
