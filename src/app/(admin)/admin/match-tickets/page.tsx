"use client";
import { useEffect, useState, useCallback } from "react";
import { Ticket, Calendar, CheckCircle, X, MessageSquare, ChevronLeft, ChevronRight, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, calculateAge } from "@/lib/utils";

interface Ticket {
  id: string;
  status: string;
  meetingLink: string | null;
  meetingTime: string | null;
  meetingType: string | null;
  outcome: string | null;
  createdAt: string;
  match: {
    userA: { id: string; dateOfBirth: string; profile: { fullName: string; city: string } | null };
    userB: { id: string; dateOfBirth: string; profile: { fullName: string; city: string } | null };
  };
  notes: { id: string; note: string; admin: { name: string }; createdAt: string }[];
}

interface User {
  id: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  profile: { fullName: string; city: string; state: string } | null;
}

const statusColor: Record<string, "warning" | "info" | "gold" | "success" | "danger" | "glass"> = {
  OPEN: "warning",
  IN_REVIEW: "info",
  SCHEDULED: "gold",
  COMPLETED: "success",
  CLOSED: "glass",
};

export default function AdminMatchTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [note, setNote] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingType, setMeetingType] = useState("GOOGLE_MEET");
  const [outcome, setOutcome] = useState("PROCEEDING");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userSearchA, setUserSearchA] = useState("");
  const [userSearchB, setUserSearchB] = useState("");
  const [userResultsA, setUserResultsA] = useState<User[]>([]);
  const [userResultsB, setUserResultsB] = useState<User[]>([]);
  const [selectedUserA, setSelectedUserA] = useState<User | null>(null);
  const [selectedUserB, setSelectedUserB] = useState<User | null>(null);
  const [createNotes, setCreateNotes] = useState("");
  const [creating, setCreating] = useState(false);

  const token = () => localStorage.getItem("adminAccessToken");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/match-tickets?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) { setTickets(json.data.tickets); setTotal(json.data.pagination.total); }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const action = async (ticketId: string, act: string, extra?: object) => {
    setProcessing(ticketId + act);
    const res = await fetch("/api/admin/match-tickets", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, action: act, ...extra }),
    });
    setProcessing(null);
    if ((await res.json()).success) { fetch_(); if (act !== "ADD_NOTE") setSelected(null); setNote(""); }
  };

  const searchUsers = async (query: string, forUser: "A" | "B") => {
    if (!query.trim()) {
      if (forUser === "A") setUserResultsA([]);
      else setUserResultsB([]);
      return;
    }
    const res = await fetch(`/api/admin/users?search=${query}&limit=10`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) {
      if (forUser === "A") setUserResultsA(json.data.users);
      else setUserResultsB(json.data.users);
    }
  };

  const createMatch = async () => {
    if (!selectedUserA || !selectedUserB) return;
    setCreating(true);
    const res = await fetch("/api/admin/match-tickets", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ userAId: selectedUserA.id, userBId: selectedUserB.id, notes: createNotes }),
    });
    const json = await res.json();
    setCreating(false);
    if (json.success) {
      setShowCreateModal(false);
      setSelectedUserA(null);
      setSelectedUserB(null);
      setUserSearchA("");
      setUserSearchB("");
      setUserResultsA([]);
      setUserResultsB([]);
      setCreateNotes("");
      fetch_();
    } else {
      alert(json.error || "Failed to create match");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Ticket size={22} className="text-[#C9972C]" /> Match Tickets
          </h1>
          <p className="text-white/40 text-sm">{total} tickets</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="gold" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Create Match</Button>
          {["", "OPEN", "IN_REVIEW", "SCHEDULED", "COMPLETED", "CLOSED"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "gold" : "glass"} size="sm"
              onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s || "All"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)
        ) : tickets.length === 0 ? (
          <div className="glass p-12 text-center text-white/30">No match tickets found</div>
        ) : tickets.map((ticket) => (
          <div key={ticket.id} className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <Badge variant={statusColor[ticket.status] || "glass"}>{ticket.status.replace(/_/g, " ")}</Badge>
                  {ticket.meetingType && <Badge variant="info">{ticket.meetingType.replace(/_/g, " ")}</Badge>}
                  {ticket.outcome && <Badge variant="success">{ticket.outcome.replace(/_/g, " ")}</Badge>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-dark p-3 rounded-xl">
                    <div className="text-white/40 text-[10px] mb-1">Profile A</div>
                    <div className="font-medium text-white text-sm">{ticket.match.userA.profile?.fullName || "—"}</div>
                    <div className="text-white/50 text-xs">{ticket.match.userA.dateOfBirth ? calculateAge(ticket.match.userA.dateOfBirth) + " yrs" : ""} · {ticket.match.userA.profile?.city}</div>
                  </div>
                  <div className="glass-dark p-3 rounded-xl">
                    <div className="text-white/40 text-[10px] mb-1">Profile B</div>
                    <div className="font-medium text-white text-sm">{ticket.match.userB.profile?.fullName || "—"}</div>
                    <div className="text-white/50 text-xs">{ticket.match.userB.dateOfBirth ? calculateAge(ticket.match.userB.dateOfBirth) + " yrs" : ""} · {ticket.match.userB.profile?.city}</div>
                  </div>
                </div>
                {ticket.meetingTime && (
                  <div className="flex items-center gap-2 mt-2 text-white/50 text-xs">
                    <Calendar size={12} />
                    Meeting: {formatDateTime(ticket.meetingTime)}
                    {ticket.meetingLink && <a href={ticket.meetingLink} target="_blank" className="text-[#E8C76A] underline">Join</a>}
                  </div>
                )}
                {ticket.notes.length > 0 && (
                  <div className="mt-2 text-white/40 text-xs">
                    {ticket.notes[0].admin.name}: "{ticket.notes[0].note}"
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="glass" size="sm" onClick={() => setSelected(ticket)}><MessageSquare size={13} /> Manage</Button>
                {ticket.status === "OPEN" && (
                  <Button variant="glass-gold" size="sm" onClick={() => action(ticket.id, "START_REVIEW")} loading={processing === ticket.id + "START_REVIEW"}>
                    Start Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="glass" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
          <span className="text-white/50 text-sm">Page {page} of {totalPages}</span>
          <Button variant="glass" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
        </div>
      )}

      {/* Manage modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="glass-dark p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Manage Ticket</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selected.status === "OPEN" && (
                  <Button variant="glass-gold" size="sm" onClick={() => action(selected.id, "START_REVIEW")}>Start Review</Button>
                )}
                {(selected.status === "IN_REVIEW" || selected.status === "SCHEDULED") && (
                  <>
                    <Button variant="glass" size="sm" onClick={() => action(selected.id, "COMPLETE", { outcome })}>
                      <CheckCircle size={14} /> Complete
                    </Button>
                    <select 
                      className="input-glass text-sm py-1.5 px-3" 
                      value={outcome} 
                      onChange={(e) => setOutcome(e.target.value)}
                    >
                      <option value="PROCEEDING">Proceeding</option>
                      <option value="NOT_PROCEEDING">Not Proceeding</option>
                      <option value="ENGAGED">Engaged</option>
                      <option value="MARRIED">Married</option>
                    </select>
                  </>
                )}
                {(selected.status === "IN_REVIEW" || selected.status === "OPEN" || selected.status === "SCHEDULED") && (
                  <Button variant="danger" size="sm" onClick={() => action(selected.id, "CLOSE", { closeReason: "Closed by admin", outcome: "NOT_PROCEEDING" })}>Close</Button>
                )}
              </div>

              {/* Schedule meeting */}
              {(selected.status === "IN_REVIEW" || selected.status === "OPEN") && (
                <div className="glass-dark p-4 rounded-xl space-y-3">
                  <div className="text-sm font-medium text-white">Schedule Meeting</div>
                  <input className="input-glass" type="datetime-local" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
                  <input className="input-glass" type="url" placeholder="Meeting link (optional)" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
                  <select className="input-glass" value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="PHYSICAL">Physical Meeting</option>
                    <option value="OFFLINE_ASSISTED">Offline Assisted</option>
                  </select>
                  <Button variant="gold" size="sm" onClick={() => action(selected.id, "SCHEDULE_MEETING", { meetingLink, meetingTime, meetingType })}
                    loading={processing === selected.id + "SCHEDULE_MEETING"} disabled={!meetingTime}>
                    <Calendar size={14} /> Schedule
                  </Button>
                </div>
              )}

              {/* Add note */}
              <div className="glass-dark p-4 rounded-xl space-y-3">
                <div className="text-sm font-medium text-white">Add Note</div>
                <textarea className="input-glass min-h-[70px]" placeholder="Internal note..." value={note} onChange={(e) => setNote(e.target.value)} />
                <Button variant="glass" size="sm" onClick={() => action(selected.id, "ADD_NOTE", { note })} loading={processing === selected.id + "ADD_NOTE"} disabled={!note.trim()}>
                  <MessageSquare size={14} /> Add Note
                </Button>
              </div>

              {/* Notes history */}
              {selected.notes.length > 0 && (
                <div>
                  <div className="text-white/40 text-xs mb-2">Notes History</div>
                  <div className="space-y-2">
                    {selected.notes.map((n) => (
                      <div key={n.id} className="glass-dark p-3 rounded-xl">
                        <div className="text-white/70 text-sm">{n.note}</div>
                        <div className="text-white/30 text-xs mt-1">{n.admin.name} · {formatDateTime(n.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Match Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="glass-dark p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Create Match Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-5">
              {/* User A Selection */}
              <div>
                <label className="block text-xs text-white/50 mb-2">Profile A</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    className="input-glass input-glass-with-icon"
                    placeholder="Search by name, email, phone..."
                    value={userSearchA}
                    onChange={(e) => { setUserSearchA(e.target.value); searchUsers(e.target.value, "A"); }}
                  />
                </div>
                {selectedUserA && (
                  <div className="glass-dark p-3 mt-2 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{selectedUserA.profile?.fullName || "—"}</div>
                      <div className="text-white/40 text-xs">{selectedUserA.email} · {selectedUserA.gender}</div>
                    </div>
                    <button onClick={() => setSelectedUserA(null)} className="text-white/40 hover:text-red-400"><X size={14} /></button>
                  </div>
                )}
                {userResultsA.length > 0 && !selectedUserA && (
                  <div className="glass-dark mt-2 rounded-lg max-h-40 overflow-y-auto">
                    {userResultsA.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-white/[0.05] cursor-pointer border-b border-white/[0.04] last:border-0"
                        onClick={() => { setSelectedUserA(user); setUserResultsA([]); setUserSearchA(""); }}
                      >
                        <div className="text-white text-sm">{user.profile?.fullName || "—"}</div>
                        <div className="text-white/40 text-xs">{user.email} · {user.gender} · {user.profile?.city}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User B Selection */}
              <div>
                <label className="block text-xs text-white/50 mb-2">Profile B</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    className="input-glass input-glass-with-icon"
                    placeholder="Search by name, email, phone..."
                    value={userSearchB}
                    onChange={(e) => { setUserSearchB(e.target.value); searchUsers(e.target.value, "B"); }}
                  />
                </div>
                {selectedUserB && (
                  <div className="glass-dark p-3 mt-2 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{selectedUserB.profile?.fullName || "—"}</div>
                      <div className="text-white/40 text-xs">{selectedUserB.email} · {selectedUserB.gender}</div>
                    </div>
                    <button onClick={() => setSelectedUserB(null)} className="text-white/40 hover:text-red-400"><X size={14} /></button>
                  </div>
                )}
                {userResultsB.length > 0 && !selectedUserB && (
                  <div className="glass-dark mt-2 rounded-lg max-h-40 overflow-y-auto">
                    {userResultsB.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-white/[0.05] cursor-pointer border-b border-white/[0.04] last:border-0"
                        onClick={() => { setSelectedUserB(user); setUserResultsB([]); setUserSearchB(""); }}
                      >
                        <div className="text-white text-sm">{user.profile?.fullName || "—"}</div>
                        <div className="text-white/40 text-xs">{user.email} · {user.gender} · {user.profile?.city}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-white/50 mb-2">Initial Notes (optional)</label>
                <textarea
                  className="input-glass min-h-[70px]"
                  placeholder="Add any notes about this match..."
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="glass" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
                <Button
                  variant="gold"
                  onClick={createMatch}
                  disabled={!selectedUserA || !selectedUserB || creating}
                  loading={creating}
                  className="flex-1"
                >
                  Create Match
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
