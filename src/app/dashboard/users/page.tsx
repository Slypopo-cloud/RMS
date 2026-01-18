import { DashboardHeader } from "@/components/global/dashboard-header";
import { fetchUsers } from "@/actions/user";
import { UserManager } from "@/components/global/user-manager";

export default async function UserManagementPage() {
  const users = await fetchUsers();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <DashboardHeader 
        title="Personnel Nexus" 
        subtitle="Manage system-wide operator access and roles"
      />
      
      <UserManager initialUsers={users} />
    </div>
  );
}
