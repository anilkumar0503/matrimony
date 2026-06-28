"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, UserCheck, UserX, Eye, ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, calculateAge } from "@/lib/utils";

const STATUS_OPTIONS = ["", "PENDING_PROFILE", "PENDING_KYC", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DELETION_REQUESTED"];
const KYC_OPTIONS = ["", "PENDING", "APPROVED", "REJECTED"];

interface User {
  id: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  createdAt: string;
  profile: { fullName: string; city: string; state: string } | null;
  kycSubmissions: { status: string }[];
  subscriptions: { plan: { name: string; tier: string } }[];
  images: { originalUrl: string }[];
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "glass"> = {
  ACTIVE: "success",
  PENDING_PROFILE: "warning",
  PENDING_KYC: "warning",
  PENDING_APPROVAL: "info",
  SUSPENDED: "danger",
  DELETED: "danger",
  DELETION_REQUESTED: "danger",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [actionTarget, setActionTarget] = useState<{ id: string; action: string } | null>(null);
  const [actionReason, setActionReason] = useState("");
  
  // Create/Edit modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: "",
    phone: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    dateOfBirth: "",
    fullName: "",
    city: "",
    state: "",
    sendEmail: true,
  });
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (kycStatus) params.set("kycStatus", kycStatus);
    const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    
    if (res.status === 401) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("adminInfo");
      window.location.replace("/admin/login");
      return;
    }
    
    const json = await res.json();
    if (json.success) { setUsers(json.data.users); setTotal(json.data.pagination.total); }
    setLoading(false);
  }, [page, search, status, kycStatus]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const performAction = async () => {
    if (!actionTarget) return;
    const res = await fetch(`/api/admin/users/${actionTarget.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionTarget.action, reason: actionReason }),
    });
    
    if (res.status === 401) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("adminInfo");
      window.location.replace("/admin/login");
      return;
    }
    
    const json = await res.json();
    if (json.success) { setActionTarget(null); setActionReason(""); fetchUsers(); }
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const url = editingUser ? "/api/admin/users" : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser 
        ? { id: editingUser.id, ...userForm }
        : userForm;
      
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const json = await res.json();
      if (json.success) {
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({ email: "", phone: "", gender: "MALE", dateOfBirth: "", fullName: "", city: "", state: "", sendEmail: true });
        fetchUsers();
      } else {
        alert(json.message || "Failed to save user");
      }
    } catch (err) {
      alert("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    
    if (res.ok) {
      fetchUsers();
    } else {
      alert("Failed to delete user");
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      phone: user.phone,
      gender: user.gender as "MALE" | "FEMALE" | "OTHER",
      dateOfBirth: user.dateOfBirth?.split("T")[0] || "",
      fullName: user.profile?.fullName || "",
      city: user.profile?.city || "",
      state: user.profile?.state || "",
      sendEmail: false,
    });
    setShowUserModal(true);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Members</h1>
          <p className="text-muted text-sm">{total} total members</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => { setEditingUser(null); setUserForm({ email: "", phone: "", gender: "MALE", dateOfBirth: "", fullName: "", city: "", state: "", sendEmail: true }); setShowUserModal(true); }}>
          <Plus size={14} /> Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-wrap md:flex-nowrap gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-glass input-glass-with-icon w-full"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-glass flex-1" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select className="input-glass flex-1" value={kycStatus} onChange={(e) => { setKycStatus(e.target.value); setPage(1); }}>
          <option value="">All KYC</option>
          {KYC_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="glass" size="sm" className="flex-1" onClick={fetchUsers}>
          <Filter size={14} /> Apply
        </Button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Member", "Contact", "Status", "KYC", "Plan", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground text-sm">{user.profile?.fullName || "—"}</div>
                    <div className="text-muted text-xs">{user.gender} · {user.dateOfBirth ? calculateAge(user.dateOfBirth) + " yrs" : "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-muted text-xs">{user.email}</div>
                    <div className="text-muted text-xs">{user.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariantMap[user.status] || "glass"}>
                      {user.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.kycSubmissions[0] ? (
                      <Badge variant={user.kycSubmissions[0].status === "APPROVED" ? "success" : user.kycSubmissions[0].status === "REJECTED" ? "danger" : "warning"}>
                        {user.kycSubmissions[0].status}
                      </Badge>
                    ) : <span className="text-muted text-xs">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted text-xs">{user.subscriptions[0]?.plan?.name || "Free"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted text-xs">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/users/${user.id}`}><Eye size={14} /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} title="Edit">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} title="Delete" className="text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </Button>
                      {user.status !== "ACTIVE" && (
                        <Button variant="glass" size="sm" className="text-xs h-7"
                          onClick={() => setActionTarget({ id: user.id, action: "APPROVE" })}>
                          <UserCheck size={12} /> Approve
                        </Button>
                      )}
                      {user.status === "ACTIVE" && (
                        <Button variant="danger" size="sm" className="text-xs h-7"
                          onClick={() => setActionTarget({ id: user.id, action: "SUSPEND" })}>
                          <UserX size={12} /> Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-muted text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action modal */}
      {actionTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setActionTarget(null)}>
          <div className="bg-background border border-border p-6 rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-4">
              {actionTarget.action === "APPROVE" ? "Approve Member" : "Suspend Member"}
            </h3>
            <textarea
              className="input-glass min-h-[80px] mb-4"
              placeholder="Reason (optional for approve, required for suspend)"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => setActionTarget(null)} className="flex-1">Cancel</Button>
              <Button
                variant={actionTarget.action === "APPROVE" ? "gold" : "danger"}
                onClick={performAction}
                className="flex-1"
              >
                Confirm {actionTarget.action}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowUserModal(false)}>
          <div className="bg-background border border-border p-6 rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-4">
              {editingUser ? "Edit Member" : "Add New Member"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Full Name *</label>
                <input
                  className="input-glass w-full"
                  placeholder="Enter full name"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Email *</label>
                <input
                  className="input-glass w-full"
                  type="email"
                  placeholder="Enter email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Phone *</label>
                <input
                  className="input-glass w-full"
                  placeholder="Enter phone number"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Gender *</label>
                <select
                  className="input-glass w-full"
                  value={userForm.gender}
                  onChange={(e) => setUserForm({ ...userForm, gender: e.target.value as "MALE" | "FEMALE" | "OTHER" })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Date of Birth *</label>
                <input
                  className="input-glass w-full"
                  type="date"
                  value={userForm.dateOfBirth}
                  onChange={(e) => setUserForm({ ...userForm, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">City</label>
                <input
                  className="input-glass w-full"
                  placeholder="Enter city"
                  value={userForm.city}
                  onChange={(e) => setUserForm({ ...userForm, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">State</label>
                <input
                  className="input-glass w-full"
                  placeholder="Enter state"
                  value={userForm.state}
                  onChange={(e) => setUserForm({ ...userForm, state: e.target.value })}
                />
              </div>
              {!editingUser && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={userForm.sendEmail}
                    onChange={(e) => setUserForm({ ...userForm, sendEmail: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="sendEmail" className="text-xs text-muted">
                    Send welcome email with login credentials (Password: Welcome@jm)
                  </label>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="glass" onClick={() => setShowUserModal(false)} className="flex-1">Cancel</Button>
              <Button variant="gold" onClick={handleSaveUser} loading={saving} className="flex-1">
                {editingUser ? "Update" : "Create"} Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
