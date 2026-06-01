"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Heart, Star, Shield, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cmToFeetInches } from "@/lib/utils";

const RELIGIONS = ["", "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"];
const MARITAL = ["", "NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"];

interface SearchProfile {
  id: string;
  gender: string;
  age: number | null;
  profile: {
    fullName: string;
    city: string;
    state: string;
    religion: string;
    caste: string;
    qualification: string;
    occupationType: string;
    height: number | null;
    profileCompletionPct: number;
  } | null;
  hasPrimaryPhoto: boolean;
  primaryPhotoUrl: string | null;
  isKycVerified: boolean;
  subscriptionTier: string;
}

export default function SearchPage() {
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [interests, setInterests] = useState<Record<string, boolean>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);
  const [togglingWishlist, setTogglingWishlist] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    ageMin: "", ageMax: "", gender: "", religion: "", caste: "",
    state: "", maritalStatus: "", heightMin: "", heightMax: "",
  });

  const token = () => localStorage.getItem("accessToken");

  const search = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

    const res = await fetch(`/api/user/search?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      if (p === 1) setProfiles(json.data.users);
      else setProfiles((prev) => [...prev, ...json.data.users]);
      setTotal(json.data.pagination.total);
      setPage(p);
    }
    setLoading(false);
  }, [filters]);

  const sendInterest = async (profileId: string) => {
    setSendingInterest(profileId);
    try {
      const res = await fetch("/api/user/interests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profileId }),
      });
      if ((await res.json()).success) setInterests((prev) => ({ ...prev, [profileId]: true }));
    } finally {
      setSendingInterest(null);
    }
  };

  const toggleWishlist = async (profileId: string) => {
    setTogglingWishlist(profileId);
    try {
      if (wishlist[profileId]) {
        await fetch(`/api/user/wishlist?profileId=${profileId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
        setWishlist((prev) => ({ ...prev, [profileId]: false }));
      } else {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });
        if ((await res.json()).success) setWishlist((prev) => ({ ...prev, [profileId]: true }));
      }
    } finally {
      setTogglingWishlist(null);
    }
  };

  const F = (k: keyof typeof filters, v: string) => setFilters((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Find Your Match</h1>
          <p className="text-white/40 text-sm">{total > 0 ? `${total} profiles found` : "Search to find compatible matches"}</p>
        </div>
        <Button variant={showFilters ? "gold" : "glass"} onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} /> Filters {showFilters && <X size={14} />}
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            className="input-glass input-glass-with-icon"
            placeholder="Search by location, religion, name..."
            onKeyDown={(e) => e.key === "Enter" && search(1)}
          />
        </div>
        <Button variant="gold" onClick={() => search(1)} loading={loading}>Search</Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Gender</label>
            <select className="input-glass" value={filters.gender} onChange={(e) => F("gender", e.target.value)}>
              <option value="">Any</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Age Range</label>
            <div className="flex gap-2">
              <input className="input-glass" type="number" placeholder="Min" min={18} value={filters.ageMin} onChange={(e) => F("ageMin", e.target.value)} />
              <input className="input-glass" type="number" placeholder="Max" min={18} value={filters.ageMax} onChange={(e) => F("ageMax", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Religion</label>
            <select className="input-glass" value={filters.religion} onChange={(e) => F("religion", e.target.value)}>
              {RELIGIONS.map((r) => <option key={r} value={r}>{r || "Any"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Marital Status</label>
            <select className="input-glass" value={filters.maritalStatus} onChange={(e) => F("maritalStatus", e.target.value)}>
              {MARITAL.map((m) => <option key={m} value={m}>{m ? m.replace(/_/g, " ") : "Any"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">State</label>
            <input className="input-glass" placeholder="e.g. Tamil Nadu" value={filters.state} onChange={(e) => F("state", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Caste</label>
            <input className="input-glass" placeholder="Any" value={filters.caste} onChange={(e) => F("caste", e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-end gap-3">
            <Button variant="gold" onClick={() => search(1)} className="flex-1">
              <Filter size={14} /> Apply Filters
            </Button>
            <Button variant="glass" onClick={() => {
              setFilters({ ageMin: "", ageMax: "", gender: "", religion: "", caste: "", state: "", maritalStatus: "", heightMin: "", heightMax: "" });
              setProfiles([]); setTotal(0);
            }}>
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Profile cards */}
      {loading && profiles.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass p-16 text-center">
          <Search size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No profiles found. Try adjusting your filters.</p>
          <Button variant="gold" size="sm" className="mt-4" onClick={() => search(1)}>Search All</Button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="glass p-0 overflow-hidden group hover:border-[rgba(201,151,44,0.25)] transition-colors">
                {/* Photo */}
                <div className="relative aspect-[3/4] bg-gradient-to-b from-[#7B1D1D]/30 to-[#1a0505]">
                  {profile.hasPrimaryPhoto && profile.primaryPhotoUrl ? (
                    <img src={profile.primaryPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[rgba(201,151,44,0.1)] flex items-center justify-center">
                        <span className="text-3xl font-display font-bold text-[#C9972C]">
                          {profile.profile?.fullName?.[0] || "?"}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {profile.isKycVerified && (
                      <span className="bg-emerald-900/80 text-emerald-400 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Shield size={8} /> Verified
                      </span>
                    )}
                    {profile.subscriptionTier !== "FREE" && (
                      <span className="bg-[rgba(201,151,44,0.8)] text-[#1a0505] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                        {profile.subscriptionTier}
                      </span>
                    )}
                  </div>
                  {/* Wishlist */}
                  <button
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors"
                    onClick={() => toggleWishlist(profile.id)}
                    disabled={togglingWishlist === profile.id}
                  >
                    <Star size={13} className={wishlist[profile.id] ? "text-[#C9972C] fill-[#C9972C]" : "text-white/60"} />
                  </button>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="font-medium text-white text-sm">{profile.profile?.fullName || "—"}</div>
                  <div className="text-white/50 text-xs mt-0.5">
                    {profile.age ? `${profile.age} yrs` : ""}
                    {profile.profile?.height ? ` · ${cmToFeetInches(profile.profile.height)}` : ""}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {[profile.profile?.religion, profile.profile?.caste].filter(Boolean).join(" · ")}
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">
                    {[profile.profile?.city, profile.profile?.state].filter(Boolean).join(", ")}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant={interests[profile.id] ? "glass-gold" : "glass"}
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => sendInterest(profile.id)}
                      disabled={interests[profile.id] || sendingInterest === profile.id}
                      loading={sendingInterest === profile.id}
                    >
                      <Heart size={12} className={interests[profile.id] ? "fill-[#C9972C]" : ""} />
                      {interests[profile.id] ? "Sent" : "Interest"}
                    </Button>
                    <Button variant="glass" size="sm" asChild className="flex-1 text-xs h-8">
                      <Link href={`/profile/${profile.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {profiles.length < total && (
            <div className="text-center">
              <Button variant="glass" onClick={() => search(page + 1)} loading={loading}>
                Load More ({total - profiles.length} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
