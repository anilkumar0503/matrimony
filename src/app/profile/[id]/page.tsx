"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, Shield, Star, MapPin, GraduationCap, Briefcase,
  Users, ChevronLeft, Lock, Crown, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cmToFeetInches } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";

interface Profile {
  id: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  profile: {
    fullName: string; city: string; state: string; religion: string; caste: string;
    height: number | null; motherTongue: string; maritalStatus: string;
    aboutMe: string | null; qualification: string | null; occupationType: string | null;
    annualIncome: string | null; familyType: string | null; familyValues: string | null;
    profileCompletionPct: number;
  } | null;
  images: { id: string; originalUrl: string; watermarkedUrl: string | null; isPrimary: boolean }[];
  isKycVerified: boolean;
  subscriptionTier: string;
  interestStatus?: string;
  isWishlisted?: boolean;
}

interface SearchProfile {
  id: string;
  gender: string;
  dateOfBirth: string;
  age: number | null;
  profile: {
    fullName: string; city: string; state: string; religion: string; caste: string;
    height: number | null; motherTongue: string; maritalStatus: string;
    aboutMe: string | null; qualification: string | null; occupationType: string | null;
    annualIncome: string | null; familyType: string | null; familyValues: string | null;
    profileCompletionPct: number;
  } | null;
  hasPrimaryPhoto: boolean;
  primaryPhotoUrl: string | null;
  isKycVerified: boolean;
  subscriptionTier: string;
}

export default function ProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestSent, setInterestSent] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [similarProfiles, setSimilarProfiles] = useState<SearchProfile[]>([]);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const token = () => localStorage.getItem("accessToken");

  useEffect(() => {
    const headers: Record<string, string> = {};
    const tokenValue = token();
    if (tokenValue) {
      headers.Authorization = `Bearer ${tokenValue}`;
    }

    fetch(`/api/profiles/${id}`, { headers })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userInfo");
          window.location.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (json && json.success) {
          setProfile(json.data.profile);
          setInterestSent(json.data.interestStatus === "PENDING" || json.data.interestStatus === "ACCEPTED");
          setWishlisted(json.data.isWishlisted);
          
          // Fetch similar profiles
          if (json.data.profile.profile) {
            const p = json.data.profile.profile;
            const params = new URLSearchParams();
            if (p.religion) params.set("religion", p.religion);
            if (p.city) params.set("location", p.city);
            if (json.data.profile.gender) params.set("gender", json.data.profile.gender === "MALE" ? "FEMALE" : "MALE");
            
            fetch(`/api/user/search?${params}`, { headers })
              .then((r) => r.json())
              .then((searchJson) => {
                if (searchJson.success) {
                  setSimilarProfiles(searchJson.data.users?.filter((u: Profile) => u.id !== id).slice(0, 6) || []);
                }
              })
              .catch(() => {});
          }
        } else if (json) {
          console.error("Profile fetch error:", json.error);
        }
      })
      .catch((err) => {
        console.error("Profile fetch failed:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const sendInterest = async () => {
    setSendingInterest(true);
    try {
      const res = await fetch("/api/user/interests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: id }),
      });
      if ((await res.json()).success) setInterestSent(true);
    } finally {
      setSendingInterest(false);
    }
  };

  const toggleWishlist = async () => {
    setTogglingWishlist(true);
    try {
      if (wishlisted) {
        await fetch(`/api/user/wishlist?profileId=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
        setWishlisted(false);
      } else {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: id }),
        });
        if ((await res.json()).success) setWishlisted(true);
      }
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a0505] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="skeleton h-[400px] rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#1a0505] flex items-center justify-center text-white/50">
      Profile not found
    </div>
  );

  const p = profile.profile;
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const photos = profile.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  return (
    <div className="min-h-screen bg-[#1a0505]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm"
        >
          <ChevronLeft size={16} /> Back to Search
        </button>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Photo column */}
          <div className="md:col-span-2 space-y-3">
            <div className="relative aspect-[3/4] glass overflow-hidden p-0 rounded-2xl">
              {photos.length > 0 && (photos[currentPhoto]?.watermarkedUrl || photos[currentPhoto]?.originalUrl) ? (
                <img
                  src={photos[currentPhoto].watermarkedUrl || photos[currentPhoto].originalUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Lock size={32} className="text-white/20" />
                  <span className="text-white/30 text-sm">No photo shared</span>
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {profile.isKycVerified && (
                  <span className="bg-emerald-900/80 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield size={10} /> Verified
                  </span>
                )}
                {profile.subscriptionTier !== "FREE" && (
                  <span className="bg-[rgba(201,151,44,0.85)] text-[#1a0505] text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown size={10} /> {profile.subscriptionTier}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((ph, idx) => (
                  <button
                    key={ph.id}
                    onClick={() => setCurrentPhoto(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${currentPhoto === idx ? "border-[#C9972C]" : "border-white/10"}`}
                  >
                    <img src={ph.watermarkedUrl || ph.originalUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="gold" className="w-full" onClick={sendInterest} disabled={interestSent || sendingInterest} loading={sendingInterest}>
                <Heart size={16} className={interestSent ? "fill-current" : ""} />
                {interestSent ? "Interest Sent" : "Send Interest"}
              </Button>
              <Button variant={wishlisted ? "glass-gold" : "glass"} className="w-full" onClick={toggleWishlist} disabled={togglingWishlist} loading={togglingWishlist}>
                <Star size={16} className={wishlisted ? "fill-[#C9972C] text-[#C9972C]" : ""} />
                {wishlisted ? "Wishlisted" : "Add to Wishlist"}
              </Button>
            </div>
          </div>

          {/* Details column */}
          <div className="md:col-span-3 space-y-5">
            {/* Header */}
            <div className="glass p-6">
              <h1 className="font-display text-3xl font-bold text-white mb-1">{p?.fullName || "—"}</h1>
              <div className="flex flex-wrap gap-3 text-white/60 text-sm mt-2">
                {age && <span>{age} years</span>}
                {p?.height && <span>{cmToFeetInches(p.height)}</span>}
                {p?.maritalStatus && <span>{p.maritalStatus.replace(/_/g, " ")}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {p?.city && (
                  <span className="badge-glass flex items-center gap-1 text-xs">
                    <MapPin size={10} /> {p.city}, {p.state}
                  </span>
                )}
                {p?.religion && <span className="badge-glass text-xs">{p.religion}</span>}
                {p?.caste && <span className="badge-glass text-xs">{p.caste}</span>}
                {p?.motherTongue && <span className="badge-glass text-xs">{p.motherTongue}</span>}
              </div>
              {p?.aboutMe && (
                <p className="text-white/60 text-sm mt-4 leading-relaxed italic">"{p.aboutMe}"</p>
              )}
            </div>

            {/* Education & Career */}
            {(p?.qualification || p?.occupationType) && (
              <div className="glass p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <GraduationCap size={16} className="text-[#C9972C]" /> Education & Career
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {p?.qualification && (
                    <div>
                      <div className="text-white/40 text-xs mb-1">Qualification</div>
                      <div className="text-white/80 text-sm">{p.qualification}</div>
                    </div>
                  )}
                  {p?.occupationType && (
                    <div>
                      <div className="text-white/40 text-xs mb-1">Occupation</div>
                      <div className="text-white/80 text-sm">{p.occupationType}</div>
                    </div>
                  )}
                  {p?.annualIncome && (
                    <div>
                      <div className="text-white/40 text-xs mb-1">Annual Income</div>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <Briefcase size={12} /> {p.annualIncome}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Family */}
            {(p?.familyType || p?.familyValues) && (
              <div className="glass p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={16} className="text-[#C9972C]" /> Family Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {p?.familyType && (
                    <div>
                      <div className="text-white/40 text-xs mb-1">Family Type</div>
                      <div className="text-white/80 text-sm">{p.familyType}</div>
                    </div>
                  )}
                  {p?.familyValues && (
                    <div>
                      <div className="text-white/40 text-xs mb-1">Family Values</div>
                      <div className="text-white/80 text-sm">{p.familyValues}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Premium upsell — contact info locked */}
            <div className="glass border-[rgba(201,151,44,0.2)] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-white/30" />
                <div>
                  <div className="text-sm font-medium text-white">Contact info is locked</div>
                  <div className="text-xs text-white/40">Upgrade to Premium to view phone & email</div>
                </div>
              </div>
              <Button variant="gold" size="sm" asChild>
                <Link href="/dashboard/subscription">Upgrade <ArrowRight size={13} /></Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Profiles */}
        {similarProfiles.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Similar Profiles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {similarProfiles.map((similar) => {
                const similarAge = similar.dateOfBirth ? calculateAge(similar.dateOfBirth) : null;
                return (
                  <Link key={similar.id} href={`/profile/${similar.id}`} className="block">
                    <div className="glass p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          {similar.primaryPhotoUrl ? (
                            <img 
                              src={similar.primaryPhotoUrl} 
                              alt={similar.profile?.fullName || "Profile"} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                              <Users size={28} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{similar.profile?.fullName || "Unknown"}</h3>
                            {similar.isKycVerified && (
                              <Badge variant="success" className="text-[10px]">KYC</Badge>
                            )}
                          </div>
                          <div className="text-white/50 text-xs space-y-0.5">
                            <div><span className="text-white/30">Age:</span> {similarAge ? `${similarAge} yrs` : "—"} · <span className="text-white/30">Status:</span> {similar.profile?.maritalStatus?.replace(/_/g, " ") || "—"}</div>
                            <div className="truncate"><span className="text-white/30">Location:</span> {similar.profile?.city || "—"}, {similar.profile?.state || ""}</div>
                            <div className="truncate"><span className="text-white/30">Religion:</span> {similar.profile?.religion || "—"}</div>
                            <div className="truncate"><span className="text-white/30">Education:</span> {similar.profile?.qualification || "—"}</div>
                            <div className="truncate"><span className="text-white/30">Occupation:</span> {similar.profile?.occupationType || "—"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
