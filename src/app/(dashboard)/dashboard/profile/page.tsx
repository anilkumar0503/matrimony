"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User, Shield, Camera, ArrowRight, Video, VideoOff, X, Pencil, Star, Target, BookOpen, Briefcase, Users, Utensils, Heart, Home, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cmToFeetInches } from "@/lib/utils";

const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"];

interface ProfileData {
  user: {
    id: string;
    status: string;
    gender: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    kycSubmissions: { status: string }[]
  };
  kycStatus: string | null;
  profile: {
    // Basic Personal
    profileCreatedBy: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    fullName: string | null;
    height: number | null;
    weight: number | null;
    bloodGroup: string | null;
    physicalStatus: string | null;
    complexion: string | null;
    aboutMe: string | null;
    maritalStatus: string | null;
    // Contact
    alternatePhone: string | null;
    currentAddress: string | null;
    permanentAddress: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    // Religion & Community
    motherTongue: string | null;
    religion: string | null;
    community: string | null;
    caste: string | null;
    subCaste: string | null;
    gothram: string | null;
    languagesKnown: string[] | null;
    // Horoscope
    timeOfBirth: string | null;
    placeOfBirth: string | null;
    nakshatra: string | null;
    rashi: string | null;
    lagna: string | null;
    dosham: string[] | null;
    nadi: string | null;
    gana: string | null;
    yoni: string | null;
    rajju: string | null;
    mahendra: string | null;
    vedha: string | null;
    dasaDetails: string | null;
    horoscopeNotes: string | null;
    // Education (basic fields)
    qualification: string | null;
    university: string | null;
    // Career (basic fields)
    occupationType: string | null;
    employerName: string | null;
    annualIncome: string | null;
    workCity: string | null;
    workState: string | null;
    // Family
    fatherName: string | null;
    fatherOccupation: string | null;
    fatherIncome: string | null;
    motherName: string | null;
    motherOccupation: string | null;
    brothersCount: number | null;
    marriedBrothers: number | null;
    sistersCount: number | null;
    marriedSisters: number | null;
    familyType: string | null;
    familyStatus: string | null;
    familyValues: string | null;
    // Lifestyle
    diet: string | null;
    smoking: string | null;
    drinking: string | null;
    fitnessLevel: string | null;
    exerciseHabits: string | null;
    sleepSchedule: string | null;
    hasPets: boolean | null;
    petsDetails: string | null;
    // Personality & Values
    personalityType: string | null;
    isIntrovert: boolean | null;
    isExtrovert: boolean | null;
    isFamilyOriented: boolean | null;
    isCareerOriented: boolean | null;
    religiousBeliefs: string | null;
    futureGoals: string | null;
    lifePriorities: string | null;
    partnerExpectations: string | null;
    // Assets
    ownHouse: boolean | null;
    ownFlat: boolean | null;
    agriculturalLand: boolean | null;
    commercialProperty: boolean | null;
    vehicleDetails: string | null;
    investments: string | null;
    familyBusinessDetails: string | null;
    profileCompletionPct: number;
  } | null;
  images: { id: string; originalUrl: string; watermarkedUrl: string | null; signedUrl: string | null; isPrimary: boolean; status: string }[];
  education?: { highestQualification: string | null; degree: string | null; specialization: string | null; collegeName: string | null; universityName: string | null; passingYear: number | null; additionalCerts: string[] | null }[];
  career?: { occupation: string | null; designation: string | null; companyName: string | null; industry: string | null; employmentType: string | null; workLocation: string | null; experience: string | null; annualIncome: string | null; currency: string | null }[];
  interests?: { interest: string; category: string | null }[];
  hobbies?: { hobby: string; category: string | null }[];
  favorites?: { category: string; value: string }[];
  partnerPreferences?: {
    ageMin: number | null; ageMax: number | null; heightMin: number | null; heightMax: number | null;
    maritalStatus: string | null; religion: string | null; caste: string | null; subCaste: string | null; motherTongue: string | null;
    educationPref: string | null; degreePref: string | null; occupationPref: string | null; incomeMin: string | null; incomeMax: string | null;
    countryPref: string | null; statePref: string | null; cityPref: string | null;
    dietPref: string | null; smokingPref: string | null; drinkingPref: string | null;
    doshamPref: string | null; manglikPref: string | null;
  } | null;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const token = () => localStorage.getItem("accessToken");

  const fetchProfile = async () => {
    const res = await fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      setData({
        user: json.data.user,
        profile: json.data.profile,
        images: json.data.images || [],
        education: json.data.education || [],
        career: json.data.career || [],
        interests: json.data.interests || [],
        hobbies: json.data.hobbies || [],
        favorites: json.data.favorites || [],
        partnerPreferences: json.data.partnerPreferences || null,
        kycStatus: json.data.kycStatus || null,
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    const handleFocus = () => fetchProfile();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 640 } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      // Wait for the modal to render before assigning srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error("Video play error:", err));
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      setImgError("Camera access denied. Please allow camera access.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            setCapturedBlob(blob);
            setCapturedPreviewUrl(previewUrl);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const confirmUpload = async () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], "selfie.jpg", { type: "image/jpeg" });
    await uploadImage(file, data?.images.length === 0);
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
  };

  const discardCapture = () => {
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
  };

  const uploadImage = async (file: File, isPrimary: boolean) => {
    setImgError("");
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", isPrimary ? "PRIMARY" : "GALLERY");
      fd.append("setPrimary", String(isPrimary));
      const res = await fetch("/api/user/profile/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const json = await res.json();
      if (!json.success) { setImgError(json.error); return; }
      fetchProfile();
    } finally {
      setImgUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}</div>;
  if (!data) return null;

  const { user, profile, images, education, career, interests, hobbies, favorites, partnerPreferences } = data;
  const isKyc = user.kycSubmissions?.[0]?.status === "APPROVED";
  const completionPct = profile?.profileCompletionPct || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">My Profile</h1>
          <p className="text-muted text-sm">{completionPct}% complete</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" asChild>
            <Link href={`/profile/${data?.user?.id}`}>
              <Eye size={14} /> View Public Profile
            </Link>
          </Button>
          <Button variant="glass-gold" size="sm" asChild>
            <Link href="/dashboard/profile-setup">
              <Pencil size={14} /> Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-muted text-xs">Profile Completion</span>
            <span className="text-[#E8C76A] text-xs font-semibold">{completionPct}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#f78222] to-[#E8C76A] rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
        {!isKyc && (
          <Button variant="glass" size="sm" asChild>
            <Link href="/dashboard/profile/kyc"><Shield size={13} /> Verify KYC <ArrowRight size={13} /></Link>
          </Button>
        )}
        {isKyc && <Badge variant="success"><Shield size={10} /> KYC Verified</Badge>}
      </div>

      {/* Photos */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Camera size={16} className="text-[#f78222]" /> Profile Photos</h3>
          <Button
            variant="glass"
            size="sm"
            onClick={startCamera}
            loading={imgUploading}
            disabled={data?.kycStatus === "APPROVED"}
            title={data?.kycStatus === "APPROVED" ? "KYC already verified" : undefined}
          >
            <Camera size={14} /> Take Selfie
          </Button>
        </div>
        {imgError && <p className="text-red-400 text-xs mb-3">{imgError}</p>}
        {images.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <User size={32} className="text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">No photos yet</p>
            <p className="text-muted text-xs mt-1">Photos are reviewed by our team before being visible</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                <img src={img.signedUrl || img.watermarkedUrl || img.originalUrl} alt="" className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <div className="absolute top-1 left-1 bg-[rgba(201,151,44,0.9)] text-[#ffffff] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    Primary
                  </div>
                )}
                <div className="absolute bottom-1 right-1">
                  <Badge variant={img.status === "APPROVED" ? "success" : img.status === "REJECTED" ? "danger" : "warning"} className="text-[9px]">
                    {img.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Take Selfie</h3>
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                <X size={16} />
              </Button>
            </div>
            <div className="relative aspect-square bg-black rounded-xl overflow-hidden mb-4">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <Button variant="glass" size="sm" onClick={stopCamera} className="flex-1">
                <VideoOff size={14} className="mr-2" /> Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={capturePhoto} className="flex-1">
                <Camera size={14} className="mr-2" /> Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Captured Photo Preview & Confirm Replace */}
      {capturedPreviewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Review Photo</h3>
              <button onClick={discardCapture} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-border">
              <img src={capturedPreviewUrl} alt="Captured selfie" className="w-full h-full object-cover" />
            </div>

            {images.some(img => img.status === "PENDING") && (
              <div className="glass-dark p-3 rounded-xl mb-4 text-xs text-amber-300 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>You already have a photo pending admin review. Uploading this will replace it.</span>
              </div>
            )}

            {images.some(img => img.status === "APPROVED") && (
              <div className="glass-dark p-3 rounded-xl mb-4 text-xs text-muted flex items-start gap-2">
                <span className="shrink-0 mt-0.5">ℹ️</span>
                <span>This photo will be added alongside your approved photos and reviewed by our team.</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="glass" onClick={() => { discardCapture(); startCamera(); }} className="flex-1">
                <Camera size={14} /> Retake
              </Button>
              <Button variant="gold" onClick={confirmUpload} loading={imgUploading} className="flex-1">
                Upload Photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile details - Section 1: Basic Personal Information */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <User size={16} className="text-[#f78222]" /> Basic Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Profile Created By", value: profile?.profileCreatedBy },
            { label: "First Name", value: profile?.firstName },
            { label: "Middle Name", value: profile?.middleName },
            { label: "Last Name", value: profile?.lastName },
            { label: "Full Name", value: profile?.fullName },
            { label: "Gender", value: user.gender },
            { label: "Date of Birth", value: user.dateOfBirth },
            { label: "Age", value: user.dateOfBirth ? calculateAge(user.dateOfBirth) + " years" : "—" },
            { label: "Marital Status", value: profile?.maritalStatus },
            { label: "Height", value: profile?.height ? `${profile.height} cm (${cmToFeetInches(profile.height)})` : "—" },
            { label: "Weight", value: profile?.weight ? `${profile.weight} kg` : "—" },
            { label: "Blood Group", value: profile?.bloodGroup },
            { label: "Physical Status", value: profile?.physicalStatus },
            { label: "Complexion", value: profile?.complexion },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
            </div>
          ))}
          {profile?.aboutMe && (
            <div className="sm:col-span-2">
              <div className="text-muted text-xs">About Me</div>
              <div className="text-muted text-sm mt-0.5 leading-relaxed">{profile.aboutMe}</div>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Contact Information */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Shield size={16} className="text-[#f78222]" /> Contact Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Mobile Number", value: user.phone },
            { label: "Alternate Mobile", value: profile?.alternatePhone },
            { label: "Email Address", value: user.email },
            { label: "Current Address", value: profile?.currentAddress },
            { label: "Permanent Address", value: profile?.permanentAddress },
            { label: "City", value: profile?.city },
            { label: "State", value: profile?.state },
            { label: "Country", value: profile?.country },
            { label: "Postal Code", value: profile?.postalCode },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Religion & Community */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Star size={16} className="text-[#f78222]" /> Religion & Community Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Religion", value: profile?.religion },
            { label: "Community", value: profile?.community },
            { label: "Caste", value: profile?.caste },
            { label: "Sub Caste", value: profile?.subCaste },
            { label: "Gothram", value: profile?.gothram },
            { label: "Mother Tongue", value: profile?.motherTongue },
            { label: "Languages Known", value: profile?.languagesKnown?.join(", ") },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Horoscope / Astrology */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Target size={16} className="text-[#f78222]" /> Horoscope / Astrology Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Time of Birth", value: profile?.timeOfBirth },
            { label: "Place of Birth", value: profile?.placeOfBirth },
            { label: "Rashi", value: profile?.rashi },
            { label: "Nakshatra", value: profile?.nakshatra },
            { label: "Lagna", value: profile?.lagna },
            { label: "Nadi", value: profile?.nadi },
            { label: "Gana", value: profile?.gana },
            { label: "Yoni", value: profile?.yoni },
            { label: "Rajju", value: profile?.rajju },
            { label: "Mahendra", value: profile?.mahendra },
            { label: "Vedha", value: profile?.vedha },
            { label: "Dosham", value: profile?.dosham?.join(", ") },
            { label: "Dasa Details", value: profile?.dasaDetails },
            { label: "Horoscope Notes", value: profile?.horoscopeNotes },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Education */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <BookOpen size={16} className="text-[#f78222]" /> Education Details
        </h3>
        {education && education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg">
                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { label: "Highest Qualification", value: edu.highestQualification },
                    { label: "Degree", value: edu.degree },
                    { label: "Specialization", value: edu.specialization },
                    { label: "College Name", value: edu.collegeName },
                    { label: "University Name", value: edu.universityName },
                    { label: "Passing Year", value: edu.passingYear },
                    { label: "Additional Certifications", value: edu.additionalCerts?.join(", ") },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-muted text-xs">{label}</div>
                      <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
            {[
              { label: "Qualification", value: profile?.qualification },
              { label: "University", value: profile?.university },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-muted text-xs">{label}</div>
                <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 6: Professional Details */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Briefcase size={16} className="text-[#f78222]" /> Professional Details
        </h3>
        {career && career.length > 0 ? (
          <div className="space-y-4">
            {career.map((car: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg">
                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { label: "Occupation", value: car.occupation },
                    { label: "Designation", value: car.designation },
                    { label: "Company Name", value: car.companyName },
                    { label: "Industry", value: car.industry },
                    { label: "Employment Type", value: car.employmentType },
                    { label: "Work Location", value: car.workLocation },
                    { label: "Experience", value: car.experience },
                    { label: "Annual Income", value: car.annualIncome },
                    { label: "Currency", value: car.currency },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-muted text-xs">{label}</div>
                      <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
            {[
              { label: "Occupation Type", value: profile?.occupationType },
              { label: "Employer Name", value: profile?.employerName },
              { label: "Annual Income", value: profile?.annualIncome },
              { label: "Work City", value: profile?.workCity },
              { label: "Work State", value: profile?.workState },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-muted text-xs">{label}</div>
                <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 7: Family Details */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Users size={16} className="text-[#f78222]" /> Family Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Father's Name", value: profile?.fatherName },
            { label: "Father's Occupation", value: profile?.fatherOccupation },
            { label: "Father's Income", value: profile?.fatherIncome },
            { label: "Mother's Name", value: profile?.motherName },
            { label: "Mother's Occupation", value: profile?.motherOccupation },
            { label: "Number of Brothers", value: profile?.brothersCount },
            { label: "Married Brothers", value: profile?.marriedBrothers },
            { label: "Number of Sisters", value: profile?.sistersCount },
            { label: "Married Sisters", value: profile?.marriedSisters },
            { label: "Family Type", value: profile?.familyType },
            { label: "Family Status", value: profile?.familyStatus },
            { label: "Family Values", value: profile?.familyValues },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value !== null && value !== undefined ? value : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 8: Lifestyle */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Utensils size={16} className="text-[#f78222]" /> Lifestyle Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Diet Preference", value: profile?.diet },
            { label: "Smoking Habit", value: profile?.smoking },
            { label: "Drinking Habit", value: profile?.drinking },
            { label: "Fitness Level", value: profile?.fitnessLevel },
            { label: "Exercise Habits", value: profile?.exerciseHabits },
            { label: "Sleep Schedule", value: profile?.sleepSchedule },
            { label: "Have Pets", value: profile?.hasPets ? "Yes" : "No" },
            { label: "Pets Details", value: profile?.petsDetails },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value !== null && value !== undefined ? value : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 9: Interests */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Heart size={16} className="text-[#f78222]" /> Interests
        </h3>
        {interests && interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((item: any, idx: number) => (
              <Badge key={idx} variant="glass" className="text-xs">{item.interest}</Badge>
            ))}
          </div>
        ) : (
          <div className="text-muted text-sm">No interests added</div>
        )}
      </div>

      {/* Section 10: Hobbies */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Star size={16} className="text-[#f78222]" /> Hobbies
        </h3>
        {hobbies && hobbies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hobbies.map((item: any, idx: number) => (
              <Badge key={idx} variant="glass" className="text-xs">{item.hobby}</Badge>
            ))}
          </div>
        ) : (
          <div className="text-muted text-sm">No hobbies added</div>
        )}
      </div>

      {/* Section 11: Favorites */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Heart size={16} className="text-[#f78222]" /> Favorites
        </h3>
        {favorites && favorites.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
            {favorites.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="text-muted text-xs">{item.category}</div>
                <div className="text-muted text-sm mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted text-sm">No favorites added</div>
        )}
      </div>

      {/* Section 12: Personality & Values */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <User size={16} className="text-[#f78222]" /> Personality & Values
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Personality Type", value: profile?.personalityType },
            { label: "Introvert", value: profile?.isIntrovert ? "Yes" : "No" },
            { label: "Extrovert", value: profile?.isExtrovert ? "Yes" : "No" },
            { label: "Family Oriented", value: profile?.isFamilyOriented ? "Yes" : "No" },
            { label: "Career Oriented", value: profile?.isCareerOriented ? "Yes" : "No" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value !== null && value !== undefined ? value : "—"}</div>
            </div>
          ))}
          {[
            { label: "Religious Beliefs", value: profile?.religiousBeliefs },
            { label: "Future Goals", value: profile?.futureGoals },
            { label: "Life Priorities", value: profile?.lifePriorities },
            { label: "Partner Expectations", value: profile?.partnerExpectations },
          ].map(({ label, value }) => (
            <div key={label} className="sm:col-span-2">
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5 leading-relaxed">{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 13: Assets */}
      <div className="glass p-6">
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Home size={16} className="text-[#f78222]" /> Assets & Financial Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
          {[
            { label: "Own House", value: profile?.ownHouse ? "Yes" : "No" },
            { label: "Own Flat", value: profile?.ownFlat ? "Yes" : "No" },
            { label: "Agricultural Land", value: profile?.agriculturalLand ? "Yes" : "No" },
            { label: "Commercial Property", value: profile?.commercialProperty ? "Yes" : "No" },
            { label: "Vehicle Details", value: profile?.vehicleDetails },
            { label: "Investments", value: profile?.investments },
            { label: "Family Business Details", value: profile?.familyBusinessDetails },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs">{label}</div>
              <div className="text-muted text-sm mt-0.5">{value !== null && value !== undefined ? value : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 14: Partner Preferences */}
      {partnerPreferences && (
        <div className="glass p-6">
          <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
            <Heart size={16} className="text-[#f78222]" /> Partner Preferences
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
            {[
              { label: "Age Range", value: partnerPreferences.ageMin && partnerPreferences.ageMax ? `${partnerPreferences.ageMin} - ${partnerPreferences.ageMax}` : "—" },
              { label: "Height Range", value: partnerPreferences.heightMin && partnerPreferences.heightMax ? `${partnerPreferences.heightMin} - ${partnerPreferences.heightMax} cm` : "—" },
              { label: "Preferred Marital Status", value: partnerPreferences.maritalStatus },
              { label: "Preferred Religion", value: partnerPreferences.religion },
              { label: "Preferred Caste", value: partnerPreferences.caste },
              { label: "Preferred Sub Caste", value: partnerPreferences.subCaste },
              { label: "Preferred Mother Tongue", value: partnerPreferences.motherTongue },
              { label: "Education Preference", value: partnerPreferences.educationPref },
              { label: "Degree Preference", value: partnerPreferences.degreePref },
              { label: "Occupation Preference", value: partnerPreferences.occupationPref },
              { label: "Income Range", value: partnerPreferences.incomeMin && partnerPreferences.incomeMax ? `${partnerPreferences.incomeMin} - ${partnerPreferences.incomeMax}` : "—" },
              { label: "Country Preference", value: partnerPreferences.countryPref },
              { label: "State Preference", value: partnerPreferences.statePref },
              { label: "City Preference", value: partnerPreferences.cityPref },
              { label: "Diet Preference", value: partnerPreferences.dietPref },
              { label: "Smoking Preference", value: partnerPreferences.smokingPref },
              { label: "Drinking Preference", value: partnerPreferences.drinkingPref },
              { label: "Dosham Preference", value: partnerPreferences.doshamPref },
              { label: "Manglik Preference", value: partnerPreferences.manglikPref },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-muted text-xs">{label}</div>
                <div className="text-muted text-sm mt-0.5">{value || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
