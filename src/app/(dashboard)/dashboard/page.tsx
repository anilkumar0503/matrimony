"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart, Star, Users, Bell, Eye, CheckCircle, ArrowRight,
  Crown, Shield, Clock, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  user: { status: string; gender: string };
  profile: { fullName: string; profileCompletionPct: number } | null;
  subscription: { plan: { name: string; tier: string } } | null;
  kycStatus: string | null;
  stats: {
    interestsSent: number;
    interestsReceived: number;
    wishlists: number;
    matches: number;
    profileViews: number;
  };
  pendingInterests: number;
  unreadNotifications: number;
}

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: "success" | "warning" | "danger" | "gold" | "info" }> = {
    ACTIVE: { label: "Active", variant: "success" },
    PENDING_PROFILE: { label: "Complete Profile", variant: "warning" },
    PENDING_KYC: { label: "KYC Pending", variant: "warning" },
    PENDING_APPROVAL: { label: "Awaiting Approval", variant: "info" },
    SUSPENDED: { label: "Suspended", variant: "danger" },
  };
  return map[status] || { label: status, variant: "glass" as "gold" };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      });
      return;
    }

    Promise.all([
      fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/user/notifications?unreadOnly=true", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/user/interests?type=received", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([profileRes, notifRes, interestRes]) => {
        if (!profileRes.success) {
          toast({
            title: "Error loading profile",
            description: profileRes.error || "Failed to load profile data",
            variant: "destructive",
          });
          return;
        }
        setData({
          user: profileRes.data?.user || {},
          profile: profileRes.data?.profile || null,
          subscription: profileRes.data?.subscription || null,
          kycStatus: profileRes.data?.kycStatus || null,
          stats: { interestsSent: 0, interestsReceived: interestRes.data?.interests?.length || 0, wishlists: 0, matches: 0, profileViews: 0 },
          pendingInterests: interestRes.data?.interests?.length || 0,
          unreadNotifications: notifRes.data?.unreadCount || 0,
        });
      })
      .catch((err) => {
        console.error("Dashboard load error:", err);
        toast({
          title: "Error loading dashboard",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(data?.user?.status || "");
  const completionPct = data?.profile?.profileCompletionPct || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="glass-gold p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back{data?.profile?.fullName ? `, ${data.profile.fullName.split(" ")[0]}` : ""}!
            </h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-muted text-sm">
            {data?.subscription?.plan
              ? `${data.subscription.plan.name} Member`
              : "Free Member"} • Your journey to finding love continues.
          </p>
        </div>
        {data?.subscription?.plan?.tier === "FREE" && (
          <Button variant="gold" size="sm" asChild>
            <Link href="/dashboard/subscription">
              <Crown size={14} /> Upgrade Plan
            </Link>
          </Button>
        )}
      </div>

      {/* Profile completion alert */}
      {completionPct < 80 && (
        <div className="glass border-[rgba(201,151,44,0.2)] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(201,151,44,0.1)] flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-[#C9972C]" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-1">
                Profile {completionPct}% complete
              </div>
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C9972C] to-[#E8C76A] rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
          <Button variant="glass-gold" size="sm" asChild>
            <Link href="/dashboard/profile-setup">Complete Profile <ArrowRight size={14} /></Link>
          </Button>
        </div>
      )}

      {/* KYC banner */}
      {data?.kycStatus === null && (
        <div className="glass border-blue-700/30 bg-blue-900/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-blue-400" />
            <div>
              <div className="text-sm font-medium text-foreground">Complete KYC Verification</div>
              <div className="text-xs text-muted">Verify your identity to become visible on the platform</div>
            </div>
          </div>
          <Button variant="glass" size="sm" asChild>
            <Link href="/dashboard/profile/kyc">Verify Now <ArrowRight size={14} /></Link>
          </Button>
        </div>
      )}

      {/* KYC pending banner */}
      {data?.kycStatus === "PENDING" && (
        <div className="glass border-amber-700/30 bg-amber-900/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400" />
            <div>
              <div className="text-sm font-medium text-foreground">KYC Verification Pending</div>
              <div className="text-xs text-muted">Your KYC is under review. This usually takes 24-48 hours.</div>
            </div>
          </div>
          <Badge variant="warning">In Review</Badge>
        </div>
      )}

      {/* KYC approved banner */}
      {data?.kycStatus === "APPROVED" && (
        <div className="glass border-emerald-700/30 bg-emerald-900/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-400" />
            <div>
              <div className="text-sm font-medium text-foreground">KYC Verified</div>
              <div className="text-xs text-muted">Your identity has been verified. You can now access all features.</div>
            </div>
          </div>
          <Badge variant="success">Verified</Badge>
        </div>
      )}

      {/* KYC rejected banner */}
      {data?.kycStatus === "REJECTED" && (
        <div className="glass border-red-700/30 bg-red-900/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-red-400" />
            <div>
              <div className="text-sm font-medium text-foreground">KYC Verification Failed</div>
              <div className="text-xs text-muted">Please resubmit your documents for verification.</div>
            </div>
          </div>
          <Button variant="glass" size="sm" asChild>
            <Link href="/dashboard/profile/kyc">Resubmit <ArrowRight size={14} /></Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: "Profile Views", value: data?.stats.profileViews || 0, color: "text-blue-400" },
          { icon: Heart, label: "Interests Received", value: data?.pendingInterests || 0, color: "text-pink-400", highlight: (data?.pendingInterests || 0) > 0 },
          { icon: Star, label: "Wishlisted", value: data?.stats.wishlists || 0, color: "text-[#C9972C]" },
          { icon: Users, label: "Mutual Matches", value: data?.stats.matches || 0, color: "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label} className={`text-center py-6 ${stat.highlight ? "border-[rgba(201,151,44,0.3)]" : ""}`}>
            <stat.icon size={22} className={`${stat.color} mx-auto mb-2`} />
            <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-muted text-xs mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Heart, title: "Browse Profiles", desc: "Find your perfect match today", href: "/dashboard/search", cta: "Search Now" },
          { icon: Bell, title: `${data?.pendingInterests || 0} New Interests`, desc: "Someone is interested in you", href: "/dashboard/interests", cta: "View Interests", highlight: (data?.pendingInterests || 0) > 0 },
          ...(data?.kycStatus === null
            ? [{ icon: CheckCircle, title: "Complete KYC", desc: "Get verified and unlock all features", href: "/dashboard/profile/kyc", cta: "Start KYC" }]
            : data?.kycStatus === "PENDING"
            ? [{ icon: Clock, title: "KYC In Review", desc: "Your verification is under review", href: "/dashboard/profile/kyc", cta: "Check Status" }]
            : data?.kycStatus === "REJECTED"
            ? [{ icon: Shield, title: "Resubmit KYC", desc: "Please resubmit your documents", href: "/dashboard/profile/kyc", cta: "Resubmit" }]
            : []),
        ].map((action) => (
          <div
            key={action.title}
            className={`glass p-5 flex flex-col gap-4 ${action.highlight ? "border-[rgba(201,151,44,0.3)]" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(201,151,44,0.1)] flex items-center justify-center shrink-0">
                <action.icon size={18} className="text-[#C9972C]" />
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">{action.title}</div>
                <div className="text-muted text-xs mt-0.5">{action.desc}</div>
              </div>
            </div>
            <Button variant={action.highlight ? "gold" : "glass"} size="sm" asChild className="self-start">
              <Link href={action.href}>{action.cta} <ArrowRight size={13} /></Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {(data?.unreadNotifications || 0) > 0 && (
        <div className="glass p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-[#C9972C]" />
            <div>
              <div className="text-sm font-medium text-foreground">
                {data?.unreadNotifications} unread notification{(data?.unreadNotifications || 0) > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-muted">Stay updated with your match activity</div>
            </div>
          </div>
          <Button variant="glass-gold" size="sm" asChild>
            <Link href="/dashboard/notifications">View All <ArrowRight size={13} /></Link>
          </Button>
        </div>
      )}

      {/* Premium upsell */}
      {data?.subscription?.plan?.tier === "FREE" && (
        <Card variant="gold" className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <Crown size={24} className="text-[#C9972C] mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Upgrade to Premium</h3>
            <p className="text-muted text-sm">Get advanced search, unlimited interests, anonymous browsing, and more from ₹999/month.</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[140px]">
            <Button variant="gold" asChild>
              <Link href="/dashboard/subscription">View Plans</Link>
            </Button>
            <div className="text-muted text-xs text-center">GST inclusive • Cancel anytime</div>
          </div>
        </Card>
      )}
    </div>
  );
}
