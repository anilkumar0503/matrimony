"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, UserCheck, UserX, Trash2, LogOut, Shield,
  Image, CreditCard, Bell, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatDateTime, formatDate } from "@/lib/utils";

interface UserDetail {
  id: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  createdAt: string;
  profile: {
    fullName: string; city: string; state: string; religion: string; caste: string;
    height: number | null; qualification: string | null; occupationType: string | null;
    profileCompletionPct: number;
  } | null;
  kycSubmissions: { id: string; status: string; mode: string | null; createdAt: string; attempts: number }[];
  subscriptions: { plan: { name: string; tier: string }; status: string; endDate: string }[];
  images: { id: string; status: string; isPrimary: boolean; category: string }[];
  auditLogs?: { id: string; action: string; ipAddress: string | null; createdAt: string }[];
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "glass"> = {
  ACTIVE: "success",
  PENDING_PROFILE: "warning",
  PENDING_KYC: "warning",
  PENDING_APPROVAL: "info",
  SUSPENDED: "danger",
  DELETION_REQUESTED: "danger",
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchUser = async () => {
    const res = await fetch(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) setUser(json.data.user);
    setLoading(false);
  };

  useEffect(() => { fetchUser(); }, [id]);

  const performAction = async (action: string) => {
    setProcessing(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setProcessing(false);
    setActionModal(null);
    setReason("");
    fetchUser();
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32" />)}</div>;
  if (!user) return <div className="text-white/40">User not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft size={18} /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{user.profile?.fullName || "Unknown User"}</h1>
          <p className="text-white/40 text-xs">{user.email} · ID: {user.id.slice(0, 8)}…</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          {user.status !== "ACTIVE" && (
            <Button variant="gold" size="sm" onClick={() => setActionModal("APPROVE")}>
              <UserCheck size={14} /> Approve
            </Button>
          )}
          {user.status === "ACTIVE" && (
            <Button variant="glass" size="sm" className="text-amber-400" onClick={() => setActionModal("SUSPEND")}>
              <UserX size={14} /> Suspend
            </Button>
          )}
          <Button variant="glass" size="sm" className="text-red-400" onClick={() => setActionModal("FORCE_LOGOUT")}>
            <LogOut size={14} /> Force Logout
          </Button>
          <Button variant="danger" size="sm" onClick={() => setActionModal("DELETE")}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="glass p-4 flex flex-wrap gap-4 items-center">
        <Badge variant={statusVariant[user.status] || "glass"}>{user.status.replace(/_/g, " ")}</Badge>
        <span className="text-white/50 text-xs">{user.gender} · {user.dateOfBirth ? calculateAge(user.dateOfBirth) + " yrs" : "—"}</span>
        <span className="text-white/50 text-xs">Joined {formatDate(user.createdAt)}</span>
        <span className="text-white/50 text-xs">{user.profile?.city}, {user.profile?.state}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-white/40 text-xs">Profile {user.profile?.profileCompletionPct || 0}% complete</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C9972C] to-[#E8C76A] rounded-full" style={{ width: `${user.profile?.profileCompletionPct || 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Profile */}
        <div className="glass p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">Profile Details</h3>
          <div className="space-y-2">
            {[
              { l: "Religion", v: user.profile?.religion },
              { l: "Caste", v: user.profile?.caste },
              { l: "Qualification", v: user.profile?.qualification },
              { l: "Occupation", v: user.profile?.occupationType },
              { l: "Phone", v: user.phone },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-white/40">{l}</span>
                <span className="text-white/70">{v || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KYC */}
        <div className="glass p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Shield size={14} className="text-[#C9972C]" /> KYC Submissions
          </h3>
          {user.kycSubmissions.length === 0 ? (
            <p className="text-white/30 text-xs">No KYC submissions</p>
          ) : user.kycSubmissions.map((kyc) => (
            <div key={kyc.id} className="flex items-center justify-between mb-2">
              <div>
                <Badge variant={kyc.status === "APPROVED" ? "success" : kyc.status === "REJECTED" ? "danger" : "warning"}>
                  {kyc.status}
                </Badge>
                <span className="ml-2 text-white/40 text-xs">{kyc.mode || "Mode A"} · Attempt #{kyc.attempts}</span>
              </div>
              <span className="text-white/30 text-xs">{formatDate(kyc.createdAt)}</span>
            </div>
          ))}
          {user.kycSubmissions[0]?.status === "PENDING" && (
            <Button variant="glass-gold" size="sm" asChild className="mt-2">
              <Link href={`/admin/kyc`}>Review KYC</Link>
            </Button>
          )}
        </div>

        {/* Subscription */}
        <div className="glass p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <CreditCard size={14} className="text-[#C9972C]" /> Subscription
          </h3>
          {user.subscriptions.length === 0 ? (
            <p className="text-white/30 text-xs">Free plan</p>
          ) : user.subscriptions.map((sub, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <span className="text-white/80 text-sm font-medium">{sub.plan.name}</span>
                <Badge variant={sub.status === "ACTIVE" ? "success" : "glass"} className="ml-2 text-[10px]">{sub.status}</Badge>
              </div>
              <span className="text-white/40 text-xs">Until {formatDate(sub.endDate)}</span>
            </div>
          ))}
        </div>

        {/* Images */}
        <div className="glass p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Image size={14} className="text-[#C9972C]" /> Images ({user.images.length})
          </h3>
          {user.images.length === 0 ? (
            <p className="text-white/30 text-xs">No images uploaded</p>
          ) : (
            <div className="space-y-1">
              {[
                { s: "APPROVED", c: "text-emerald-400", n: user.images.filter(i => i.status === "APPROVED").length },
                { s: "PENDING", c: "text-amber-400", n: user.images.filter(i => i.status === "PENDING").length },
                { s: "REJECTED", c: "text-red-400", n: user.images.filter(i => i.status === "REJECTED").length },
              ].filter(r => r.n > 0).map(r => (
                <div key={r.s} className="flex items-center gap-2 text-xs">
                  {r.s === "APPROVED" ? <CheckCircle size={11} className={r.c} /> : r.s === "REJECTED" ? <XCircle size={11} className={r.c} /> : <AlertTriangle size={11} className={r.c} />}
                  <span className={r.c}>{r.n} {r.s.toLowerCase()}</span>
                </div>
              ))}
              {user.images.some(i => i.status === "PENDING") && (
                <Button variant="glass" size="sm" asChild className="mt-2">
                  <Link href="/admin/images">Moderate Images</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Audit log */}
      {(user.auditLogs?.length ?? 0) > 0 && (
        <div className="glass p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Bell size={14} className="text-[#C9972C]" /> Recent Activity
          </h3>
          <div className="space-y-2">
            {user.auditLogs?.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-2 last:border-0">
                <span className="text-white/60">{log.action}</span>
                <div className="text-right">
                  <div className="text-white/30">{formatDateTime(log.createdAt)}</div>
                  {log.ipAddress && <div className="text-white/20">{log.ipAddress}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="glass-dark p-6 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-4">
              {actionModal === "APPROVE" ? "Approve User" :
               actionModal === "SUSPEND" ? "Suspend User" :
               actionModal === "DELETE" ? "Delete Account" :
               "Force Logout"}
            </h3>
            {actionModal !== "FORCE_LOGOUT" && (
              <textarea className="input-glass min-h-[80px] mb-4"
                placeholder={`Reason${actionModal === "APPROVE" ? " (optional)" : " (required)"}`}
                value={reason} onChange={(e) => setReason(e.target.value)} />
            )}
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => setActionModal(null)} className="flex-1">Cancel</Button>
              <Button
                variant={actionModal === "APPROVE" ? "gold" : "danger"}
                onClick={() => performAction(actionModal)}
                loading={processing}
                className="flex-1"
                disabled={["SUSPEND", "DELETE"].includes(actionModal) && !reason.trim()}
              >
                Confirm {actionModal.replace(/_/g, " ")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
