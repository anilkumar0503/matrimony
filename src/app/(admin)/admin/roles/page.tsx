"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { FileText, PlusCircle, Pencil, Trash2, X, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Permission { id: string; code: string; description: string; module: string }
interface Role {
  id: string; name: string; description: string | null; isDefault: boolean; isEditable: boolean;
  rolePermissions: { permission: Permission }[];
  _count?: { adminUsers: number };
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const form = useForm<{ name: string; description: string }>();
  const token = () => localStorage.getItem("adminAccessToken");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      fetch("/api/admin/roles", { headers: { Authorization: `Bearer ${token()}` } }),
      fetch("/api/admin/permissions", { headers: { Authorization: `Bearer ${token()}` } }),
    ]);
    const [rolesJson, permsJson] = await Promise.all([rolesRes.json(), permsRes.json()]);
    if (rolesJson.success) setRoles(rolesJson.data.roles);
    if (permsJson.success) setPermissions(permsJson.data.permissions);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    form.reset({ name: "", description: "" });
    setSelectedPerms([]);
    setShowEditor(true);
  };

  const openEdit = (role: Role) => {
    if (!role.isEditable) return;
    setEditId(role.id);
    form.reset({ name: role.name, description: role.description || "" });
    setSelectedPerms(role.rolePermissions.map(rp => rp.permission.id));
    setShowEditor(true);
  };

  const togglePerm = (id: string) => {
    setSelectedPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const onSave = async (data: { name: string; description: string }) => {
    setSaving(true);
    const url = editId ? `/api/admin/roles/${editId}` : "/api/admin/roles";
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, permissionIds: selectedPerms }),
    });
    setSaving(false);
    setShowEditor(false);
    fetchData();
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    await fetch(`/api/admin/roles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    fetchData();
  };

  const modules = [...new Set(permissions.map(p => p.module))].sort();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-[#C9972C]" /> Roles & Permissions
          </h1>
          <p className="text-white/40 text-sm">{roles.length} roles · {permissions.length} permissions</p>
        </div>
        <Button variant="gold" onClick={openCreate}><PlusCircle size={16} /> New Role</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="glass p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-white">{role.name}</span>
                    {role.isDefault && <Badge variant="gold" className="text-[10px]">Default</Badge>}
                    {!role.isEditable && <Badge variant="glass" className="text-[10px]">System</Badge>}
                    {role._count && (
                      <span className="text-white/40 text-xs">{role._count.adminUsers} admins</span>
                    )}
                  </div>
                  {role.description && <p className="text-white/50 text-xs mb-3">{role.description}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {role.rolePermissions.slice(0, 8).map(rp => (
                      <span key={rp.permission.id} className="text-[10px] text-white/50 bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 rounded-full font-mono">
                        {rp.permission.code}
                      </span>
                    ))}
                    {role.rolePermissions.length > 8 && (
                      <span className="text-[10px] text-white/30">+{role.rolePermissions.length - 8} more</span>
                    )}
                  </div>
                </div>
                {role.isEditable && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(role)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deleteRole(role.id)}><Trash2 size={14} /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex items-start justify-center p-4 pt-8" onClick={() => setShowEditor(false)}>
          <div className="glass-dark p-6 rounded-2xl max-w-2xl w-full my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{editId ? "Edit Role" : "New Role"}</h3>
              <button onClick={() => setShowEditor(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Role Name" {...form.register("name", { required: "Required" })}
                  error={form.formState.errors.name?.message} />
                <Input label="Description" {...form.register("description")} />
              </div>

              <div>
                <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                  Permissions ({selectedPerms.length} selected)
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {modules.map(module => (
                    <div key={module}>
                      <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-semibold">{module}</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {permissions.filter(p => p.module === module).map(perm => (
                          <label key={perm.id} className="flex items-start gap-2 cursor-pointer group">
                            <div
                              onClick={() => togglePerm(perm.id)}
                              className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors cursor-pointer
                                ${selectedPerms.includes(perm.id) ? "bg-[#C9972C] border-[#C9972C]" : "border-white/20 hover:border-white/40"}`}
                            >
                              {selectedPerms.includes(perm.id) && <Check size={10} className="text-[#1a0505]" />}
                            </div>
                            <div>
                              <div className="text-white/70 text-xs font-mono group-hover:text-white transition-colors">{perm.code}</div>
                              <div className="text-white/30 text-[10px]">{perm.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="glass" type="button" onClick={() => setShowEditor(false)} className="flex-1">Cancel</Button>
                <Button variant="gold" type="submit" loading={saving} className="flex-1">
                  {editId ? "Update Role" : "Create Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
