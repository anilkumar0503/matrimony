"use client";
import { useEffect, useState, useCallback } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  user: { email: string; profile: { fullName: string } | null };
  subscription: { plan: { name: string; tier: string } } | null;
  invoice: { invoiceNumber: string; fileUrl: string | null } | null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ totalRevenue: 0, totalGst: 0, count: 0 });

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/payments?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      setPayments(json.data.payments);
      setTotal(json.data.pagination.total);
      if (json.data.summary) setSummary(json.data.summary);
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 size={22} className="text-[#f78222]" /> Payments & Revenue
          </h1>
          <p className="text-muted text-sm">{total} transactions</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
          { label: "GST Collected", value: formatCurrency(summary.totalGst) },
          { label: "Transactions", value: summary.count },
        ].map(s => (
          <div key={s.label} className="glass p-5 text-center">
            <div className="text-2xl font-bold text-[#E8C76A]">{s.value}</div>
            <div className="text-muted text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-glass input-glass-with-icon text-sm" placeholder="Search by name, email, order ID..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-glass w-36 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {["PENDING", "SUCCESS", "FAILED", "REFUNDED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Member", "Plan", "Amount", "GST", "Total", "Status", "Invoice"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-muted text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-20" /></td>)}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">No payments found</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="text-muted text-sm font-medium">{p.user.profile?.fullName || "—"}</div>
                    <div className="text-muted text-xs">{p.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{p.subscription?.plan.name || "—"}</td>
                  <td className="px-4 py-3 text-muted text-xs">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted text-xs">{formatCurrency(p.gstAmount)}</td>
                  <td className="px-4 py-3 font-medium text-[#E8C76A] text-sm">{formatCurrency(p.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      p.status === "SUCCESS" ? "success" :
                      p.status === "FAILED" ? "danger" :
                      p.status === "REFUNDED" ? "warning" : "glass"
                    } className="text-[10px]">{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.invoice?.fileUrl ? (
                      <a href={p.invoice.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[#f78222] hover:text-[#E8C76A] text-xs flex items-center gap-1">
                        <Download size={11} /> {p.invoice.invoiceNumber}
                      </a>
                    ) : (
                      <span className="text-muted text-xs">{p.invoice?.invoiceNumber || "—"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-muted text-xs">Page {page} of {totalPages} · {total} total</span>
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
