"use client";

import { useState } from "react";
import { UserPlus, Trash2, Shield, User, Mail, ShieldCheck, Briefcase, ShoppingCart, Utensils, X, Loader2 } from "lucide-react";
import { createUser, deleteUser } from "@/actions/user";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: Date;
}

export function UserManager({ initialUsers }: { initialUsers: UserData[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [isPending, setIsPending] = useState(false);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    const result = await createUser(formData);
    
    if (result.success) {
      toast.success("User created successfully");
      setIsAdding(false);
      window.location.reload(); // Refresh to show new user
    } else {
      toast.error(result.error || "Failed to create user");
    }
    setIsPending(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    
    const result = await deleteUser(id);
    if (result.success) {
      toast.success("User removed successfully");
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to remove user");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-md text-[10px] font-black tracking-widest flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> ADMIN</span>;
      case "MANAGER":
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-1 rounded-md text-[10px] font-black tracking-widest flex items-center gap-1.5"><Briefcase className="w-3 h-3"/> MANAGER</span>;
      case "CASHIER":
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-black tracking-widest flex items-center gap-1.5"><ShoppingCart className="w-3 h-3"/> CASHIER</span>;
      case "KITCHEN_STAFF":
        return <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-1 rounded-md text-[10px] font-black tracking-widest flex items-center gap-1.5"><Utensils className="w-3 h-3"/> KITCHEN</span>;
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white tracking-tight">Active Personnel</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-black font-black px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
        >
          <UserPlus className="w-4 h-4" />
          ADD STAFF
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary border border-slate-700 font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">@{user.username}</td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">New Identity</h3>
              <p className="text-slate-400 text-sm">Provision a new personnel account</p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="name"
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <input
                    name="username"
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                    placeholder="jdoe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Role</label>
                  <select
                    name="role"
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="KITCHEN_STAFF">Kitchen</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                    placeholder="john@rms.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 px-4 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-black font-black py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "PROVISION ACCOUNT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
