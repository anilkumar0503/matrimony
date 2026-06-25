"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Shield, Image, CreditCard, TrendingUp, AlertTriangle,
  Ticket, CheckCircle, ArrowRight, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  kpis: {
    totalUsers: number; activeProfiles: number; pendingKyc: number;
    kycSlaBreach: number; pendingImages: number; pendingApproval: number;
    totalMatches: number; openTickets: number; totalCommunities: number;
  };
  revenue: { today: number; thisMonth: number; thisYear: number };
  dailyRegistrations: { date: string; count: number }[];
  conversionRate: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminAccessToken");
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28" />)}
      </div>
    </div>
  );

  const kpis = data?.kpis;
  const revenue = data?.revenue;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Platform overview and key metrics</p>
      </div>

      {/* Alerts */}
      {((kpis?.kycSlaBreach || 0) > 0 || (kpis?.pendingImages || 0) >= 20) && (
        <div className="space-y-2">
          {(kpis?.kycSlaBreach || 0) > 0 && (
            <div className="glass border-amber-700/30 bg-amber-900/10 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>{kpis?.kycSlaBreach}</strong> KYC submissions exceeded 24h SLA
                </span>
              </div>
              <Button variant="glass" size="sm" asChild>
                <Link href="/admin/kyc">Review KYC <ArrowRight size={13} /></Link>
              </Button>
            </div>
          )}
          {(kpis?.pendingImages || 0) >= 20 && (
            <div className="glass border-amber-700/30 bg-amber-900/10 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>{kpis?.pendingImages}</strong> images pending moderation
                </span>
              </div>
              <Button variant="glass" size="sm" asChild>
                <Link href="/admin/images">Review Images <ArrowRight size={13} /></Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Members", value: kpis?.totalUsers, sub: `${kpis?.activeProfiles} active`, href: "/admin/users", color: "text-blue-400" },
          { icon: Shield, label: "Pending KYC", value: kpis?.pendingKyc, sub: `${kpis?.kycSlaBreach} SLA breach`, href: "/admin/kyc", color: "text-amber-400", alert: (kpis?.kycSlaBreach || 0) > 0 },
          { icon: Image, label: "Pending Images", value: kpis?.pendingImages, sub: "Awaiting moderation", href: "/admin/images", color: "text-purple-400" },
          { icon: CheckCircle, label: "Pending Approval", value: kpis?.pendingApproval, sub: "Profile reviews", href: "/admin/users?status=PENDING_APPROVAL", color: "text-emerald-400" },
          { icon: Ticket, label: "Open Tickets", value: kpis?.openTickets, sub: "Match assistance", href: "/admin/match-tickets", color: "text-[#C9972C]" },
          { icon: Activity, label: "Total Matches", value: kpis?.totalMatches, sub: `${data?.conversionRate}% conversion`, href: "/admin/match-tickets", color: "text-pink-400" },
          { icon: Users, label: "Communities", value: kpis?.totalCommunities, sub: "Active groups", href: "/admin/communities", color: "text-cyan-400" },
          { icon: CreditCard, label: "Revenue Today", value: formatCurrency(revenue?.today || 0), sub: `₹${((revenue?.thisMonth || 0) / 100000).toFixed(1)}L this month`, href: "/admin/payments", color: "text-[#C9972C]" },
        ].map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`glass p-5 hover:border-border transition-colors group ${kpi.alert ? "border-amber-700/30" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={18} className={kpi.color} />
              {kpi.alert && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            <div className="font-display text-2xl font-bold text-foreground mb-0.5">{kpi.value ?? "—"}</div>
            <div className="text-xs font-medium text-muted">{kpi.label}</div>
            <div className="text-[10px] text-muted mt-0.5">{kpi.sub}</div>
          </Link>
        ))}
      </div>

      {/* Revenue cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Revenue Today", amount: revenue?.today || 0 },
          { label: "This Month", amount: revenue?.thisMonth || 0 },
          { label: "This Year", amount: revenue?.thisYear || 0 },
        ].map((r) => (
          <div key={r.label} className="glass-gold p-5">
            <div className="text-muted text-xs mb-1">{r.label}</div>
            <div className="font-display text-3xl font-bold shimmer-text">{formatCurrency(r.amount)}</div>
          </div>
        ))}
      </div>

      {/* Daily registrations chart placeholder */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-medium text-foreground">Daily Registrations</div>
            <div className="text-muted text-xs">Last 7 days</div>
          </div>
          <Badge variant="glass">Last 7 days</Badge>
        </div>
        <div className="flex items-end gap-2 h-24">
          {data?.dailyRegistrations?.map((d) => {
            const max = Math.max(...(data.dailyRegistrations.map((r) => r.count) || [1]));
            const pct = max > 0 ? (d.count / max) * 100 : 0;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-[#C9972C] to-[#E8C76A] rounded-sm transition-all"
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <span className="text-[9px] text-muted">{new Date(d.date).getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Review KYC Queue", href: "/admin/kyc", icon: Shield },
          { label: "Moderate Images", href: "/admin/images", icon: Image },
          { label: "Manage Tickets", href: "/admin/match-tickets", icon: Ticket },
          { label: "Platform Settings", href: "/admin/settings", icon: TrendingUp },
        ].map((action) => (
          <Button key={action.label} variant="glass" asChild className="h-auto py-4 flex-col gap-2">
            <Link href={action.href}>
              <action.icon size={20} className="text-[#C9972C]" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
