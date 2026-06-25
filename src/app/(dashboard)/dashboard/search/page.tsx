"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Heart, Star, Shield, X, SlidersHorizontal, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cmToFeetInches } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const RELIGIONS = ["", "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"];
const MARITAL = ["", "NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"];
const NAKSHATRAS = [
  "", "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];
const RASHIS = [
  "", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
const NADIS = ["", "Adi", "Madhya", "Antya"];
const GANAS = ["", "Dev", "Manush", "Rakshas"];

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
  isInWishlist: boolean;
  hasInterestSent: boolean;
  matchScore?: number;
  matchCategory?: string;
}

export default function SearchPage() {
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [interests, setInterests] = useState<Record<string, boolean>>({});
  const [receivedInterests, setReceivedInterests] = useState<Record<string, boolean>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);
  const [togglingWishlist, setTogglingWishlist] = useState<string | null>(null);
  const [useHoroscopeMatch, setUseHoroscopeMatch] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [userGender, setUserGender] = useState<"MALE" | "FEMALE" | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    ageMin: "", ageMax: "", gender: "", religion: "", caste: "",
    state: "", maritalStatus: "", heightMin: "", heightMax: "",
    nakshatra: "", rashi: "", nadi: "", gana: "", minMatchScore: "18",
  });

  const token = () => localStorage.getItem("accessToken");

  const search = useCallback(async (p = 1) => {
    setLoading(true);
    
    if (useHoroscopeMatch) {
      // Use horoscope match API
      const horoscopeFilters: any = {};
      if (filters.nakshatra) horoscopeFilters.nakshatra = filters.nakshatra;
      if (filters.rashi) horoscopeFilters.rashi = filters.rashi;
      if (filters.nadi) horoscopeFilters.nadi = filters.nadi;
      if (filters.gana) horoscopeFilters.gana = filters.gana;

      const res = await fetch("/api/horoscope/match", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          minScore: parseInt(filters.minMatchScore) || 18,
          sortByScore: true,
          limit: 20,
          gender: filters.gender || "ALL",
          filters: Object.keys(horoscopeFilters).length > 0 ? horoscopeFilters : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        console.log("[Horoscope Match] API Response:", json.data);
        const matchedProfiles = json.data.matches.map((m: any) => {
          console.log("[Horoscope Match] Match item:", m);
          return {
            id: m.profile.id,
            gender: m.profile.gender,
            age: m.profile.dateOfBirth ? calculateAge(new Date(m.profile.dateOfBirth)) : null,
            profile: {
              fullName: m.profile.fullName || "Unknown",
              city: m.profile.city || "",
              state: m.profile.state || "",
              religion: m.profile.religion || "",
              caste: m.profile.caste || "",
              qualification: "",
              occupationType: "",
              height: m.profile.height || null,
              profileCompletionPct: m.profile.profileCompletionPct || 50,
            },
            hasPrimaryPhoto: false,
            primaryPhotoUrl: null,
            isKycVerified: false,
            subscriptionTier: "FREE",
            isInWishlist: false,
            hasInterestSent: false,
            matchScore: m.match.finalScore,
            matchCategory: m.match.category,
            matchDetails: m.match,
          };
        });
        
        setProfiles(matchedProfiles);
        setTotal(matchedProfiles.length);
        setPage(p);
      } else {
        toast({
          title: "Horoscope match failed",
          description: json.error || "Failed to calculate horoscope matches",
          variant: "destructive",
        });
      }
    } else {
      // Use regular search API
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      Object.entries(filters).forEach(([k, v]) => { 
        if (v && !["nakshatra", "rashi", "nadi", "gana", "minMatchScore"].includes(k)) params.set(k, v); 
      });

      const res = await fetch(`/api/user/search?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      const json = await res.json();
      if (json.success) {
        if (p === 1) {
          setProfiles(json.data.users);
          const newInterests: Record<string, boolean> = {};
          const newWishlist: Record<string, boolean> = {};
          json.data.users.forEach((u: SearchProfile) => {
            if (u.hasInterestSent) newInterests[u.id] = true;
            if (u.isInWishlist) newWishlist[u.id] = true;
          });
          setInterests(newInterests);
          setWishlist(newWishlist);
        } else {
          setProfiles((prev) => [...prev, ...json.data.users]);
          json.data.users.forEach((u: SearchProfile) => {
            if (u.hasInterestSent) setInterests((prev) => ({ ...prev, [u.id]: true }));
            if (u.isInWishlist) setWishlist((prev) => ({ ...prev, [u.id]: true }));
          });
        }
        setTotal(json.data.pagination.total);
        setPage(p);
      }
    }
    setLoading(false);
  }, [filters, useHoroscopeMatch]);

  useEffect(() => {
    // Fetch user's gender to set default opposite gender filter
    const fetchUserGender = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token()}` }
        });
        const json = await res.json();
        if (json.success && json.data?.user?.gender) {
          setUserGender(json.data.user.gender);
          // Set default filter to opposite gender
          const oppositeGender = json.data.user.gender === "MALE" ? "FEMALE" : "MALE";
          setFilters(prev => ({ ...prev, gender: oppositeGender }));
        }
      } catch (err) {
        console.error("Failed to fetch user gender:", err);
      }
    };
    fetchUserGender();

    // Fetch received interests
    const fetchReceivedInterests = async () => {
      try {
        const res = await fetch("/api/user/interests?type=received", {
          headers: { Authorization: `Bearer ${token()}` }
        });
        const json = await res.json();
        if (json.success) {
          const receivedMap: Record<string, boolean> = {};
          json.data.interests.forEach((i: any) => {
            receivedMap[i.senderId] = true;
          });
          setReceivedInterests(receivedMap);
        }
      } catch (err) {
        console.error("Failed to fetch received interests:", err);
      }
    };
    fetchReceivedInterests();
  }, []);

  useEffect(() => {
    // Only run search after user gender is fetched and filter is set
    if (filters.gender) {
      search(1);
    }
  }, [filters.gender]);

  const sendInterest = async (profileId: string) => {
    setSendingInterest(profileId);
    try {
      const res = await fetch("/api/user/interests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profileId }),
      });
      const json = await res.json();
      if (json.success || json.code === "INTEREST_EXISTS") {
        setInterests((prev) => ({ ...prev, [profileId]: true }));
      }
    } finally {
      setSendingInterest(null);
    }
  };

  const acceptInterest = async (profileId: string) => {
    try {
      const res = await fetch(`/api/user/interests/${profileId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });
      const json = await res.json();
      if (json.success) {
        setReceivedInterests((prev) => ({ ...prev, [profileId]: false }));
        toast({
          title: "Interest accepted",
          description: "You have accepted this interest request",
        });
      } else {
        toast({
          title: "Failed to accept interest",
          description: json.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to accept interest",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const rejectInterest = async (profileId: string) => {
    try {
      const res = await fetch(`/api/user/interests/${profileId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DECLINE" }),
      });
      const json = await res.json();
      if (json.success) {
        setReceivedInterests((prev) => ({ ...prev, [profileId]: false }));
        toast({
          title: "Interest declined",
          description: "You have declined this interest request",
        });
      } else {
        toast({
          title: "Failed to decline interest",
          description: json.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to decline interest",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const toggleWishlist = async (profileId: string) => {
    setTogglingWishlist(profileId);
    try {
      if (wishlist[profileId]) {
        const res = await fetch(`/api/user/wishlist?profileId=${profileId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
        const json = await res.json();
        if (json.success) {
          setWishlist((prev) => ({ ...prev, [profileId]: false }));
          toast({
            title: "Removed from wishlist",
            description: "Profile removed from your wishlist",
          });
        } else {
          toast({
            title: "Failed to remove",
            description: json.error || "Please try again",
            variant: "destructive",
          });
        }
      } else {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });
        const json = await res.json();
        if (json.success) {
          setWishlist((prev) => ({ ...prev, [profileId]: true }));
          toast({
            title: "Added to wishlist",
            description: "Profile saved to your wishlist",
          });
        } else {
          toast({
            title: "Failed to add to wishlist",
            description: json.error || "Please try again",
            variant: "destructive",
          });
        }
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
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Find Your Match</h1>
          <p className="text-muted text-sm">{total > 0 ? `${total} profiles found` : "Search to find compatible matches"}</p>
        </div>
        <Button variant={showFilters ? "gold" : "glass"} onClick={() => setShowFilters(!showFilters)} className="cursor-pointer">
          <SlidersHorizontal size={16} /> Filters {showFilters && <X size={14} />}
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-glass input-glass-with-icon"
            placeholder="Search by location, religion, name..."
            onKeyDown={(e) => e.key === "Enter" && search(1)}
          />
        </div>
        <Button variant="gold" onClick={() => search(1)} loading={loading} className="cursor-pointer">Search</Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Horoscope Match Toggle */}
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3 p-3 bg-[rgba(201,151,44,0.1)] rounded-lg border border-[rgba(201,151,44,0.2)]">
            <Sparkles size={18} className="text-[#C9972C]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Horoscope Matching</div>
              <div className="text-xs text-muted">Find matches based on Vedic astrology compatibility</div>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${useHoroscopeMatch ? "bg-[#C9972C]" : "bg-white/20"}`}
              onClick={() => setUseHoroscopeMatch(!useHoroscopeMatch)}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${useHoroscopeMatch ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Horoscope Filters */}
          {useHoroscopeMatch && (
            <>
              <div>
                <label className="block text-xs text-muted mb-1">Nakshatra</label>
                <select className="input-glass" value={filters.nakshatra} onChange={(e) => F("nakshatra", e.target.value)}>
                  {NAKSHATRAS.map((n) => <option key={n} value={n}>{n || "Any"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Rashi (Moon Sign)</label>
                <select className="input-glass" value={filters.rashi} onChange={(e) => F("rashi", e.target.value)}>
                  {RASHIS.map((r) => <option key={r} value={r}>{r || "Any"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Nadi</label>
                <select className="input-glass" value={filters.nadi} onChange={(e) => F("nadi", e.target.value)}>
                  {NADIS.map((n) => <option key={n} value={n}>{n || "Any"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Gana</label>
                <select className="input-glass" value={filters.gana} onChange={(e) => F("gana", e.target.value)}>
                  {GANAS.map((g) => <option key={g} value={g}>{g || "Any"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Min Match Score</label>
                <input className="input-glass" type="number" min="0" max="36" value={filters.minMatchScore} onChange={(e) => F("minMatchScore", e.target.value)} />
              </div>
            </>
          )}

          {/* Regular Filters */}
          <div>
            <label className="block text-xs text-muted mb-1">Gender</label>
            <select className="input-glass" value={filters.gender} onChange={(e) => F("gender", e.target.value)}>
              <option value="">Any</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Age Range</label>
            <div className="flex gap-2">
              <input className="input-glass" type="number" placeholder="Min" min={18} value={filters.ageMin} onChange={(e) => F("ageMin", e.target.value)} />
              <input className="input-glass" type="number" placeholder="Max" min={18} value={filters.ageMax} onChange={(e) => F("ageMax", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Religion</label>
            <select className="input-glass" value={filters.religion} onChange={(e) => F("religion", e.target.value)}>
              {RELIGIONS.map((r) => <option key={r} value={r}>{r || "Any"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Marital Status</label>
            <select className="input-glass" value={filters.maritalStatus} onChange={(e) => F("maritalStatus", e.target.value)}>
              {MARITAL.map((m) => <option key={m} value={m}>{m ? m.replace(/_/g, " ") : "Any"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">State</label>
            <input className="input-glass" placeholder="e.g. Tamil Nadu" value={filters.state} onChange={(e) => F("state", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Caste</label>
            <input className="input-glass" placeholder="Any" value={filters.caste} onChange={(e) => F("caste", e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-end gap-3">
            <Button variant="gold" onClick={() => search(1)} className="flex-1 cursor-pointer" loading={loading}>
              <Filter size={14} /> Apply Filters
            </Button>
            <Button variant="glass" onClick={() => {
              setFilters({ ageMin: "", ageMax: "", gender: "", religion: "", caste: "", state: "", maritalStatus: "", heightMin: "", heightMax: "", nakshatra: "", rashi: "", nadi: "", gana: "", minMatchScore: "18" });
              setProfiles([]); setTotal(0);
            }} className="cursor-pointer">
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Profile cards */}
      {loading && profiles.length === 0 ? (
        <div className="grid gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass p-16 text-center">
          <Search size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted">No profiles found. Try adjusting your filters.</p>
          <Button variant="gold" size="sm" className="mt-4 cursor-pointer" onClick={() => search(1)}>Search All</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="glass p-0 overflow-hidden group hover:border-[rgba(201,151,44,0.25)] transition-colors">
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Gallery Slider - 30% */}
                  <div className="w-full sm:w-[30%] aspect-[3/4] sm:aspect-auto bg-gradient-to-b from-[#7B1D1D]/30 to-[#1a0505] relative">
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
                      {profile.matchScore !== undefined && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                          profile.matchScore >= 24 ? "bg-emerald-900/80 text-emerald-400" :
                          profile.matchScore >= 18 ? "bg-amber-900/80 text-amber-400" :
                          "bg-red-900/80 text-red-400"
                        }`}>
                          <Sparkles size={8} /> {profile.matchScore}/36
                        </span>
                      )}
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
                  </div>
                  
                  {/* Details - 70% */}
                  <div className="w-full sm:w-[70%] p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-xl">
                          {profile.profile?.fullName || "Unknown"}
                        </h3>
                        <p className="text-muted text-sm mt-1">
                          {profile.age ? `${profile.age} yrs` : ""} {profile.profile?.height ? `• ${cmToFeetInches(profile.profile.height)}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleWishlist(profile.id)}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${wishlist[profile.id] ? "bg-[rgba(201,151,44,0.2)] text-[#C9972C]" : "bg-white/5 text-muted hover:text-muted"}`}
                        disabled={togglingWishlist === profile.id}
                      >
                        <Heart size={20} className={wishlist[profile.id] ? "fill-[#C9972C]" : ""} />
                      </button>
                    </div>
                    
                    {/* Multi-column details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      <div>
                        <div className="text-muted text-xs mb-1">Location</div>
                        <div className="text-foreground text-sm">{profile.profile?.city || ""}, {profile.profile?.state || ""}</div>
                      </div>
                      <div>
                        <div className="text-muted text-xs mb-1">Religion</div>
                        <div className="text-foreground text-sm">{profile.profile?.religion || ""}</div>
                      </div>
                      <div>
                        <div className="text-muted text-xs mb-1">Caste</div>
                        <div className="text-foreground text-sm">{profile.profile?.caste || ""}</div>
                      </div>
                      <div>
                        <div className="text-muted text-xs mb-1">Profile Completion</div>
                        <div className="text-foreground text-sm">{profile.profile?.profileCompletionPct || 0}%</div>
                      </div>
                      <div>
                        <div className="text-muted text-xs mb-1">Gender</div>
                        <div className="text-foreground text-sm capitalize">{profile.gender?.toLowerCase() || ""}</div>
                      </div>
                      <div>
                        <div className="text-muted text-xs mb-1">Status</div>
                        <div className="text-foreground text-sm capitalize">{profile.isKycVerified ? "Verified" : "Pending"}</div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex gap-3">
                      {receivedInterests[profile.id] ? (
                        <>
                          <Button
                            variant="gold"
                            size="sm"
                            className="flex-1 text-sm h-10 cursor-pointer"
                            onClick={() => acceptInterest(profile.id)}
                          >
                            <Check size={14} /> Accept
                          </Button>
                          <Button
                            variant="glass"
                            size="sm"
                            className="flex-1 text-sm h-10 cursor-pointer"
                            onClick={() => rejectInterest(profile.id)}
                          >
                            <X size={14} /> Decline
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant={interests[profile.id] ? "glass-gold" : "glass"}
                            size="sm"
                            className="flex-1 text-sm h-10 cursor-pointer"
                            onClick={() => sendInterest(profile.id)}
                            disabled={interests[profile.id] || sendingInterest === profile.id}
                            loading={sendingInterest === profile.id}
                          >
                            <Heart size={14} className={interests[profile.id] ? "fill-[#C9972C]" : ""} />
                            {interests[profile.id] ? "Interest Sent" : "Send Interest"}
                          </Button>
                          {profile.matchScore !== undefined && (
                            <Button
                              variant="glass"
                              size="sm"
                              className="text-sm h-10 px-4 cursor-pointer"
                              onClick={() => {
                                console.log("[Match Button] Clicked, matchDetails:", (profile as any).matchDetails);
                                setSelectedMatch((profile as any).matchDetails);
                                setMatchModalOpen(true);
                              }}
                            >
                              <Sparkles size={14} /> Match
                            </Button>
                          )}
                        </>
                      )}
                      <Button variant="glass" size="sm" asChild className="text-sm h-10 px-4 cursor-pointer">
                        <Link href={`/profile/${profile.id}`}>View Profile</Link>
                      </Button>
                      {profile.matchScore !== undefined && (
                        <div 
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                            profile.matchScore >= 24 ? "bg-emerald-900/50 text-emerald-400" :
                            profile.matchScore >= 18 ? "bg-amber-900/50 text-amber-400" :
                            "bg-red-900/50 text-red-400"
                          }`}
                          onClick={() => {
                            setSelectedMatch((profile as any).matchDetails);
                            setMatchModalOpen(true);
                          }}
                        >
                          <Sparkles size={10} /> {profile.matchScore}/36
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {profiles.length < total && (
            <div className="text-center">
              <Button variant="glass" onClick={() => search(page + 1)} loading={loading} className="cursor-pointer">
                Load More ({total - profiles.length} remaining)
              </Button>
            </div>
          )}
        </>
      )}

      {/* Match Details Modal */}
      {matchModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-[#C9972C]" />
                <h2 className="font-display text-xl font-bold text-foreground">Horoscope Match Details</h2>
              </div>
              <button onClick={() => setMatchModalOpen(false)} className="text-muted hover:text-foreground cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Overall Score */}
            <div className="bg-[rgba(201,151,44,0.1)] border border-[rgba(201,151,44,0.2)] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-muted text-sm">Match Score</div>
                  <div className="font-display text-3xl font-bold text-[#C9972C]">
                    {selectedMatch.finalScore}/{selectedMatch.maxScore}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    selectedMatch.category === "Excellent" ? "text-emerald-400" :
                    selectedMatch.category === "Good" ? "text-emerald-400" :
                    selectedMatch.category === "Average" ? "text-amber-400" :
                    "text-red-400"
                  }`}>
                    {selectedMatch.category}
                  </div>
                  <div className="text-muted text-xs">{selectedMatch.percentage}%</div>
                </div>
              </div>
            </div>

            {/* Guna Breakdown */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Guna Milan Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(selectedMatch.breakdown).map(([guna, data]: [string, any]) => (
                  <div key={guna} className="flex items-center justify-between text-sm">
                    <span className="text-muted capitalize">{guna.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted">{data.score}/{data.max}</span>
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            data.score === data.max ? "bg-emerald-500" :
                            data.score >= data.max / 2 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${(data.score / data.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dosha Check */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Dosha Check</h3>
              <div className={`p-3 rounded-lg ${
                selectedMatch.doshaCheck.severity === "none" ? "bg-emerald-900/20 border border-emerald-700/30" :
                selectedMatch.doshaCheck.severity === "mild" ? "bg-amber-900/20 border border-amber-700/30" :
                selectedMatch.doshaCheck.severity === "moderate" ? "bg-orange-900/20 border border-orange-700/30" :
                "bg-red-900/20 border border-red-700/30"
              }`}>
                <div className="text-sm text-muted mb-2">
                  Severity: <span className={`font-semibold ${
                    selectedMatch.doshaCheck.severity === "none" ? "text-emerald-400" :
                    selectedMatch.doshaCheck.severity === "mild" ? "text-amber-400" :
                    selectedMatch.doshaCheck.severity === "moderate" ? "text-orange-400" :
                    "text-red-400"
                  } capitalize`}>{selectedMatch.doshaCheck.severity}</span>
                </div>
                {selectedMatch.doshaCheck.warnings.length > 0 && (
                  <ul className="text-xs text-muted space-y-1">
                    {selectedMatch.doshaCheck.warnings.map((warning: string, i: number) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {selectedMatch.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Recommendations</h3>
                <ul className="text-xs text-muted space-y-1">
                  {selectedMatch.recommendations.map((rec: string, i: number) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
