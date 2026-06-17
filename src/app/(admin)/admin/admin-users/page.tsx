"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Search, PlusCircle, Pencil, Trash2, X, Shield, Check, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface Role { id: string; name: string; description: string | null }
interface AdminUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<{ email: string; password: string; name: string; roleId: string; isActive: boolean }>();
  const token = () => localStorage.getItem("adminAccessToken");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [adminsRes, rolesRes] = await Promise.all([
      fetch("/api/admin/admin-users", { headers: { Authorization: `Bearer ${token()}` } }),
      fetch("/api/admin/roles", { headers: { Authorization: `Bearer ${token()}` } }),
    ]);
    const [adminsJson, rolesJson] = await Promise.all([adminsRes.json(), rolesRes.json()]);
    if (adminsJson.success) setAdminUsers(adminsJson.data.adminUsers);
    if (rolesJson.success) setRoles(rolesJson.data.roles);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    form.reset({ email: "", password: "", name: "", roleId: "", isActive: true });
    setShowEditor(true);
  };

  const openEdit = (admin: AdminUser) => {
    setEditId(admin.id);
    form.reset({
      email: admin.email,
      password: "",
      name: admin.name,
      roleId: admin.roleId,
      isActive: admin.isActive,
    });
    setShowEditor(true);
  };

  const onSave = async (data: { email: string; password: string; name: string; roleId: string; isActive: boolean }) => {
    setSaving(true);
    const url = editId ? `/api/admin/admin-users/${editId}` : "/api/admin/admin-users";
    const method = editId ? "PUT" : "POST";
    
    // Don't send empty password on edit
    const payload = editId ? { ...data, password: data.password || undefined } : data;
    
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (res.ok) {
      setSaving(false);
      setShowEditor(false);
      fetchData();
    } else {
      const json = await res.json();
      alert(json.error || "Failed to save");
      setSaving(false);
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Delete this admin user? This action cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/admin-users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      fetchData();
    } else {
      const json = await res.json();
      alert(json.error || "Failed to delete");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-[#C9972C]" /> Admin Users
          </h1>
          <p className="text-white/40 text-sm">{adminUsers.length} admin accounts</p>
        </div>
        <Button variant="gold" onClick={openCreate}><PlusCircle size={16} /> New Admin</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Admin", "Email", "Role", "Status", "2FA", "Last Login", "Created", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((admin) => (
                  <tr key={admin.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{admin.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white/70">{admin.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="glass" className="text-xs">{admin.role.name}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={admin.isActive ? "success" : "danger"} className="text-xs">
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {admin.totpEnabled ? (
                        <Badge variant="success" className="text-[10px]"><Lock size={10} /> Enabled</Badge>
                      ) : (
                        <span className="text-white/25 text-xs">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white/40 text-xs">
                        {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never"}
                      </div>
                      {admin.lastLoginIp && <div className="text-white/25 text-[10px]">{admin.lastLoginIp}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white/40 text-xs">{formatDate(admin.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(admin)}><Pencil size={14} /></Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400"
                          onClick={() => deleteAdmin(admin.id)}
                          loading={deleting === admin.id}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex items-start justify-center p-4 pt-8" onClick={() => setShowEditor(false)}>
          <div className="glass-dark p-6 rounded-2xl max-w-md w-full my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{editId ? "Edit Admin" : "New Admin"}</h3>
              <button onClick={() => setShowEditor(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <Input label="Name" {...form.register("name", { required: "Required" })} error={form.formState.errors.name?.message} />
              <Input label="Email" type="email" {...form.register("email", { required: "Required" })} error={form.formState.errors.email?.message} />
              <Input
                label={editId ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                {...form.register(editId ? "password" : "password", { required: editId ? false : "Required" })}
                error={form.formState.errors.password?.message}
              />
              <div>
                <label className="block text-xs text-white/50 mb-1">Role</label>
                <select className="input-glass w-full" {...form.register("roleId", { required: "Required" })}>
                  <option value="">Select role</option>
                  {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
                {form.formState.errors.roleId && <p className="text-red-400 text-xs mt-1">{form.formState.errors.roleId.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                  {...form.register("isActive")}
                />
                <label htmlFor="isActive" className="text-white/70 text-sm">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="glass" type="button" onClick={() => setShowEditor(false)} className="flex-1">Cancel</Button>
                <Button variant="gold" type="submit" loading={saving} className="flex-1">
                  {editId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
