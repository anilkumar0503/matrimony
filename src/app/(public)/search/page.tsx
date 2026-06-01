"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Heart, ChevronRight, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge } from "@/lib/utils";

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
  } | null;
  hasPrimaryPhoto: boolean;
  primaryPhotoUrl: string | null;
  isKycVerified: boolean;
  subscriptionTier: string;
}

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
  const [filters, setFilters] = useState({
    ageRange: "",
    religion: "",
    maritalStatus: "",
    location: "",
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
  }, []);

  const fetchProfiles = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (searchQuery) params.set("search", searchQuery);
      if (filters.ageRange) params.set("ageRange", filters.ageRange);
      if (filters.religion) params.set("religion", filters.religion);
      if (filters.maritalStatus) params.set("maritalStatus", filters.maritalStatus);
      if (filters.location) params.set("location", filters.location);

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
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfiles();
    }
  }, [isLoggedIn, page]);

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

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 badge-gold mb-4">
              <Search size={13} /> Find Your Match
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Browse <span className="text-gold">Verified Profiles</span>
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Explore thousands of KYC-verified profiles. Use filters to find your perfect life partner.
            </p>
          </div>
          {/* {isLoggedIn && (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
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
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by name, ID, or location..."
                className="input-glass input-glass-with-icon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="gold" className="px-6" onClick={handleSearch} disabled={!isLoggedIn || searching} loading={searching}>
              Search
            </Button>
            <Button variant="glass" onClick={() => setShowFilters(!showFilters)} disabled={!isLoggedIn}>
              <Filter size={16} />
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/[0.06] grid sm:grid-cols-4 gap-3">
              <select 
                className="input-glass" 
                value={filters.ageRange}
                onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
              >
                <option value="">Age Range</option>
                <option value="18-25">18-25</option>
                <option value="26-30">26-30</option>
                <option value="31-35">31-35</option>
                <option value="36+">36+</option>
              </select>
              <select 
                className="input-glass"
                value={filters.religion}
                onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
              >
                <option value="">Religion</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Other">Other</option>
              </select>
              <select 
                className="input-glass"
                value={filters.maritalStatus}
                onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}
              >
                <option value="">Marital Status</option>
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
              <select 
                className="input-glass"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">Location</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Chennai">Chennai</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        {!isLoggedIn ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#C9972C]/10 border border-[#C9972C]/20 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-[#C9972C]" />
            </div>
            <h3 className="font-display text-xl text-white mb-2">Sign In to View Profiles</h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
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
            <div className="text-white/50">Loading profiles...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-white/50">No profiles found matching your criteria.</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {profiles.map((profile) => {
              return (
                <Link key={profile.id} href={`/profile/${profile.id}`} className="block">
                  <div className="glass p-5 hover:bg-white/[0.05] transition-all duration-300 hover:scale-[1.02] border border-white/[0.06] hover:border-[#C9972C]/30">
                    <div className="flex gap-4">
                      <div className="w-28 h-28 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/[0.08]">
                        {profile.primaryPhotoUrl ? (
                          <img 
                            src={profile.primaryPhotoUrl} 
                            alt={profile.profile?.fullName || "Profile"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
                            <User size={32} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white truncate text-base">{profile.profile?.fullName || "Unknown"}</h3>
                            {profile.isKycVerified && (
                              <Badge variant="success" className="text-[10px] px-2 py-0.5">KYC</Badge>
                            )}
                          </div>
                          <div className="text-white/50 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                            <div>
                              <span className="text-white/30 block text-[10px] uppercase tracking-wide">Age</span>
                              <span className="text-white/70 font-medium">{profile.age ? `${profile.age} yrs` : "—"}</span>
                            </div>
                            <div>
                              <span className="text-white/30 block text-[10px] uppercase tracking-wide">Status</span>
                              <span className="text-white/70 font-medium">{profile.profile?.maritalStatus?.replace(/_/g, " ") || "—"}</span>
                            </div>
                            <div>
                              <span className="text-white/30 block text-[10px] uppercase tracking-wide">Location</span>
                              <span className="text-white/70 font-medium truncate block">{profile.profile?.city || "—"}, {profile.profile?.state || ""}</span>
                            </div>
                            <div>
                              <span className="text-white/30 block text-[10px] uppercase tracking-wide">Religion</span>
                              <span className="text-white/70 font-medium truncate block">{profile.profile?.religion || "—"}</span>
                            </div>
                            <div>
                              <span className="text-white/30 block text-[10px] uppercase tracking-wide">Education</span>
                              <span className="text-white/70 font-medium truncate block">{profile.profile?.qualification || "—"}</span>
                            </div>
                            <div>
                              <span className="text-white/30 block text-[10px] uppercase tracking-wide">Occupation</span>
                              <span className="text-white/70 font-medium truncate block">{profile.profile?.occupationType || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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
            >
              Previous
            </Button>
            <div className="text-white/50 text-sm">
              Page {page} of {totalPages} ({total} results)
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
              <div className="text-[#C9972C] font-medium mb-1">{f.title}</div>
              <div className="text-white/40 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
