"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Trash2, Star, X, VideoOff, Images, AlertTriangle, CheckCircle, Clock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  originalUrl: string;
  watermarkedUrl: string | null;
  signedUrl: string | null;
  isPrimary: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  category: string;
}

const MAX_IMAGES = 10;

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [showGalleryPublic, setShowGalleryPublic] = useState(true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const token = () => localStorage.getItem("accessToken");

  const fetchImages = async () => {
    const res = await fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const json = await res.json();
    if (json.success) {
      setImages(json.data.images || []);
      setShowGalleryPublic(json.data.profile?.showGalleryPublic ?? true);
    }
    setLoading(false);
  };

  const toggleGalleryVisibility = async () => {
    const next = !showGalleryPublic;
    setTogglingVisibility(true);
    try {
      const res = await fetch("/api/user/profile/gallery-visibility", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ showGalleryPublic: next }),
      });
      const json = await res.json();
      if (json.success) setShowGalleryPublic(next);
      else setError(json.error || "Failed to update visibility");
    } finally {
      setTogglingVisibility(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const uploadFile = async (file: File) => {
    if (images.filter(i => i.status !== "REJECTED").length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      const isPrimary = images.length === 0;
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
      if (!json.success) setError(json.error || "Upload failed");
      else await fetchImages();
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 640 },
      });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setError("Camera access denied. Please allow camera access.");
    }
  };

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  const confirmCapture = async () => {
    if (!capturedBlob) return;
    await uploadFile(new File([capturedBlob], "selfie.jpg", { type: "image/jpeg" }));
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
  };

  const discardCapture = () => {
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
  };

  const deleteImage = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/user/profile/upload-image?imageId=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) setImages(prev => prev.filter(img => img.id !== id));
      else setError(json.error || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const setPrimary = async (id: string) => {
    setSettingPrimaryId(id);
    try {
      const res = await fetch("/api/user/profile/upload-image/set-primary", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === id })));
      } else setError(json.error || "Failed to set primary");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const activeCount = images.filter(i => i.status !== "REJECTED").length;
  const slotsLeft = MAX_IMAGES - activeCount;

  const statusIcon = (status: string) => {
    if (status === "APPROVED") return <CheckCircle size={12} />;
    if (status === "REJECTED") return <AlertTriangle size={12} />;
    return <Clock size={12} />;
  };

  const statusVariant = (status: string): "success" | "danger" | "warning" =>
    status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "warning";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass p-6 animate-pulse h-48 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="glass aspect-square rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Images size={22} className="text-[#f78222]" /> My Gallery
          </h1>
          <p className="text-muted text-sm">{activeCount} of {MAX_IMAGES} photos used</p>
        </div>
      </div>

      {/* Gallery Visibility Toggle */}
      <div className={cn(
        "glass p-4 rounded-xl flex items-center justify-between gap-4 border",
        showGalleryPublic ? "border-emerald-500/20" : "border-border"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            showGalleryPublic ? "bg-emerald-500/15" : "bg-white/5"
          )}>
            {showGalleryPublic
              ? <Eye size={16} className="text-emerald-400" />
              : <EyeOff size={16} className="text-muted" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Gallery visibility
              <span className={cn(
                "ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full",
                showGalleryPublic ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted"
              )}>
                {showGalleryPublic ? "Public" : "Hidden"}
              </span>
            </p>
            <p className="text-xs text-muted mt-0.5">
              {showGalleryPublic
                ? "Your approved gallery photos are visible to other members"
                : "Only your primary photo is shown to others"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleGalleryVisibility}
          disabled={togglingVisibility}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
            showGalleryPublic ? "bg-emerald-500" : "bg-white/20",
            togglingVisibility && "opacity-60 cursor-not-allowed"
          )}
          aria-label="Toggle gallery visibility"
        >
          <span className={cn(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
            showGalleryPublic ? "translate-x-[22px]" : "translate-x-0.5"
          )} />
        </button>
      </div>

      {/* Note: images require admin approval before appearing publicly */}
      <div className="glass-dark p-3 rounded-xl text-xs text-muted flex items-start gap-2 border border-border">
        <Clock size={12} className="shrink-0 mt-0.5 text-amber-400/60" />
        <span>All uploaded photos require admin approval before they become visible to others, regardless of visibility settings.</span>
      </div>

      {/* Upload area */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted text-sm font-medium">Add Photos</p>
            <p className="text-muted text-xs mt-0.5">{slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining · JPG, PNG, WebP · Max 5MB each</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={startCamera}
              disabled={slotsLeft <= 0 || uploading}
            >
              <Camera size={14} /> Selfie
            </Button>
            <Button
              variant="glass-gold"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={slotsLeft <= 0 || uploading}
              loading={uploading}
            >
              <Upload size={14} /> Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {slotsLeft <= 0 && (
          <p className="text-amber-400/70 text-xs bg-amber-900/10 border border-amber-500/20 rounded-lg px-3 py-2">
            Gallery full. Delete a photo to add more.
          </p>
        )}
      </div>

      {/* Gallery grid */}
      {images.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl">
          <Images size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No photos yet</p>
          <p className="text-muted text-xs mt-1">Upload your first photo to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border group",
                img.status === "REJECTED" ? "border-red-500/30 opacity-60" : "border-border"
              )}
            >
              <img
                src={img.signedUrl || img.watermarkedUrl || img.originalUrl}
                alt=""
                className="w-full h-full object-cover"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {img.status === "APPROVED" && !img.isPrimary && (
                  <button
                    onClick={() => setPrimary(img.id)}
                    disabled={!!settingPrimaryId}
                    className="p-2 rounded-full bg-[rgba(201,151,44,0.9)] hover:bg-[#f78222] text-[#ffffff] transition-colors"
                    title="Set as primary"
                  >
                    {settingPrimaryId === img.id
                      ? <span className="w-4 h-4 border-2 border-[#1a0505]/50 border-t-[#1a0505] rounded-full animate-spin block" />
                      : <Star size={16} />}
                  </button>
                )}
                <button
                  onClick={() => deleteImage(img.id)}
                  disabled={!!deletingId}
                  className="p-2 rounded-full bg-red-600/90 hover:bg-red-600 text-foreground transition-colors"
                  title="Delete photo"
                >
                  {deletingId === img.id
                    ? <span className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin block" />
                    : <Trash2 size={16} />}
                </button>
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 bg-[rgba(201,151,44,0.95)] text-[#ffffff] text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={8} className="fill-current" /> Primary
                </div>
              )}

              {/* Status badge */}
              <div className="absolute bottom-1.5 right-1.5">
                <Badge variant={statusVariant(img.status)} className="text-[9px] flex items-center gap-0.5">
                  {statusIcon(img.status)} {img.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status legend */}
      {images.length > 0 && (
        <div className="glass p-4 rounded-xl flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><Clock size={11} className="text-amber-400" /> Pending review</span>
          <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-emerald-400" /> Approved & visible</span>
          <span className="flex items-center gap-1.5"><AlertTriangle size={11} className="text-red-400" /> Rejected — can be deleted</span>
          <span className="flex items-center gap-1.5"><Star size={11} className="text-[#f78222]" /> Set as primary (approved only)</span>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Take Selfie</h3>
              <button onClick={stopCamera} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="aspect-square bg-black rounded-xl overflow-hidden mb-4">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <Button variant="glass" onClick={stopCamera} className="flex-1">
                <VideoOff size={14} /> Cancel
              </Button>
              <Button variant="gold" onClick={capturePhoto} className="flex-1">
                <Camera size={14} /> Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Captured preview */}
      {capturedPreviewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Review Photo</h3>
              <button onClick={discardCapture} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-border">
              <img src={capturedPreviewUrl} alt="Captured" className="w-full h-full object-cover" />
            </div>
            {images.some(i => i.status === "PENDING") && (
              <div className="glass-dark p-3 rounded-xl mb-4 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                You already have a photo pending review. This will be added as an additional photo.
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => { discardCapture(); startCamera(); }} className="flex-1">
                <Camera size={14} /> Retake
              </Button>
              <Button variant="gold" onClick={confirmCapture} loading={uploading} className="flex-1">
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
