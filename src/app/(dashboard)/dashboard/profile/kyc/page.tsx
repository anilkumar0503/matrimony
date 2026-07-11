"use client";
import { useEffect, useState, useRef } from "react";
import { Shield, Camera, FileText, CheckCircle, Clock, XCircle, Upload, AlertTriangle, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface KycData {
  id: string;
  status: string;
  mode: string | null;
  verificationCode: string | null;
  codeExpiresAt: string | null;
  attempts: number;
  rejectionReason: string | null;
  rejectionNotes: string | null;
  createdAt: string;
  selfieUrl?: string | null;
  documentUrl?: string | null;
}

export default function KycPage() {
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [config, setConfig] = useState({ modeBEnabled: false, modeCEnabled: false });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [uploading, setUploading] = useState<"selfie" | "id" | null>(null);
  const [uploaded, setUploaded] = useState({ selfie: false, id: false });
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const token = () => localStorage.getItem("accessToken");

  const fetchKyc = async () => {
    const res = await fetch("/api/user/kyc", { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) { setKyc(json.data.kyc); setConfig(json.data.config); }
    setLoading(false);
  };

  useEffect(() => { fetchKyc(); }, []);

  const requestCode = async () => {
    setRequesting(true);
    try {
      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) fetchKyc();
    } finally {
      setRequesting(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 640 } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      // Wait for the modal to render before setting the video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error("Video play error:", err));
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access denied. Please allow camera access.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "kyc-selfie.jpg", { type: "image/jpeg" });
            await uploadFile(file, "selfie");
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const uploadFile = async (file: File, type: "selfie" | "id") => {
    if (!kyc) return;
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("kycId", kyc.id);

      const res = await fetch("/api/user/kyc/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) { setUploaded((prev) => ({ ...prev, [type]: true })); fetchKyc(); }
    } finally {
      setUploading(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const statusConfig = {
    APPROVED: { icon: CheckCircle, color: "text-emerald-400", variant: "success" as const, label: "KYC Verified" },
    PENDING: { icon: Clock, color: "text-amber-400", variant: "warning" as const, label: "Under Review" },
    REJECTED: { icon: XCircle, color: "text-red-400", variant: "danger" as const, label: "Rejected — Resubmit" },
    SUBMITTED: { icon: Clock, color: "text-blue-400", variant: "info" as const, label: "Submitted" },
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>;

  const approved = kyc?.status === "APPROVED";
  const sc = kyc ? (statusConfig[kyc.status as keyof typeof statusConfig] || statusConfig.PENDING) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
          <Shield size={22} className="text-[#f78222]" /> KYC Verification
        </h1>
        <p className="text-muted text-sm">Verify your identity to activate your profile</p>
      </div>

      {/* Status card */}
      {kyc && sc && (
        <div className={`glass p-5 flex items-center justify-between gap-4 ${approved ? "border-emerald-700/30" : ""}`}>
          <div className="flex items-center gap-3">
            <sc.icon size={22} className={sc.color} />
            <div>
              <div className="font-medium text-foreground">{sc.label}</div>
              <div className="text-muted text-xs">Submitted {formatDateTime(kyc.createdAt)} · Attempt #{kyc.attempts}</div>
            </div>
          </div>
          <Badge variant={sc.variant}>{kyc.status}</Badge>
        </div>
      )}

      {/* Rejected — show reason */}
      {kyc?.status === "REJECTED" && (
        <div className="glass border-red-700/30 bg-red-900/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-foreground mb-1">Rejection Reason</div>
              <div className="text-muted text-sm">{kyc.rejectionReason?.replace(/_/g, " ") || "—"}</div>
              {kyc.rejectionNotes && <div className="text-muted text-xs mt-1">{kyc.rejectionNotes}</div>}
              <div className="text-muted text-xs mt-2">You can resubmit up to {3 - kyc.attempts} more time(s).</div>
            </div>
          </div>
        </div>
      )}

      {/* Approved */}
      {approved && (
        <div className="glass border-emerald-700/30 bg-emerald-900/10 p-8 text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
          <div className="font-display text-xl font-bold text-foreground mb-2">Identity Verified!</div>
          <div className="text-muted text-sm">Your profile is now KYC-verified and visible to other members.</div>
        </div>
      )}

      {/* Mode A — selfie with code */}
      {!approved && (
        <div className="glass p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Camera size={18} className="text-[#f78222]" />
            <h3 className="font-semibold text-foreground">Mode A — Selfie with Code</h3>
            <Badge variant="gold" className="text-[10px]">Recommended</Badge>
          </div>

          <div className="bg-[rgba(201,151,44,0.05)] border border-[rgba(201,151,44,0.15)] rounded-xl p-4">
            <ol className="text-muted text-sm space-y-2">
              <li className="flex gap-2"><span className="text-[#f78222] font-bold">1.</span> Get your verification code below</li>
              <li className="flex gap-2"><span className="text-[#f78222] font-bold">2.</span> Write the code clearly on plain white paper</li>
              <li className="flex gap-2"><span className="text-[#f78222] font-bold">3.</span> Take a selfie holding the paper — face and code must be clearly visible</li>
              <li className="flex gap-2"><span className="text-[#f78222] font-bold">4.</span> Capture the selfie using camera below</li>
            </ol>
          </div>

          {/* Verification code */}
          {kyc?.verificationCode ? (
            <div>
              <div className="text-muted text-xs mb-2">Your Verification Code</div>
              <div className="glass-gold p-4 text-center">
                <div className="font-mono text-3xl font-bold tracking-[0.5rem] text-[#E8C76A]">{kyc.verificationCode}</div>
                {kyc.codeExpiresAt && (
                  <div className="text-muted text-xs mt-2">
                    Valid until {formatDateTime(kyc.codeExpiresAt)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button variant="gold" onClick={requestCode} loading={requesting} className="w-full">
              Generate Verification Code
            </Button>
          )}

          {/* Capture selfie */}
          {kyc?.verificationCode && (
            <div className="space-y-3">
              <div className="text-muted text-xs">Capture Selfie with Code</div>
              {kyc.selfieUrl ? (
                <div className="relative">
                  <img 
                    src={kyc.selfieUrl} 
                    alt="Selfie with verification code" 
                    className="w-full aspect-square object-cover rounded-xl border-2 border-emerald-600/60"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                    <CheckCircle size={16} className="text-foreground" />
                  </div>
                </div>
              ) : (
                <Button
                  variant="glass"
                  onClick={startCamera}
                  loading={uploading === "selfie"}
                  className="w-full border-2 border-dashed h-24"
                >
                  {uploading === "selfie" ? (
                    <span className="text-muted text-sm">Uploading...</span>
                  ) : (
                    <span className="space-y-1">
                      <Camera size={24} className="text-muted mx-auto" />
                      <div className="text-muted text-sm">Click to capture selfie with code</div>
                      <div className="text-muted text-xs">Use device camera</div>
                    </span>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Capture Selfie with Code</h3>
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                <XCircle size={16} />
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
              <Button variant="gold" size="sm" onClick={captureSelfie} className="flex-1">
                <Camera size={14} className="mr-2" /> Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mode B — ID document */}
      {!approved && config.modeBEnabled && (
        <div className="glass p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-[#f78222]" />
            <h3 className="font-semibold text-foreground">Mode B — Government ID Upload</h3>
          </div>
          <p className="text-muted text-sm">Upload a clear photo of your Aadhaar card, PAN card, or passport.</p>

          <input ref={idRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0], "id"); }} />
          {kyc?.documentUrl ? (
            <div className="relative">
              {kyc.documentUrl.endsWith('.pdf') ? (
                <div className="w-full aspect-[3/2] bg-white/5 rounded-xl border-2 border-emerald-600/60 flex items-center justify-center">
                  <div className="text-center">
                    <FileText size={32} className="text-emerald-400 mx-auto mb-2" />
                    <div className="text-muted text-sm">ID Document (PDF)</div>
                  </div>
                </div>
              ) : (
                <img 
                  src={kyc.documentUrl} 
                  alt="ID document" 
                  className="w-full aspect-[3/2] object-cover rounded-xl border-2 border-emerald-600/60"
                />
              )}
              <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                <CheckCircle size={16} className="text-foreground" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => idRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors
                ${uploaded.id ? "border-emerald-600/60 bg-emerald-900/10" : "border-border hover:border-[rgba(201,151,44,0.3)]"}`}
            >
              {uploading === "id" ? (
                <div className="text-muted text-sm">Uploading...</div>
              ) : (
                <div className="space-y-1">
                  <Upload size={24} className="text-muted mx-auto" />
                  <div className="text-muted text-sm">Click to upload government ID</div>
                  <div className="text-muted text-xs">Aadhaar / PAN / Passport · JPG, PNG, PDF</div>
                </div>
              )}
            </button>
          )}
        </div>
      )}

      <div className="glass p-4 flex items-start gap-3">
        <Shield size={16} className="text-muted mt-0.5 shrink-0" />
        <p className="text-muted text-xs">
          Your KYC documents are encrypted and stored securely. They are reviewed only by authorized admin staff.
          Documents are deleted after 90 days of approved verification per DPDP Act 2023.
        </p>
      </div>
    </div>
  );
}
