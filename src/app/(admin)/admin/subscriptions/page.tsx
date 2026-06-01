"use client";
import { useEffect, useState, useCallback } from "react";
import { CreditCard, ChevronLeft, ChevronRight, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  plan: { name: string; tier: string; priceYearly: number | null };
  user: { email: string; profile: { fullName: string } | null };
}

interface Stats { total: number; active: number; expired: number; revenue: number }

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, revenue: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/subscriptions?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      setSubs(json.data.subscriptions);
      setTotal(json.data.pagination.total);
      if (json.data.stats) setStats(json.data.stats);
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / 20);
  const tierColor: Record<string, "gold" | "success" | "glass"> = { VIP: "gold", PREMIUM: "success", FREE: "glass" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard size={22} className="text-[#C9972C]" /> Subscriptions
        </h1>
        <p className="text-white/40 text-sm">{total} total subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Active", value: stats.active, color: "text-emerald-400" },
          { label: "Expired", value: stats.expired, color: "text-red-400" },
          { label: "Revenue", value: formatCurrency(stats.revenue), color: "text-[#E8C76A]" },
        ].map((s) => (
          <div key={s.label} className="glass p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input className="input-glass input-glass-with-icon text-sm" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-glass w-36 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {["ACTIVE", "EXPIRED", "CANCELLED", "GRACE_PERIOD"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Member", "Plan", "Status", "Start", "Expires", "Auto Renew"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>)}
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No subscriptions found</td></tr>
            ) : subs.map((sub) => (
              <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium text-white text-sm">{sub.user.profile?.fullName || "—"}</div>
                  <div className="text-white/30 text-xs">{sub.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={tierColor[sub.plan.tier] || "glass"}>{sub.plan.name}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={
                    sub.status === "ACTIVE" ? "success" :
                    sub.status === "GRACE_PERIOD" ? "warning" :
                    sub.status === "CANCELLED" ? "danger" : "glass"
                  }>{sub.status}</Badge>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs">{formatDate(sub.startDate)}</td>
                <td className="px-4 py-3 text-white/50 text-xs">{formatDate(sub.endDate)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${sub.autoRenew ? "text-emerald-400" : "text-white/30"}`}>
                    {sub.autoRenew ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-white/40 text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
              <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
