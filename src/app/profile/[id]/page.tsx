"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, Shield, Star, MapPin, GraduationCap, Briefcase,
  Users, ChevronLeft, ChevronRight, Lock, Crown, ArrowRight, ChevronDown, ChevronUp,
  User as UserIcon, Calendar, Phone, Mail, Flag, X, ZoomIn, Sparkles, ImageOff, ImagePlus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cmToFeetInches } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  profile: {
    // Basic Personal
    profileCreatedBy: string | null; firstName: string | null; middleName: string | null; lastName: string | null;
    fullName: string | null; height: number | null; weight: number | null; bloodGroup: string | null;
    physicalStatus: string | null; complexion: string | null; aboutMe: string | null; maritalStatus: string | null;
    // Contact
    alternatePhone: string | null; currentAddress: string | null; permanentAddress: string | null;
    city: string | null; state: string | null; country: string | null; postalCode: string | null;
    // Religion & Community
    motherTongue: string | null; religion: string | null; community: string | null; caste: string | null;
    subCaste: string | null; gothram: string | null; languagesKnown: string[] | null;
    // Horoscope
    timeOfBirth: string | null; placeOfBirth: string | null; nakshatra: string | null; rashi: string | null;
    lagna: string | null; dosham: string[] | null; nadi: string | null; gana: string | null;
    yoni: string | null; rajju: string | null; mahendra: string | null; vedha: string | null;
    dasaDetails: string | null; horoscopeNotes: string | null;
    // Education & Career
    qualification: string | null; university: string | null; occupationType: string | null;
    employerName: string | null; annualIncome: string | null; workCity: string | null; workState: string | null;
    // Family
    fatherName: string | null; fatherOccupation: string | null; fatherIncome: string | null;
    motherName: string | null; motherOccupation: string | null; brothersCount: number | null;
    marriedBrothers: number | null; sistersCount: number | null; marriedSisters: number | null;
    familyType: string | null; familyStatus: string | null; familyValues: string | null;
    // Lifestyle
    diet: string | null; smoking: string | null; drinking: string | null; fitnessLevel: string | null;
    exerciseHabits: string | null; sleepSchedule: string | null; hasPets: boolean | null; petsDetails: string | null;
    // Personality & Values
    personalityType: string | null; isIntrovert: boolean | null; isExtrovert: boolean | null;
    isFamilyOriented: boolean | null; isCareerOriented: boolean | null; religiousBeliefs: string | null;
    futureGoals: string | null; lifePriorities: string | null; partnerExpectations: string | null;
    // Meta
    profileCompletionPct: number; showGalleryPublic: boolean;
  } | null;
  images: { id: string; originalUrl: string; watermarkedUrl: string | null; signedUrl: string | null; isPrimary: boolean; category: string }[];
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
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestSent, setInterestSent] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [similarProfiles, setSimilarProfiles] = useState<SearchProfile[]>([]);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["personal", "religion", "education", "family", "horoscope", "lifestyle"]));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserGender, setCurrentUserGender] = useState<"MALE" | "FEMALE" | null>(null);
  const [horoscopeMatch, setHoroscopeMatch] = useState<any>(null);
  const [loadingHoroscopeMatch, setLoadingHoroscopeMatch] = useState(false);
  const [photoRequested, setPhotoRequested] = useState(false);
  const [sendingPhotoRequest, setSendingPhotoRequest] = useState(false);
  const [galleryHidden, setGalleryHidden] = useState(false);
  const [hasNoPhotos, setHasNoPhotos] = useState(false);
  const [pendingPhotoRequestNotifId, setPendingPhotoRequestNotifId] = useState<string | null>(null);
  const [actingOnPhotoRequest, setActingOnPhotoRequest] = useState(false);

  const token = () => localStorage.getItem("accessToken");

  // Get current user ID from JWT
  useEffect(() => {
    const tokenValue = token();
    if (tokenValue) {
      try {
        const payload = JSON.parse(atob(tokenValue.split('.')[1]));
        setCurrentUserId(payload.userId || payload.sub);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }

    // Fetch current user's gender
    const fetchUserGender = async () => {
      if (!tokenValue) return;
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${tokenValue}` }
        });
        const json = await res.json();
        if (json.success && json.data?.user?.gender) {
          setCurrentUserGender(json.data.user.gender);
        }
      } catch (err) {
        console.error("Failed to fetch user gender:", err);
      }
    };
    fetchUserGender();
  }, []);

  useEffect(() => {
    const tokenValue = token();
    if (!tokenValue) {
      window.location.replace(`/login?redirect=/profile/${id}`);
      return;
    }

    const headers: Record<string, string> = { Authorization: `Bearer ${tokenValue}` };

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
          setGalleryHidden(!!json.data.isGalleryHidden);
          setHasNoPhotos(!!json.data.hasNoPhotos);
          setPendingPhotoRequestNotifId(json.data.pendingPhotoRequestNotifId || null);
          // Check if photo request was already sent
          const tokenValue = token();
          if (tokenValue && (json.data.isGalleryHidden || json.data.hasNoPhotos)) {
            fetch(`/api/user/photo-request?targetUserId=${id}`, {
              headers: { Authorization: `Bearer ${tokenValue}` },
            }).then(r => r.json()).then(pj => { if (pj.success) setPhotoRequested(pj.data.requested); }).catch(() => {});
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

  // Fetch similar profiles when profile and user gender are loaded
  useEffect(() => {
    if (!profile?.profile || !currentUserGender) return;

    const p = profile.profile;
    const params = new URLSearchParams();
    if (p.religion) params.set("religion", p.religion);
    if (p.city) params.set("location", p.city);
    // Use current user's gender to show opposite gender profiles
    params.set("gender", currentUserGender === "MALE" ? "FEMALE" : "MALE");
    
    const tokenValue = token();
    const headers: Record<string, string> = {};
    if (tokenValue) {
      headers.Authorization = `Bearer ${tokenValue}`;
    }

    fetch(`/api/user/search?${params}`, { headers })
      .then((r) => r.json())
      .then((searchJson) => {
        if (searchJson.success) {
          setSimilarProfiles(searchJson.data.users?.filter((u: Profile) => u.id !== id).slice(0, 6) || []);
        }
      })
      .catch(() => {});
  }, [profile, currentUserGender, id]);

  // Fetch horoscope match between viewed profile and logged-in user
  useEffect(() => {
    if (!profile?.profile || !currentUserId || currentUserId === id) return;

    const tokenValue = token();
    if (!tokenValue) return;

    setLoadingHoroscopeMatch(true);
    fetch("/api/horoscope/match", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenValue}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        targetProfileId: id,
        minScore: 0,
        sortByScore: false,
        limit: 1,
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.matches.length > 0) {
          setHoroscopeMatch(json.data.matches[0].match);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch horoscope match:", err);
      })
      .finally(() => setLoadingHoroscopeMatch(false));
  }, [profile, currentUserId, id]);

  const handlePhotoRequestAction = async (action: "APPROVE" | "REJECT") => {
    if (!pendingPhotoRequestNotifId) return;
    setActingOnPhotoRequest(true);
    try {
      const res = await fetch("/api/user/photo-request", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: pendingPhotoRequestNotifId, action }),
      });
      const json = await res.json();
      if (json.success) {
        setPendingPhotoRequestNotifId(null);
        toast({
          title: action === "APPROVE" ? "Approved" : "Rejected",
          description: json.data.message,
          variant: "success",
        });
      } else {
        toast({ title: "Error", description: json.error || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed", variant: "destructive" });
    } finally {
      setActingOnPhotoRequest(false);
    }
  };

  const sendPhotoRequest = async () => {
    setSendingPhotoRequest(true);
    try {
      const res = await fetch("/api/user/photo-request", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setPhotoRequested(true);
        toast({ title: "Request sent", description: "Your photo access request has been sent", variant: "success" });
      } else if (json.code === "PHOTO_REQUEST_EXISTS") {
        setPhotoRequested(true);
      } else {
        toast({ title: "Error", description: json.error || "Failed to send request", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    } finally {
      setSendingPhotoRequest(false);
    }
  };

  const sendInterest = async () => {
    setSendingInterest(true);
    try {
      const res = await fetch("/api/user/interests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setInterestSent(true);
        toast({
          title: "Interest sent",
          description: "Your interest has been sent successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to send interest",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send interest",
        variant: "destructive",
      });
    } finally {
      setSendingInterest(false);
    }
  };

  const toggleWishlist = async () => {
    setTogglingWishlist(true);
    try {
      if (wishlisted) {
        const res = await fetch(`/api/user/wishlist?profileId=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
        const json = await res.json();
        if (json.success) {
          setWishlisted(false);
          toast({
            title: "Removed from wishlist",
            description: "Profile removed from your wishlist",
            variant: "success",
          });
        } else {
          toast({
            title: "Error",
            description: json.error || "Failed to remove from wishlist",
            variant: "destructive",
          });
        }
      } else {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: id }),
        });
        const json = await res.json();
        if (json.success) {
          setWishlisted(true);
          toast({
            title: "Added to wishlist",
            description: "Profile added to your wishlist",
            variant: "success",
          });
        } else {
          toast({
            title: "Error",
            description: json.error || "Failed to add to wishlist",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setTogglingWishlist(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return;
    try {
      const res = await fetch("/api/user/report", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: id, reason: reportReason }),
      });
      const json = await res.json();
      if (json.success) {
        setReportModalOpen(false);
        setReportReason("");
        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to submit report",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="skeleton h-[400px] rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted">
      Profile not found
    </div>
  );

  const p = profile.profile;
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const photos = profile.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4 text-sm"
        >
          <ChevronLeft size={16} /> Back
        </button>
 {/* Header */}
        <div className="glass p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{p?.fullName || "—"}</h1>
              <div className="flex flex-wrap gap-2 text-muted text-sm mt-1">
                {age && <span>{age} yrs</span>}
                {p?.height && <span>• {cmToFeetInches(p.height)}</span>}
                {p?.maritalStatus && <span>• {p.maritalStatus.replace(/_/g, " ")}</span>}
              </div>
            </div>
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-muted hover:text-red-400 transition-colors"
              title="Report profile"
            >
              <Flag size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
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
            <p className="text-muted text-sm leading-relaxed italic">"{p.aboutMe}"</p>
          )}
        </div>
        {/* Incoming photo request banner — shown to Person B when Person A requested their photos */}
        {pendingPhotoRequestNotifId && (
          <div className="glass border-[rgba(201,151,44,0.3)] p-4 mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(201,151,44,0.12)] flex items-center justify-center shrink-0">
              <ImagePlus size={16} className="text-[#C9972C]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Photo request</p>
              <p className="text-xs text-muted">This member wants to see your photos. Approve to share your gallery.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="gold"
                size="sm"
                onClick={() => handlePhotoRequestAction("APPROVE")}
                loading={actingOnPhotoRequest}
                disabled={actingOnPhotoRequest}
              >
                <Check size={13} /> Approve
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => handlePhotoRequestAction("REJECT")}
                disabled={actingOnPhotoRequest}
              >
                <X size={13} /> Reject
              </Button>
            </div>
          </div>
        )}

        {/* Photo Carousel */}
        <div className="relative aspect-[4/3] glass overflow-hidden rounded-2xl mb-4">
          {photos.length > 0 && (photos[currentPhoto]?.signedUrl || photos[currentPhoto]?.watermarkedUrl || photos[currentPhoto]?.originalUrl) ? (
            <>
              <img
                src={photos[currentPhoto].signedUrl || photos[currentPhoto].watermarkedUrl || photos[currentPhoto].originalUrl}
                alt="Profile"
                className={`w-full h-full object-cover cursor-zoom-in ${!currentUserId ? "blur-xl" : ""}`}
                onClick={() => currentUserId && setLightboxOpen(true)}
              />
              {!currentUserId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                  <Lock size={24} className="text-muted mb-2" />
                  <span className="text-muted text-sm font-medium">Register to view full photos</span>
                  <Link href="/register" className="mt-3 px-4 py-2 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] text-xs font-semibold rounded-lg transition-colors">
                    Create Free Account
                  </Link>
                </div>
              )}
              {currentUserId && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-foreground p-2 rounded-full transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <UserIcon size={32} className="text-muted" />
              <span className="text-muted text-sm">No photo shared</span>
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
          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-foreground p-2 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-foreground p-2 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-foreground text-xs px-2 py-1 rounded-full">
                {currentPhoto + 1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {photos.map((ph, idx) => (
              <button
                key={ph.id}
                onClick={() => setCurrentPhoto(idx)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${currentPhoto === idx ? "border-[#C9972C]" : "border-border"}`}
              >
                <img src={ph.signedUrl || ph.watermarkedUrl || ph.originalUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

       

        {/* Gallery hidden / no photos notice + photo request */}
        {currentUserId && currentUserId !== id && (galleryHidden || hasNoPhotos) && (
          <div className="glass p-4 mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(201,151,44,0.12)] flex items-center justify-center shrink-0">
              <ImageOff size={16} className="text-[#C9972C]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {hasNoPhotos ? "No photos uploaded" : "Photos are private"}
              </p>
              <p className="text-xs text-muted">
                {hasNoPhotos
                  ? "This member hasn't added any photos yet."
                  : "This member has chosen to keep their gallery private."}
              </p>
            </div>
            <Button
              variant={photoRequested ? "glass" : "gold"}
              size="sm"
              onClick={sendPhotoRequest}
              disabled={photoRequested || sendingPhotoRequest}
              loading={sendingPhotoRequest}
            >
              <ImagePlus size={14} />
              {photoRequested ? "Requested" : "Request Photos"}
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="gold"
            className="flex-1"
            onClick={sendInterest}
            disabled={interestSent || sendingInterest || currentUserId === id}
            loading={sendingInterest}
          >
            <Heart size={16} className={interestSent ? "fill-current" : ""} />
            {interestSent ? "Sent" : "Interest"}
          </Button>
          <Button
            variant={wishlisted ? "glass-gold" : "glass"}
            onClick={toggleWishlist}
            disabled={togglingWishlist || currentUserId === id}
            loading={togglingWishlist}
          >
            <Star size={16} className={wishlisted ? "fill-[#C9972C] text-[#C9972C]" : ""} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[
            { id: "basic", label: "Basic", icon: UserIcon },
            { id: "family", label: "Family", icon: Users },
            { id: "horoscope", label: "Horoscope", icon: Calendar },
            { id: "lifestyle", label: "Lifestyle", icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#C9972C] text-[#1a0505]"
                  : "glass text-muted hover:text-foreground"
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {/* Basic Tab */}
          {activeTab === "basic" && (
            <>
              <AccordionSection
                title="Personal Details"
                icon={UserIcon}
                expanded={expandedSections.has("personal")}
                onToggle={() => toggleSection("personal")}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Blood Group" value={p?.bloodGroup} />
                  <Detail label="Physical Status" value={p?.physicalStatus} />
                  <Detail label="Complexion" value={p?.complexion} />
                  <Detail label="Weight" value={p?.weight ? `${p.weight} kg` : null} />
                </div>
              </AccordionSection>
              <AccordionSection
                title="Religion & Community"
                icon={Shield}
                expanded={expandedSections.has("religion")}
                onToggle={() => toggleSection("religion")}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Community" value={p?.community} />
                  <Detail label="Sub Caste" value={p?.subCaste} />
                  <Detail label="Gothram" value={p?.gothram} />
                  <Detail label="Languages" value={p?.languagesKnown?.join(", ") || null} />
                </div>
              </AccordionSection>
              <AccordionSection
                title="Education & Career"
                icon={GraduationCap}
                expanded={expandedSections.has("education")}
                onToggle={() => toggleSection("education")}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Qualification" value={p?.qualification} />
                  <Detail label="University" value={p?.university} />
                  <Detail label="Occupation" value={p?.occupationType} />
                  <Detail label="Employer" value={p?.employerName} />
                  <Detail label="Annual Income" value={p?.annualIncome} />
                  <Detail label="Work Location" value={p?.workCity && p?.workState ? `${p.workCity}, ${p.workState}` : null} />
                </div>
              </AccordionSection>
            </>
          )}

          {/* Family Tab */}
          {activeTab === "family" && p && (
            <AccordionSection
              title="Family Details"
              icon={Users}
              expanded={expandedSections.has("family")}
              onToggle={() => toggleSection("family")}
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Father" value={p.fatherName} />
                <Detail label="Father's Occupation" value={p.fatherOccupation} />
                <Detail label="Mother" value={p.motherName} />
                <Detail label="Mother's Occupation" value={p.motherOccupation} />
                <Detail label="Brothers" value={p.brothersCount !== null ? `${p.brothersCount} (${p.marriedBrothers || 0} married)` : null} />
                <Detail label="Sisters" value={p.sistersCount !== null ? `${p.sistersCount} (${p.marriedSisters || 0} married)` : null} />
                <Detail label="Family Type" value={p.familyType} />
                <Detail label="Family Status" value={p.familyStatus} />
                <Detail label="Family Values" value={p.familyValues} />
              </div>
            </AccordionSection>
          )}

          {/* Horoscope Tab */}
          {activeTab === "horoscope" && (
            <>
              <AccordionSection
                title="Horoscope Details"
                icon={Calendar}
                expanded={expandedSections.has("horoscope")}
                onToggle={() => toggleSection("horoscope")}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Time of Birth" value={p?.timeOfBirth} />
                  <Detail label="Place of Birth" value={p?.placeOfBirth} />
                  <Detail label="Nakshatra" value={p?.nakshatra} />
                  <Detail label="Rashi" value={p?.rashi} />
                  <Detail label="Lagna" value={p?.lagna} />
                  <Detail label="Dosham" value={p?.dosham?.join(", ") || null} />
                  <Detail label="Nadi" value={p?.nadi} />
                  <Detail label="Gana" value={p?.gana} />
                </div>
              </AccordionSection>

              {/* Horoscope Compatibility */}
              {horoscopeMatch && (
                <div className="glass rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-[#C9972C]" />
                    <h3 className="font-semibold text-foreground">Horoscope Compatibility with You</h3>
                  </div>
                  
                  <div className="bg-[rgba(201,151,44,0.1)] border border-[rgba(201,151,44,0.2)] rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-muted text-sm">Match Score</div>
                        <div className="font-display text-3xl font-bold text-[#C9972C]">
                          {horoscopeMatch.finalScore}/{horoscopeMatch.maxScore}
                        </div>
                        <div className="text-muted text-xs mt-1">{horoscopeMatch.percentage}% compatibility</div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        horoscopeMatch.category === "Excellent" ? "bg-emerald-900/50 text-emerald-400" :
                        horoscopeMatch.category === "Good" ? "bg-amber-900/50 text-amber-400" :
                        "bg-red-900/50 text-red-400"
                      }`}>
                        {horoscopeMatch.category}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="text-foreground font-semibold text-sm">Guna Milan Breakdown</h4>
                    {Object.entries(horoscopeMatch.breakdown || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted">{value.score}/{value.max}</span>
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                value.score === value.max ? "bg-emerald-500" :
                                value.score >= value.max / 2 ? "bg-amber-500" :
                                "bg-red-500"
                              }`}
                              style={{ width: `${(value.score / value.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {horoscopeMatch.doshaCheck && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <h4 className="text-foreground font-semibold text-sm mb-2">Dosha Check</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Manglik Dosha</span>
                          <span className={horoscopeMatch.doshaCheck.hasManglikDosha ? "text-red-400" : "text-emerald-400"}>
                            {horoscopeMatch.doshaCheck.hasManglikDosha ? "Present" : "Absent"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Nadi Dosha</span>
                          <span className={horoscopeMatch.doshaCheck.hasNadiDosha ? "text-red-400" : "text-emerald-400"}>
                            {horoscopeMatch.doshaCheck.hasNadiDosha ? "Present" : "Absent"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Bhakoot Dosha</span>
                          <span className={horoscopeMatch.doshaCheck.hasBhakootDosha ? "text-red-400" : "text-emerald-400"}>
                            {horoscopeMatch.doshaCheck.hasBhakootDosha ? "Present" : "Absent"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loadingHoroscopeMatch && (
                <div className="text-center py-4 text-muted text-sm">
                  Calculating horoscope compatibility...
                </div>
              )}

              {!horoscopeMatch && !loadingHoroscopeMatch && currentUserId !== id && (
                <div className="text-center py-4 text-muted text-sm">
                  Horoscope data not available for compatibility check
                </div>
              )}
            </>
          )}

          {/* Lifestyle Tab */}
          {activeTab === "lifestyle" && p && (
            <AccordionSection
              title="Lifestyle"
              icon={Heart}
              expanded={expandedSections.has("lifestyle")}
              onToggle={() => toggleSection("lifestyle")}
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Diet" value={p.diet} />
                <Detail label="Smoking" value={p.smoking} />
                <Detail label="Drinking" value={p.drinking} />
                <Detail label="Fitness" value={p.fitnessLevel} />
                <Detail label="Has Pets" value={p.hasPets !== null ? (p.hasPets ? "Yes" : "No") : null} />
                <Detail label="Pets Details" value={p.petsDetails} />
                <Detail label="Personality" value={p.personalityType} />
                <Detail label="Religious Beliefs" value={p.religiousBeliefs} />
                <Detail label="Future Goals" value={p.futureGoals} full />
                <Detail label="Partner Expectations" value={p.partnerExpectations} full />
              </div>
            </AccordionSection>
          )}
        </div>

        {/* Contact info locked */}
        <div className="glass border-[rgba(201,151,44,0.2)] p-4 mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-muted" />
            <div>
              <div className="text-sm font-medium text-foreground">Contact info locked</div>
              <div className="text-xs text-muted">Upgrade to view phone & email</div>
            </div>
          </div>
          <Button variant="gold" size="sm" asChild>
            <Link href="/dashboard/subscription">Upgrade</Link>
          </Button>
        </div>

        {/* Similar Profiles */}
        {similarProfiles.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Similar Profiles</h2>
            <div className="grid grid-cols-2 gap-3">
              {similarProfiles.map((similar) => {
                const similarAge = similar.dateOfBirth ? calculateAge(similar.dateOfBirth) : null;
                return (
                  <Link key={similar.id} href={`/profile/${similar.id}`} className="block">
                    <div className="glass p-3 hover:bg-white/[0.03] transition-colors">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          {similar.primaryPhotoUrl ? (
                            <img src={similar.primaryPhotoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <Users size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm truncate">{similar.profile?.fullName || "Unknown"}</h3>
                          <div className="text-muted text-xs mt-1">
                            {similarAge ? `${similarAge} yrs` : "—"} • {similar.profile?.city || "—"}
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

      {/* Lightbox */}
      {lightboxOpen && photos.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <img
            src={photos[currentPhoto].signedUrl || photos[currentPhoto].watermarkedUrl || photos[currentPhoto].originalUrl}
            alt="Profile"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-muted hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setReportModalOpen(false)}>
          <div className="bg-background border border-border p-6 rounded-2xl max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-4">Report Profile</h3>
            <textarea
              className="input-glass min-h-[100px] mb-4"
              placeholder="Reason for reporting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => setReportModalOpen(false)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={submitReport} className="flex-1">Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccordionSection({ title, icon: Icon, expanded, onToggle, children }: { title: string; icon: any; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[#C9972C]" />
          <span className="font-medium text-foreground text-sm">{title}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function Detail({ label, value, full = false }: { label: string; value: string | null | undefined; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-muted text-xs mb-0.5">{label}</div>
      <div className="text-muted text-sm">{value || <span className="text-muted italic">Not yet updated</span>}</div>
    </div>
  );
}
