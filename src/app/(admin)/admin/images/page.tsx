"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface ImageItem {
  id: string;
  userId: string;
  originalUrl: string;
  signedUrl: string | null;
  category: string;
  status: string;
  createdAt: string;
  user: { id: string; email: string; profile: { fullName: string } | null };
}

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<ImageItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status: statusFilter });
    const res = await fetch(`/api/admin/images?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      setImages(json.data.images);
      setTotal(json.data.pagination.total);
      setPendingCount(json.data.pendingCount);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(images.map((i) => i.id)));
  const clearAll = () => setSelected(new Set());

  const bulkAction = async (action: "APPROVE" | "REJECT") => {
    if (!selected.size) return;
    setProcessing(true);
    await fetch("/api/admin/images", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds: Array.from(selected), action }),
    });
    setProcessing(false);
    setSelected(new Set());
    fetchImages();
  };

  const singleAction = async (imageId: string, action: "APPROVE" | "REJECT") => {
    setProcessing(true);
    await fetch("/api/admin/images", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, action, rejectionReason: rejectReason || undefined }),
    });
    setProcessing(false);
    setRejectTarget(null);
    setRejectReason("");
    setPreview(null);
    fetchImages();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Image Moderation</h1>
          <p className="text-white/40 text-sm">
            {pendingCount} pending · {total} {statusFilter.toLowerCase()} images
          </p>
        </div>
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "gold" : "glass"} size="sm"
              onClick={() => { setStatusFilter(s); setPage(1); setSelected(new Set()); }}>
              {s}
              {s === "PENDING" && pendingCount > 0 && (
                <span className="ml-1 bg-amber-500/80 text-[#1a0505] text-[10px] font-bold px-1 rounded-full">{pendingCount}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {statusFilter === "PENDING" && (
        <div className="glass p-3 flex items-center gap-3 flex-wrap">
          <Button variant="glass" size="sm" onClick={selectAll}>
            <CheckSquare size={14} /> Select All ({images.length})
          </Button>
          {selected.size > 0 && (
            <>
              <span className="text-white/50 text-sm">{selected.size} selected</span>
              <Button variant="glass" size="sm" className="text-emerald-400" onClick={() => bulkAction("APPROVE")} loading={processing}>
                <CheckCircle size={14} /> Approve Selected
              </Button>
              <Button variant="glass" size="sm" className="text-red-400" onClick={() => bulkAction("REJECT")} loading={processing}>
                <XCircle size={14} /> Reject Selected
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
            </>
          )}
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="glass p-16 text-center text-white/30">No {statusFilter.toLowerCase()} images</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                ${selected.has(img.id) ? "border-[#C9972C] ring-2 ring-[rgba(201,151,44,0.3)]" : "border-white/10"}`}
              onClick={() => statusFilter === "PENDING" && toggleSelect(img.id)}
            >
              <div className="aspect-square bg-white/5">
                {img.signedUrl ? (
                  <img src={img.signedUrl} alt="Profile image" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No preview</div>
                )}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-start justify-between">
                  <Badge variant={img.status === "APPROVED" ? "success" : img.status === "REJECTED" ? "danger" : "warning"} className="text-[9px]">
                    {img.status}
                  </Badge>
                  <Badge variant="glass" className="text-[9px]">{img.category}</Badge>
                </div>
                <div>
                  <div className="text-white text-xs font-medium truncate">{img.user.profile?.fullName || img.user.email}</div>
                  <div className="text-white/50 text-[10px]">{formatDateTime(img.createdAt)}</div>
                  {img.status === "PENDING" && (
                    <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                      <button className="flex-1 bg-emerald-700/80 text-white text-[10px] py-1 rounded flex items-center justify-center gap-0.5"
                        onClick={() => singleAction(img.id, "APPROVE")}>
                        <CheckCircle size={10} /> OK
                      </button>
                      <button className="flex-1 bg-red-800/80 text-white text-[10px] py-1 rounded flex items-center justify-center gap-0.5"
                        onClick={() => { setRejectTarget(img.id); setPreview(img); }}>
                        <XCircle size={10} /> Rej.
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {selected.has(img.id) && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-[#C9972C] rounded-full flex items-center justify-center">
                  <CheckCircle size={12} className="text-[#1a0505]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
          <span className="text-white/50 text-sm">Page {page} of {totalPages}</span>
          <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectTarget && preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => { setRejectTarget(null); setPreview(null); }}>
          <div className="glass-dark p-6 rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-4">Reject Image</h3>
            <p className="text-white/50 text-sm mb-4">{preview.user.profile?.fullName || preview.user.email}</p>
            <textarea
              className="input-glass min-h-[80px] mb-4"
              placeholder="Reason for rejection (shown to member)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => { setRejectTarget(null); setPreview(null); }} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={() => singleAction(rejectTarget, "REJECT")} loading={processing} className="flex-1">
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
