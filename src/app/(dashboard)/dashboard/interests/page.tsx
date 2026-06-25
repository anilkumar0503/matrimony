"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Check, X, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, calculateAge, cmToFeetInches } from "@/lib/utils";

interface Interest {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  expiresAt: string | null;
  sender?: { id: string; email: string; gender: string; dateOfBirth: string; profile: { fullName: string; city: string; state: string; religion: string } | null };
  receiver?: { id: string; email: string; gender: string; dateOfBirth: string; profile: { fullName: string; city: string; state: string; religion: string } | null };
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "glass"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  WITHDRAWN: "glass",
};

export default function InterestsPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const token = () => localStorage.getItem("accessToken");

  const fetchInterests = async (type: "received" | "sent") => {
    setLoading(true);
    const res = await fetch(`/api/user/interests?type=${type}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) setInterests(json.data.interests);
    setLoading(false);
  };

  useEffect(() => { fetchInterests(tab); }, [tab]);

  const respond = async (id: string, action: "ACCEPT" | "DECLINE" | "WITHDRAW") => {
    setActing(id);
    try {
      const res = await fetch(`/api/user/interests/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) fetchInterests(tab);
    } finally {
      setActing(null);
    }
  };

  const profile = (interest: Interest) => tab === "received" ? interest.sender : interest.receiver;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Interests</h1>
        <p className="text-muted text-sm">Manage your sent and received interests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("received")}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === "received" ? "bg-[rgba(201,151,44,0.12)] text-[#E8C76A] border border-[rgba(201,151,44,0.25)]" : "text-muted hover:text-foreground"}`}
        >
          <Heart size={14} className="inline mr-1.5" /> Received
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === "sent" ? "bg-[rgba(201,151,44,0.12)] text-[#E8C76A] border border-[rgba(201,151,44,0.25)]" : "text-muted hover:text-foreground"}`}
        >
          <Send size={14} className="inline mr-1.5" /> Sent
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : interests.length === 0 ? (
        <div className="glass p-12 text-center">
          <Heart size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted">No {tab} interests yet</p>
          {tab === "received" && (
            <p className="text-muted text-sm mt-1">Complete your KYC and upgrade to attract more interests</p>
          )}
          {tab === "sent" && (
            <Button variant="gold" size="sm" asChild className="mt-4">
              <Link href="/dashboard/search">Browse Profiles</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => {
            const p = profile(interest);
            const isExpiring = interest.expiresAt && new Date(interest.expiresAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            return (
              <div key={interest.id} className={`glass p-5 flex items-start gap-4 ${interest.status === "PENDING" ? "border-[rgba(201,151,44,0.15)]" : ""}`}>
                {/* Avatar placeholder */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7B1D1D]/50 to-[#C9972C]/30 flex items-center justify-center shrink-0 text-foreground font-bold text-lg">
                  {p?.profile?.fullName?.[0] || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{p?.profile?.fullName || "Unknown"}</span>
                        <Badge variant={statusVariant[interest.status] || "glass"} className="text-[10px]">
                          {interest.status}
                        </Badge>
                        {isExpiring && interest.status === "PENDING" && (
                          <Badge variant="warning" className="text-[10px]">
                            <Clock size={9} /> Expiring soon
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted text-xs mt-0.5">
                        {p?.dateOfBirth ? calculateAge(p.dateOfBirth) + " yrs" : ""} · {p?.profile?.city}, {p?.profile?.state}
                      </div>
                      <div className="text-muted text-xs">{p?.profile?.religion}</div>
                    </div>
                    <span className="text-muted text-xs shrink-0">{formatDate(interest.createdAt)}</span>
                  </div>

                  {interest.message && (
                    <div className="mt-2 text-muted text-sm italic bg-white/[0.04] px-3 py-2 rounded-lg">
                      "{interest.message}"
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {tab === "received" && interest.status === "PENDING" && (
                      <>
                        <Button variant="gold" size="sm" onClick={() => respond(interest.id, "ACCEPT")} loading={acting === interest.id}>
                          <Check size={14} /> Accept
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => respond(interest.id, "DECLINE")} loading={acting === interest.id}>
                          <X size={14} /> Decline
                        </Button>
                      </>
                    )}
                    {tab === "sent" && interest.status === "PENDING" && (
                      <Button variant="glass" size="sm" onClick={() => respond(interest.id, "WITHDRAW")} loading={acting === interest.id}>
                        Withdraw
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/profile/${p?.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
