"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Heart, ChevronRight, User, LogOut, SlidersHorizontal, Sparkles, X, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cmToFeetInches } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  gender: string;
  dateOfBirth: string;
  age: number | null;
  profile: {
    fullName: string;
    height: number | null;
    city: string;
    state: string;
    religion: string;
    caste: string;
    maritalStatus: string;
    aboutMe: string | null;
    qualification: string | null;
    occupationType: string | null;
    annualIncome: string | null;
    profileCompletionPct: number;
  } | null;
  hasPrimaryPhoto: boolean;
  primaryPhotoUrl: string | null;
  isKycVerified: boolean;
  subscriptionTier: string;
  matchScore?: number;
  matchCategory?: string;
  matchDetails?: any;
}

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

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [useHoroscopeMatch, setUseHoroscopeMatch] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [userGender, setUserGender] = useState<"MALE" | "FEMALE" | null>(null);
  const [interests, setInterests] = useState<Record<string, boolean>>({});
  const [receivedInterests, setReceivedInterests] = useState<Record<string, boolean>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);
  const [togglingWishlist, setTogglingWishlist] = useState<string | null>(null);
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    ageMin: "",
    ageMax: "",
    gender: "",
    religion: "",
    caste: "",
    education: "",
    maritalStatus: "",
    state: "",
    motherTongue: "",
    occupationType: "",
    kycOnly: false,
    heightMin: "",
    heightMax: "",
    nakshatra: "",
    rashi: "",
    nadi: "",
    gana: "",
    minMatchScore: "18",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userInfo = localStorage.getItem("userInfo");
    setIsLoggedIn(!!token);
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUserName(parsed.fullName || parsed.name || parsed.firstName || "User");
      } catch {
        setUserName("User");
      }
    }

    // Fetch user's gender to set default opposite gender filter
    const fetchUserGender = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data?.user?.gender) {
          setUserGender(json.data.user.gender);
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
      if (!token) return;
      try {
        const res = await fetch("/api/user/interests?type=received", {
          headers: { Authorization: `Bearer ${token}` }
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

    // Fetch wishlist
    const fetchWishlist = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/user/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          const wishlistMap: Record<string, boolean> = {};
          json.data.wishlist.forEach((w: any) => {
            wishlistMap[w.profileId] = true;
          });
          setWishlist(wishlistMap);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    fetchWishlist();
  }, []);

  const fetchProfiles = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    try {
      if (useHoroscopeMatch) {
        // Use horoscope match API
        const horoscopeFilters: any = {};
        if (filters.nakshatra) horoscopeFilters.nakshatra = filters.nakshatra;
        if (filters.rashi) horoscopeFilters.rashi = filters.rashi;
        if (filters.nadi) horoscopeFilters.nadi = filters.nadi;
        if (filters.gana) horoscopeFilters.gana = filters.gana;

        const res = await fetch("/api/horoscope/match", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
          const matchedProfiles = json.data.matches.map((m: any) => ({
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
              maritalStatus: "",
              aboutMe: null,
              annualIncome: null,
            },
            hasPrimaryPhoto: false,
            primaryPhotoUrl: null,
            isKycVerified: false,
            subscriptionTier: "FREE",
            matchScore: m.match.finalScore,
            matchCategory: m.match.category,
            matchDetails: m.match,
          }));
          setProfiles(matchedProfiles);
          setTotal(matchedProfiles.length);
          setTotalPages(1);
        } else {
          toast({
            title: "Horoscope match failed",
            description: json.error || "Failed to calculate horoscope matches",
            variant: "destructive",
          });
        }
      } else {
        // Use regular search API
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "20");
        if (searchQuery) params.set("search", searchQuery);
        if (filters.ageMin) params.set("ageMin", filters.ageMin);
        if (filters.ageMax) params.set("ageMax", filters.ageMax);
        if (filters.gender) params.set("gender", filters.gender);
        if (filters.religion) params.set("religion", filters.religion);
        if (filters.caste) params.set("caste", filters.caste);
        if (filters.education) params.set("education", filters.education);
        if (filters.maritalStatus) params.set("maritalStatus", filters.maritalStatus);
        if (filters.state) params.set("state", filters.state);
        if (filters.motherTongue) params.set("motherTongue", filters.motherTongue);
        if (filters.occupationType) params.set("occupationType", filters.occupationType);
        if (filters.kycOnly) params.set("kycOnly", "true");

        const res = await fetch(`/api/user/search?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userInfo");
          window.location.replace("/login");
          return;
        }

        const json = await res.json();
        if (json.success) {
          setProfiles(json.data.users || []);
          setTotalPages(json.data.pagination?.totalPages || 1);
          setTotal(json.data.pagination?.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && filters.gender) {
      fetchProfiles();
    }
  }, [isLoggedIn, page, filters.gender, useHoroscopeMatch]);

  const handleSearch = () => {
    setPage(1);
    setSearching(true);
    fetchProfiles().finally(() => setSearching(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    window.location.replace("/");
  };

  const token = () => localStorage.getItem("accessToken");

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
        toast({
          title: "Interest sent",
          description: "Your interest has been sent successfully",
        });
      } else {
        toast({
          title: "Failed to send interest",
          description: json.error || "Please try again",
          variant: "destructive",
        });
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

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 badge-gold mb-4">
              <Search size={13} /> Find Your Match
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse <span className="text-gold">Verified Profiles</span>
            </h1>
            <p className="text-muted max-w-xl mx-auto">
              Explore thousands of KYC-verified profiles. Use filters to find your perfect life partner.
            </p>
          </div>
          {/* {isLoggedIn && (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 text-muted hover:text-foreground text-sm">
                <User size={16} />
                {userName}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
          )} */}
        </div>

        {/* Search Bar */}
        <div className="glass p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by name, ID, or location..."
                className="input-glass input-glass-with-icon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="gold" className="px-6 cursor-pointer" onClick={handleSearch} disabled={!isLoggedIn || searching} loading={searching}>
              Search
            </Button>
            <Button variant="glass" onClick={() => setShowFilters(!showFilters)} disabled={!isLoggedIn} className="cursor-pointer">
              <SlidersHorizontal size={16} /> Filters {showFilters && <X size={14} />}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              {/* Horoscope Match Toggle */}
              <div className="flex items-center gap-3 p-3 bg-[rgba(201,151,44,0.1)] rounded-lg border border-[rgba(201,151,44,0.2)] mb-4">
                <Sparkles size={18} className="text-[#f78222]" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Horoscope Matching</div>
                  <div className="text-xs text-muted">Find matches based on Vedic astrology compatibility</div>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${useHoroscopeMatch ? "bg-[#f78222]" : "bg-white/20"}`}
                  onClick={() => setUseHoroscopeMatch(!useHoroscopeMatch)}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${useHoroscopeMatch ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Horoscope Filters */}
              {useHoroscopeMatch && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-muted mb-1">Nakshatra</label>
                    <select className="input-glass" value={filters.nakshatra} onChange={(e) => setFilters({ ...filters, nakshatra: e.target.value })}>
                      {NAKSHATRAS.map((n) => <option key={n} value={n}>{n || "Any"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Rashi</label>
                    <select className="input-glass" value={filters.rashi} onChange={(e) => setFilters({ ...filters, rashi: e.target.value })}>
                      {RASHIS.map((r) => <option key={r} value={r}>{r || "Any"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Nadi</label>
                    <select className="input-glass" value={filters.nadi} onChange={(e) => setFilters({ ...filters, nadi: e.target.value })}>
                      {NADIS.map((n) => <option key={n} value={n}>{n || "Any"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Gana</label>
                    <select className="input-glass" value={filters.gana} onChange={(e) => setFilters({ ...filters, gana: e.target.value })}>
                      {GANAS.map((g) => <option key={g} value={g}>{g || "Any"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Min Match Score</label>
                    <select className="input-glass" value={filters.minMatchScore} onChange={(e) => setFilters({ ...filters, minMatchScore: e.target.value })}>
                      <option value="18">18 (Good)</option>
                      <option value="24">24 (Excellent)</option>
                      <option value="30">30 (Outstanding)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Regular Filters */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="input-glass" 
                    value={filters.ageMin}
                    onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                  >
                    <option value="">Min Age</option>
                    {Array.from({ length: 40 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <select 
                    className="input-glass"
                    value={filters.ageMax}
                    onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                  >
                    <option value="">Max Age</option>
                    {Array.from({ length: 40 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
                <select 
                  className="input-glass"
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                >
                  <option value="">Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <select 
                  className="input-glass"
                  value={filters.religion}
                  onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
                >
                  <option value="">Religion</option>
                  {RELIGIONS.map((r) => <option key={r} value={r}>{r || "Any"}</option>)}
                </select>
                <select 
                  className="input-glass"
                  value={filters.caste}
                  onChange={(e) => setFilters({ ...filters, caste: e.target.value })}
                >
                  <option value="">Caste</option>
                  <option value="Brahmin">Brahmin</option>
                  <option value="Kshatriya">Kshatriya</option>
                  <option value="Vaishya">Vaishya</option>
                  <option value="Shudra">Shudra</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  className="input-glass"
                  value={filters.education}
                  onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                >
                  <option value="">Education</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Professional">Professional</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  className="input-glass"
                  value={filters.maritalStatus}
                  onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}
                >
                  <option value="">Marital Status</option>
                  {MARITAL.map((m) => <option key={m} value={m}>{m ? m.replace(/_/g, " ") : "Any"}</option>)}
                </select>
                <select 
                  className="input-glass"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                >
                  <option value="">State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  className="input-glass"
                  value={filters.motherTongue}
                  onChange={(e) => setFilters({ ...filters, motherTongue: e.target.value })}
                >
                  <option value="">Mother Tongue</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  className="input-glass"
                  value={filters.occupationType}
                  onChange={(e) => setFilters({ ...filters, occupationType: e.target.value })}
                >
                  <option value="">Occupation</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
                <label className="flex items-center gap-2 text-muted text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.kycOnly}
                    onChange={(e) => setFilters({ ...filters, kycOnly: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#f78222]"
                  />
                  KYC Verified Only
                </label>
                <div className="sm:col-span-2 flex items-end gap-3">
                  <Button variant="gold" onClick={handleSearch} className="flex-1 cursor-pointer" loading={loading}>
                    <Filter size={14} /> Apply Filters
                  </Button>
                  <Button variant="glass" onClick={() => {
                    setFilters({ ageMin: "", ageMax: "", gender: "", religion: "", caste: "", state: "", maritalStatus: "", heightMin: "", heightMax: "", nakshatra: "", rashi: "", nadi: "", gana: "", minMatchScore: "18", education: "", motherTongue: "", occupationType: "", kycOnly: false });
                    setProfiles([]); setTotal(0);
                  }} className="cursor-pointer">
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {!isLoggedIn ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#f78222]/10 border border-[#f78222]/20 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-[#f78222]" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Sign In to View Profiles</h3>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Create a free account to browse verified profiles, send interests, and find your perfect match.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="gold" asChild>
                <Link href="/register">Create Free Profile</Link>
              </Button>
              <Button variant="glass" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="text-muted">Loading profiles...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted">No profiles found matching your criteria.</div>
          </div>
        ) : (
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
                          <span className="text-3xl font-display font-bold text-[#f78222]">
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
                        <span className="bg-[rgba(201,151,44,0.8)] text-[#ffffff] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
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
                        className={`p-2 rounded-full transition-colors cursor-pointer ${wishlist[profile.id] ? "bg-[rgba(201,151,44,0.2)] text-[#f78222]" : "bg-white/5 text-muted hover:text-muted"}`}
                        disabled={togglingWishlist === profile.id}
                      >
                        <Heart size={20} className={wishlist[profile.id] ? "fill-[#f78222]" : ""} />
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
                            <Heart size={14} className={interests[profile.id] ? "fill-[#f78222]" : ""} />
                            {interests[profile.id] ? "Interest Sent" : "Send Interest"}
                          </Button>
                          {profile.matchScore !== undefined && (
                            <Button
                              variant="glass"
                              size="sm"
                              className="text-sm h-10 px-4 cursor-pointer"
                              onClick={() => {
                                setSelectedMatch(profile.matchDetails);
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
                            setSelectedMatch(profile.matchDetails);
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <div className="text-muted text-sm">
              Page {page} of {totalPages} ({total} results)
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        )}

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4 mt-12">
          {[
            { title: "KYC Verified", desc: "All profiles are government ID verified" },
            { title: "Privacy Protected", desc: "Your data is secure with DPDP Act 2023" },
            { title: "Real People", desc: "Admin-approved profiles only" },
          ].map((f) => (
            <div key={f.title} className="glass p-4 text-center">
              <div className="text-[#f78222] font-medium mb-1">{f.title}</div>
              <div className="text-muted text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Details Modal */}
      {matchModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-[#f78222]" />
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
                  <div className="font-display text-3xl font-bold text-[#f78222]">
                    {selectedMatch.finalScore}/{selectedMatch.maxScore}
                  </div>
                  <div className="text-muted text-xs mt-1">{selectedMatch.percentage}% compatibility</div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedMatch.category === "Excellent" ? "bg-emerald-900/50 text-emerald-400" :
                  selectedMatch.category === "Good" ? "bg-amber-900/50 text-amber-400" :
                  "bg-red-900/50 text-red-400"
                }`}>
                  {selectedMatch.category}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-6">
              <h3 className="text-foreground font-semibold mb-3">Guna Milan Breakdown</h3>
              {Object.entries(selectedMatch.breakdown || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-foreground font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-muted text-xs">{value.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#f78222] font-semibold">{value.score}/{value.max}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dosha Check */}
            {selectedMatch.doshaCheck && (
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-foreground font-semibold mb-3">Dosha Check</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Manglik Dosha</span>
                    <span className={selectedMatch.doshaCheck.hasManglikDosha ? "text-red-400" : "text-emerald-400"}>
                      {selectedMatch.doshaCheck.hasManglikDosha ? "Present" : "Absent"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Nadi Dosha</span>
                    <span className={selectedMatch.doshaCheck.hasNadiDosha ? "text-red-400" : "text-emerald-400"}>
                      {selectedMatch.doshaCheck.hasNadiDosha ? "Present" : "Absent"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Bhakoot Dosha</span>
                    <span className={selectedMatch.doshaCheck.hasBhakootDosha ? "text-red-400" : "text-emerald-400"}>
                      {selectedMatch.doshaCheck.hasBhakootDosha ? "Present" : "Absent"}
                    </span>
                  </div>
                </div>
                {selectedMatch.doshaCheck.warnings && selectedMatch.doshaCheck.warnings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {selectedMatch.doshaCheck.warnings.map((warning: string, i: number) => (
                      <div key={i} className="text-amber-400 text-xs mt-1">⚠️ {warning}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {selectedMatch.recommendations && selectedMatch.recommendations.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-900/30 rounded-xl p-4">
                <h3 className="text-amber-400 font-semibold mb-2">Recommendations</h3>
                {selectedMatch.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="text-muted text-sm mt-1">• {rec}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
