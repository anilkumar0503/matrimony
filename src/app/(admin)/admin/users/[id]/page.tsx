"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, UserCheck, UserX, Trash2, LogOut, Shield,
  Image, CreditCard, Bell, CheckCircle, XCircle, AlertTriangle, Edit2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatDateTime, formatDate } from "@/lib/utils";
import { generateProfilePDF } from "@/lib/generate-profile-pdf";

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
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Profile edit modal
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState<Record<string, any>>({});
  const [savingProfile, setSavingProfile] = useState(false);

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

  const openProfileEdit = () => {
    if (user?.profile) {
      setProfileForm(user.profile);
    }
    setShowProfileEdit(true);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      // Filter out null and undefined values
      const cleanData: Record<string, any> = {};
      for (const [key, value] of Object.entries(profileForm)) {
        if (value !== null && value !== undefined && value !== "") {
          cleanData[key] = value;
        }
      }
      
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });
      const json = await res.json();
      if (json.success) {
        setShowProfileEdit(false);
        fetchUser();
      } else {
        alert(json.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!user) return;
    setGeneratingPDF(true);
    try {
      // Fetch approved images with signed URLs from admin images API
      const res = await fetch(`/api/admin/images?status=APPROVED&limit=100`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      
      const imageUrls: string[] = [];
      if (json.success && json.images) {
        const userImages = json.images.filter((i: any) => i.user.id === user.id);
        for (const img of userImages) {
          if (img.signedUrl) {
            imageUrls.push(img.signedUrl);
          }
        }
      }
      
      console.log(`Generating PDF with ${imageUrls.length} images`);
      await generateProfilePDF(user, imageUrls);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32" />)}</div>;
  if (!user) return <div className="text-muted">User not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft size={18} /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{user.profile?.fullName || "Unknown User"}</h1>
          <p className="text-muted text-xs">{user.email} · ID: {user.id.slice(0, 8)}…</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <Button variant="glass" size="sm" onClick={handleDownloadPDF} loading={generatingPDF}>
            <Download size={14} /> Download PDF
          </Button>
          <Button variant="glass" size="sm" onClick={openProfileEdit}>
            <Edit2 size={14} /> Edit Profile
          </Button>
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
        <span className="text-muted text-xs">{user.gender} · {user.dateOfBirth ? calculateAge(user.dateOfBirth) + " yrs" : "—"}</span>
        <span className="text-muted text-xs">Joined {formatDate(user.createdAt)}</span>
        <span className="text-muted text-xs">{user.profile?.city}, {user.profile?.state}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted text-xs">Profile {user.profile?.profileCompletionPct || 0}% complete</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#f78222] to-[#E8C76A] rounded-full" style={{ width: `${user.profile?.profileCompletionPct || 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Profile */}
        <div className="glass p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">Profile Details</h3>
          <div className="space-y-2">
            {[
              { l: "Religion", v: user.profile?.religion },
              { l: "Caste", v: user.profile?.caste },
              { l: "Qualification", v: user.profile?.qualification },
              { l: "Occupation", v: user.profile?.occupationType },
              { l: "Phone", v: user.phone },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-muted">{l}</span>
                <span className="text-muted">{v || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KYC */}
        <div className="glass p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <Shield size={14} className="text-[#f78222]" /> KYC Submissions
          </h3>
          {user.kycSubmissions.length === 0 ? (
            <p className="text-muted text-xs">No KYC submissions</p>
          ) : user.kycSubmissions.map((kyc) => (
            <div key={kyc.id} className="flex items-center justify-between mb-2">
              <div>
                <Badge variant={kyc.status === "APPROVED" ? "success" : kyc.status === "REJECTED" ? "danger" : "warning"}>
                  {kyc.status}
                </Badge>
                <span className="ml-2 text-muted text-xs">{kyc.mode || "Mode A"} · Attempt #{kyc.attempts}</span>
              </div>
              <span className="text-muted text-xs">{formatDate(kyc.createdAt)}</span>
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
          <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <CreditCard size={14} className="text-[#f78222]" /> Subscription
          </h3>
          {user.subscriptions.length === 0 ? (
            <p className="text-muted text-xs">Free plan</p>
          ) : user.subscriptions.map((sub, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <span className="text-muted text-sm font-medium">{sub.plan.name}</span>
                <Badge variant={sub.status === "ACTIVE" ? "success" : "glass"} className="ml-2 text-[10px]">{sub.status}</Badge>
              </div>
              <span className="text-muted text-xs">Until {formatDate(sub.endDate)}</span>
            </div>
          ))}
        </div>

        {/* Images */}
        <div className="glass p-5">
          <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <Image size={14} className="text-[#f78222]" /> Images ({user.images.length})
          </h3>
          {user.images.length === 0 ? (
            <p className="text-muted text-xs">No images uploaded</p>
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
          <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
            <Bell size={14} className="text-[#f78222]" /> Recent Activity
          </h3>
          <div className="space-y-2">
            {user.auditLogs?.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs border-b border-border pb-2 last:border-0">
                <span className="text-muted">{log.action}</span>
                <div className="text-right">
                  <div className="text-muted">{formatDateTime(log.createdAt)}</div>
                  {log.ipAddress && <div className="text-muted">{log.ipAddress}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="bg-background border border-border p-6 rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-4">
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

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowProfileEdit(false)}>
          <div className="bg-background border border-border p-6 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-4">Edit Complete Profile</h3>
            
            <div className="space-y-6">
              {/* Basic Personal Information */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Basic Personal Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Full Name</label>
                    <input className="input-glass w-full" value={profileForm.fullName || ""} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Marital Status</label>
                    <select className="input-glass w-full" value={profileForm.maritalStatus || ""} onChange={(e) => setProfileForm({...profileForm, maritalStatus: e.target.value})}>
                      <option value="">Select</option>
                      <option value="NEVER_MARRIED">Never Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Height (cm)</label>
                    <input type="number" className="input-glass w-full" value={profileForm.height || ""} onChange={(e) => setProfileForm({...profileForm, height: parseInt(e.target.value) || null})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Weight (kg)</label>
                    <input type="number" className="input-glass w-full" value={profileForm.weight || ""} onChange={(e) => setProfileForm({...profileForm, weight: parseInt(e.target.value) || null})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Blood Group</label>
                    <select className="input-glass w-full" value={profileForm.bloodGroup || ""} onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})}>
                      <option value="">Select</option>
                      <option value="A_POSITIVE">A+</option>
                      <option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option>
                      <option value="B_NEGATIVE">B-</option>
                      <option value="AB_POSITIVE">AB+</option>
                      <option value="AB_NEGATIVE">AB-</option>
                      <option value="O_POSITIVE">O+</option>
                      <option value="O_NEGATIVE">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Physical Status</label>
                    <select className="input-glass w-full" value={profileForm.physicalStatus || ""} onChange={(e) => setProfileForm({...profileForm, physicalStatus: e.target.value})}>
                      <option value="">Select</option>
                      <option value="NORMAL">Normal</option>
                      <option value="PHYSICALLY_CHALLENGED">Physically Challenged</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-muted mb-1">About Me</label>
                    <textarea className="input-glass w-full min-h-[60px]" value={profileForm.aboutMe || ""} onChange={(e) => setProfileForm({...profileForm, aboutMe: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Alternate Phone</label>
                    <input className="input-glass w-full" value={profileForm.alternatePhone || ""} onChange={(e) => setProfileForm({...profileForm, alternatePhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">City</label>
                    <input className="input-glass w-full" value={profileForm.city || ""} onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">State</label>
                    <input className="input-glass w-full" value={profileForm.state || ""} onChange={(e) => setProfileForm({...profileForm, state: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Country</label>
                    <input className="input-glass w-full" value={profileForm.country || ""} onChange={(e) => setProfileForm({...profileForm, country: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Postal Code</label>
                    <input className="input-glass w-full" value={profileForm.postalCode || ""} onChange={(e) => setProfileForm({...profileForm, postalCode: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-muted mb-1">Current Address</label>
                    <textarea className="input-glass w-full min-h-[60px]" value={profileForm.currentAddress || ""} onChange={(e) => setProfileForm({...profileForm, currentAddress: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Religion & Community */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Religion & Community</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Religion</label>
                    <input className="input-glass w-full" value={profileForm.religion || ""} onChange={(e) => setProfileForm({...profileForm, religion: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Caste</label>
                    <input className="input-glass w-full" value={profileForm.caste || ""} onChange={(e) => setProfileForm({...profileForm, caste: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Sub Caste</label>
                    <input className="input-glass w-full" value={profileForm.subCaste || ""} onChange={(e) => setProfileForm({...profileForm, subCaste: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Mother Tongue</label>
                    <input className="input-glass w-full" value={profileForm.motherTongue || ""} onChange={(e) => setProfileForm({...profileForm, motherTongue: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Gothram</label>
                    <input className="input-glass w-full" value={profileForm.gothram || ""} onChange={(e) => setProfileForm({...profileForm, gothram: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Education & Professional */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Education & Professional</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Qualification</label>
                    <input className="input-glass w-full" value={profileForm.qualification || ""} onChange={(e) => setProfileForm({...profileForm, qualification: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">University</label>
                    <input className="input-glass w-full" value={profileForm.university || ""} onChange={(e) => setProfileForm({...profileForm, university: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Occupation Type</label>
                    <input className="input-glass w-full" value={profileForm.occupationType || ""} onChange={(e) => setProfileForm({...profileForm, occupationType: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Employer Name</label>
                    <input className="input-glass w-full" value={profileForm.employerName || ""} onChange={(e) => setProfileForm({...profileForm, employerName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Annual Income</label>
                    <input className="input-glass w-full" value={profileForm.annualIncome || ""} onChange={(e) => setProfileForm({...profileForm, annualIncome: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Work City</label>
                    <input className="input-glass w-full" value={profileForm.workCity || ""} onChange={(e) => setProfileForm({...profileForm, workCity: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Work State</label>
                    <input className="input-glass w-full" value={profileForm.workState || ""} onChange={(e) => setProfileForm({...profileForm, workState: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Family Details */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Family Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Father Name</label>
                    <input className="input-glass w-full" value={profileForm.fatherName || ""} onChange={(e) => setProfileForm({...profileForm, fatherName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Father Occupation</label>
                    <input className="input-glass w-full" value={profileForm.fatherOccupation || ""} onChange={(e) => setProfileForm({...profileForm, fatherOccupation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Mother Name</label>
                    <input className="input-glass w-full" value={profileForm.motherName || ""} onChange={(e) => setProfileForm({...profileForm, motherName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Mother Occupation</label>
                    <input className="input-glass w-full" value={profileForm.motherOccupation || ""} onChange={(e) => setProfileForm({...profileForm, motherOccupation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Brothers</label>
                    <input type="number" className="input-glass w-full" value={profileForm.brothersCount || ""} onChange={(e) => setProfileForm({...profileForm, brothersCount: parseInt(e.target.value) || null})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Married Brothers</label>
                    <input type="number" className="input-glass w-full" value={profileForm.marriedBrothers || ""} onChange={(e) => setProfileForm({...profileForm, marriedBrothers: parseInt(e.target.value) || null})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Sisters</label>
                    <input type="number" className="input-glass w-full" value={profileForm.sistersCount || ""} onChange={(e) => setProfileForm({...profileForm, sistersCount: parseInt(e.target.value) || null})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Married Sisters</label>
                    <input type="number" className="input-glass w-full" value={profileForm.marriedSisters || ""} onChange={(e) => setProfileForm({...profileForm, marriedSisters: parseInt(e.target.value) || null})} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Family Type</label>
                    <select className="input-glass w-full" value={profileForm.familyType || ""} onChange={(e) => setProfileForm({...profileForm, familyType: e.target.value})}>
                      <option value="">Select</option>
                      <option value="JOINT">Joint</option>
                      <option value="NUCLEAR">Nuclear</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Family Status</label>
                    <select className="input-glass w-full" value={profileForm.familyStatus || ""} onChange={(e) => setProfileForm({...profileForm, familyStatus: e.target.value})}>
                      <option value="">Select</option>
                      <option value="MIDDLE_CLASS">Middle Class</option>
                      <option value="UPPER_MIDDLE">Upper Middle</option>
                      <option value="HIGH_CLASS">High Class</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lifestyle */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Lifestyle</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Diet</label>
                    <select className="input-glass w-full" value={profileForm.diet || ""} onChange={(e) => setProfileForm({...profileForm, diet: e.target.value})}>
                      <option value="">Select</option>
                      <option value="VEGETARIAN">Vegetarian</option>
                      <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                      <option value="EGGETARIAN">Eggetarian</option>
                      <option value="VEGAN">Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Smoking</label>
                    <select className="input-glass w-full" value={profileForm.smoking || ""} onChange={(e) => setProfileForm({...profileForm, smoking: e.target.value})}>
                      <option value="">Select</option>
                      <option value="NEVER">Never</option>
                      <option value="OCCASIONALLY">Occasionally</option>
                      <option value="REGULARLY">Regularly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Drinking</label>
                    <select className="input-glass w-full" value={profileForm.drinking || ""} onChange={(e) => setProfileForm({...profileForm, drinking: e.target.value})}>
                      <option value="">Select</option>
                      <option value="NEVER">Never</option>
                      <option value="OCCASIONALLY">Occasionally</option>
                      <option value="REGULARLY">Regularly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Partner Expectations */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Partner Expectations</h4>
                <div>
                  <label className="block text-xs text-muted mb-1">What you're looking for</label>
                  <textarea className="input-glass w-full min-h-[80px]" value={profileForm.partnerExpectations || ""} onChange={(e) => setProfileForm({...profileForm, partnerExpectations: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="glass" onClick={() => setShowProfileEdit(false)} className="flex-1">Cancel</Button>
              <Button variant="gold" onClick={saveProfile} loading={savingProfile} className="flex-1">Save Profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
