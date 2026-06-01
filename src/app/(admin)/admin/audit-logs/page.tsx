"use client";
import { useEffect, useState, useCallback } from "react";
import { FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { name: string; email: string } | null;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-400",
  UPDATE: "text-blue-400",
  DELETE: "text-red-400",
  APPROVE: "text-emerald-400",
  REJECT: "text-red-400",
  SUSPEND: "text-amber-400",
  LOGIN: "text-white/60",
  LOGOUT: "text-white/40",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search) params.set("search", search);
    if (actionFilter) params.set("action", actionFilter);
    const res = await fetch(`/api/admin/audit-logs?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) { setLogs(json.data.logs); setTotal(json.data.pagination.total); }
    setLoading(false);
  }, [page, search, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={22} className="text-[#C9972C]" /> Audit Logs
          </h1>
          <p className="text-white/40 text-sm">{total} events logged</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input className="input-glass input-glass-with-icon text-sm" placeholder="Search by email, action, IP..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-glass w-40 text-sm" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          {["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "SUSPEND"].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <Button variant="glass" size="sm" onClick={fetchLogs}>Refresh</Button>
      </div>

      {/* Log table */}
      <div className="glass overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Timestamp", "Actor", "Action", "Target", "IP Address", "Details"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider align-middle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3 align-middle"><div className="skeleton h-3 w-24" /></td>)}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30 align-middle">No audit logs found</td></tr>
              ) : logs.map((log) => {
                const actionColor = Object.entries(ACTION_COLORS).find(([k]) => log.action.toUpperCase().includes(k))?.[1] || "text-white/60";
                return (
                  <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.015]">
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap align-middle">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 align-middle">
                      {log.admin ? (
                        <div>
                          <div className="text-white/80 font-medium">{log.admin.name}</div>
                          <div className="text-white/30 text-[10px]">{log.admin.email}</div>
                        </div>
                      ) : <span className="text-white/30">System</span>}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`font-mono font-semibold ${actionColor}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50 align-middle">
                      {log.targetType && <Badge variant="glass" className="text-[9px]">{log.targetType}</Badge>}
                      {log.targetId && <div className="text-white/30 mt-0.5 font-mono">{log.targetId.slice(0, 8)}…</div>}
                    </td>
                    <td className="px-4 py-3 text-white/40 font-mono align-middle">{log.ipAddress || "—"}</td>
                    <td className="px-4 py-3 text-white/30 max-w-xs truncate align-middle">
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-white/40 text-xs">Page {page} of {totalPages} · {total} total</span>
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
