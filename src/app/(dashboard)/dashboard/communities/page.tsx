"use client";
import { useEffect, useState } from "react";
import { Users, Lock, Globe, Users2, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Community {
  id: string;
  name: string;
  description: string | null;
  type: string;
  imageUrl: string | null;
  isActive: boolean;
  subscriptionPlan: { name: string; tier: string } | null;
  _count: { members: number };
  userStatus: string | null;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joining, setJoining] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const token = () => localStorage.getItem("accessToken");

  const fetch_ = async (q?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    const res = await fetch(`/api/communities?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      setCommunities(json.data.communities);
      const joinedMap: Record<string, boolean> = {};
      json.data.communities.forEach((c: Community) => {
        if (c.userStatus === "APPROVED" || c.userStatus === "PENDING") {
          joinedMap[c.id] = true;
        }
      });
      setJoined(joinedMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const join = async (id: string) => {
    setJoining(id);
    setError((prev) => ({ ...prev, [id]: "" }));
    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ communityId: id }),
    });
    const json = await res.json();
    setJoining(null);
    if (json.success) setJoined((prev) => ({ ...prev, [id]: true }));
    else setError((prev) => ({ ...prev, [id]: json.error }));
  };

  const typeIcon = { PUBLIC: Globe, PRIVATE: Lock, INVITE_ONLY: Lock };
  const typeColor = { PUBLIC: "success", PRIVATE: "warning", INVITE_ONLY: "info" } as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Users2 size={22} className="text-[#C9972C]" /> Communities
        </h1>
        <p className="text-white/40 text-sm">Connect with like-minded families across religion, region, and interests</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          className="input-glass input-glass-with-icon"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); fetch_(e.target.value); }}
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : communities.length === 0 ? (
        <div className="glass p-12 text-center">
          <Users size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No communities found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => {
            const Icon = typeIcon[c.type as keyof typeof typeIcon] || Globe;
            const requiresPremium = !!c.subscriptionPlan;
            const isJoined = joined[c.id];

            return (
              <div key={c.id} className="glass p-5 flex flex-col gap-4 hover:border-[rgba(201,151,44,0.2)] transition-colors">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B1D1D]/50 to-[#C9972C]/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={20} className="text-[#C9972C]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{c.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={typeColor[c.type as keyof typeof typeColor] || "glass"} className="text-[10px]">
                        <Icon size={9} /> {c.type?.replace(/_/g, " ") || "Public"}
                      </Badge>
                      {requiresPremium && (
                        <Badge variant="gold" className="text-[10px]">{c.subscriptionPlan?.tier}+</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {c.description && (
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{c.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="text-white/40 text-xs flex items-center gap-1">
                    <Users size={11} /> {c._count.members} members
                  </div>
                  {error[c.id] && <p className="text-red-400 text-[10px]">{error[c.id]}</p>}
                  <Button
                    variant={isJoined ? "glass-gold" : "glass"}
                    size="sm"
                    onClick={() => join(c.id)}
                    loading={joining === c.id}
                    disabled={isJoined}
                  >
                    {isJoined ? (
                      <><CheckCircle size={13} /> Joined</>
                    ) : c.type === "PUBLIC" ? "Join" : "Request to Join"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
