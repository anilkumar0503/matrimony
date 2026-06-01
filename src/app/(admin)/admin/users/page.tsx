"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, UserCheck, UserX, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Members</h1>
          <p className="text-white/40 text-sm">{total} total members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            className="input-glass input-glass-with-icon"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-glass w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select className="input-glass w-40" value={kycStatus} onChange={(e) => { setKycStatus(e.target.value); setPage(1); }}>
          <option value="">All KYC</option>
          {KYC_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="glass" size="sm" onClick={fetchUsers}>
          <Filter size={14} /> Apply
        </Button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Member", "Contact", "Status", "KYC", "Plan", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white text-sm">{user.profile?.fullName || "—"}</div>
                    <div className="text-white/40 text-xs">{user.gender} · {user.dateOfBirth ? calculateAge(user.dateOfBirth) + " yrs" : "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white/70 text-xs">{user.email}</div>
                    <div className="text-white/40 text-xs">{user.phone}</div>
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
                    ) : <span className="text-white/25 text-xs">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white/60 text-xs">{user.subscriptions[0]?.plan?.name || "Free"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white/40 text-xs">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/users/${user.id}`}><Eye size={14} /></Link>
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
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-white/40 text-xs">Page {page} of {totalPages}</span>
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
          <div className="glass-dark p-6 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-4">
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
    </div>
  );
}
