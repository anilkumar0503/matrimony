"use client";
import { useEffect, useState, useCallback } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, calculateAge } from "@/lib/utils";
import { cn } from "@/lib/utils";

const REJECTION_REASONS = [
  { value: "CODE_NOT_VISIBLE", label: "Code Not Visible" },
  { value: "ID_UNCLEAR", label: "ID Unclear" },
  { value: "FACE_MISMATCH", label: "Face Mismatch" },
  { value: "SUSPICIOUS", label: "Suspicious Submission" },
  { value: "EXPIRED_DOCUMENT", label: "Expired Document" },
];

interface Submission {
  id: string;
  userId: string;
  status: string;
  mode: string;
  attempts: number;
  createdAt: string;
  selfieUrl: string | null;
  idDocumentUrl: string | null;
  verificationCode: string;
  isSlaBreach: boolean;
  user: {
    id: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    profile: { fullName: string } | null;
    images: { id: string; signedUrl: string | null; isPrimary: boolean }[];
  };
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejReason, setRejReason] = useState("");
  const [rejNotes, setRejNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status: statusFilter });
    const res = await fetch(`/api/admin/kyc?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) { setSubmissions(json.data.submissions); setTotal(json.data.pagination.total); }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const handleReview = async () => {
    if (!selected || !action) return;
    if (action === "REJECT" && !rejReason) return;
    setProcessing(true);
    const res = await fetch("/api/admin/kyc", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: selected.id,
        action,
        rejectionReason: rejReason || undefined,
        rejectionNotes: rejNotes || undefined,
      }),
    });
    const json = await res.json();
    setProcessing(false);
    if (json.success) { setSelected(null); setAction(null); setRejReason(""); setRejNotes(""); fetchSubmissions(); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-[#C9972C]" /> KYC Queue
          </h1>
          <p className="text-white/40 text-sm">{total} {statusFilter.toLowerCase()} submissions</p>
        </div>
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "gold" : "glass"} size="sm"
              onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Member", "KYC Mode", "Submitted", "Attempts", "Status", "SLA", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>)}
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">No {statusFilter.toLowerCase()} submissions</td></tr>
              ) : submissions.map((sub) => (
                <tr key={sub.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] ${sub.isSlaBreach ? "bg-amber-900/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white text-sm">{sub.user.profile?.fullName || "—"}</div>
                    <div className="text-white/40 text-xs">{sub.user.email}</div>
                    <div className="text-white/30 text-xs">{sub.user.gender} · {sub.user.dateOfBirth ? calculateAge(sub.user.dateOfBirth) + " yrs" : "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="glass">{sub.mode || "Mode A"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{formatDateTime(sub.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${sub.attempts >= 3 ? "text-red-400" : "text-white/70"}`}>
                      {sub.attempts}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.status === "APPROVED" ? "success" : sub.status === "REJECTED" ? "danger" : "warning"}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {sub.isSlaBreach && (
                      <Badge variant="danger">
                        <AlertTriangle size={10} /> SLA Breach
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(sub)} title="Review">
                        <Eye size={14} />
                      </Button>
                      {sub.status === "PENDING" && (
                        <>
                          <Button variant="glass" size="sm" className="h-7 text-xs text-emerald-400"
                            onClick={() => { setSelected(sub); setAction("APPROVE"); }}>
                            <CheckCircle size={12} /> Approve
                          </Button>
                          <Button variant="glass" size="sm" className="h-7 text-xs text-red-400"
                            onClick={() => { setSelected(sub); setAction("REJECT"); }}>
                            <XCircle size={12} /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-white/40 text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
              <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setSelected(null); setAction(null); }}>
          <div className="glass-dark rounded-2xl p-6 max-w-2xl w-full my-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-semibold text-white text-lg">{selected.user.profile?.fullName || "Unknown"}</h3>
                <p className="text-white/40 text-sm">{selected.user.email} · {selected.user.gender} · Attempt #{selected.attempts}</p>
              </div>
              <Badge variant={selected.status === "APPROVED" ? "success" : selected.status === "REJECTED" ? "danger" : "warning"}>
                {selected.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-white/40 text-xs mb-2">Verification Code</div>
                <div className="glass p-3 font-mono text-[#E8C76A] text-lg tracking-widest">{selected.verificationCode}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-2">Submitted At</div>
                <div className="text-white/70 text-sm">{formatDateTime(selected.createdAt)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {selected.selfieUrl && (
                <div>
                  <div className="text-white/40 text-xs mb-2">Selfie with Code</div>
                  <div className="aspect-square bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                    <img src={selected.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {selected.idDocumentUrl && (
                <div>
                  <div className="text-white/40 text-xs mb-2">ID Document</div>
                  <div className="aspect-square bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                    <img src={selected.idDocumentUrl} alt="ID" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {!selected.selfieUrl && !selected.idDocumentUrl && (
                <div className="col-span-2 text-center text-white/30 text-sm py-8 border border-white/10 rounded-xl">
                  Documents not uploaded yet
                </div>
              )}
            </div>

            {/* Profile photos for comparison */}
            {selected.user.images.length > 0 && (
              <div className="mb-6">
                <div className="text-white/40 text-xs mb-2">Profile Photos (for comparison)</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selected.user.images.map((img) => (
                    <div
                      key={img.id}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border shrink-0",
                        img.isPrimary ? "border-[#C9972C] ring-1 ring-[rgba(201,151,44,0.3)]" : "border-white/10"
                      )}
                    >
                      {img.signedUrl ? (
                        <img src={img.signedUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No image</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status === "PENDING" && (
              <>
                {action === "REJECT" && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1.5">Rejection Reason *</label>
                      <select className="input-glass" value={rejReason} onChange={(e) => setRejReason(e.target.value)}>
                        <option value="">Select reason</option>
                        {REJECTION_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1.5">Additional Notes</label>
                      <textarea className="input-glass min-h-[70px]" placeholder="Optional notes for the member..."
                        value={rejNotes} onChange={(e) => setRejNotes(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="glass" onClick={() => { setSelected(null); setAction(null); }} className="flex-1">Cancel</Button>
                  {action === "REJECT" ? (
                    <Button variant="danger" onClick={handleReview} loading={processing} disabled={!rejReason} className="flex-1">
                      <XCircle size={14} /> Reject KYC
                    </Button>
                  ) : (
                    <>
                      <Button variant="glass" className="flex-1 text-red-400" onClick={() => setAction("REJECT")}>
                        <XCircle size={14} /> Reject
                      </Button>
                      <Button variant="gold" onClick={() => { setAction("APPROVE"); handleReview(); }} loading={processing} className="flex-1">
                        <CheckCircle size={14} /> Approve KYC
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}

            {selected.status !== "PENDING" && (
              <Button variant="glass" onClick={() => setSelected(null)} className="w-full">Close</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
