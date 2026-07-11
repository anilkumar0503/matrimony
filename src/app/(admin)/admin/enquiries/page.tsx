"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Filter, UserPlus, Mail, Phone, Calendar, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = ["", "PENDING", "IN_PROGRESS", "CONVERTED", "CLOSED"];

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  userId: string | null;
  user: { id: string; email: string } | null;
  createdAt: string;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "glass"> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  CONVERTED: "success",
  CLOSED: "glass",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [accountForm, setAccountForm] = useState({
    password: "",
    gender: "MALE" as "MALE" | "FEMALE",
    dateOfBirth: "",
  });
  const [creatingAccount, setCreatingAccount] = useState(false);
  const { toast } = useToast();

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/enquiries?${params}`, { headers: { Authorization: `Bearer ${token()}` } });

    if (res.status === 401) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("adminInfo");
      window.location.replace("/admin/login");
      return;
    }

    const json = await res.json();
    if (json.success) {
      setEnquiries(json.data.enquiries);
      setTotal(json.data.pagination.total);
    }
    setLoading(false);
  }, [page, status]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const openCreateAccountModal = (enquiry: Enquiry) => {
    if (enquiry.userId) {
      toast({ title: "Info", description: "Account already created for this enquiry", variant: "default" });
      return;
    }
    setSelectedEnquiry(enquiry);
    setAccountForm({ password: "", gender: "MALE", dateOfBirth: "" });
    setShowCreateAccountModal(true);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    setCreatingAccount(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}/create-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Account created successfully", variant: "success" });
        setShowCreateAccountModal(false);
        fetchEnquiries();
      } else {
        toast({ title: "Error", description: json.error || "Failed to create account", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create account", variant: "destructive" });
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Enquiries</h1>
        </div>

        {/* Filters */}
        <div className="glass p-4 rounded-xl mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground focus:outline-none focus:border-[#f78222]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || "All Status"}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-muted">No enquiries found</p>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgba(255,255,255,0.02)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Account</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{enq.name}</td>
                      <td className="px-4 py-3 text-sm text-muted flex items-center gap-2">
                        <Mail size={14} /> {enq.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {enq.phone ? <><Phone size={14} className="inline mr-1" /> {enq.phone}</> : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariantMap[enq.status] || "glass"}>{enq.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        <Calendar size={14} className="inline mr-1" /> {formatDate(enq.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {enq.userId ? (
                          <Badge variant="success">Created</Badge>
                        ) : (
                          <Badge variant="glass">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!enq.userId && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => openCreateAccountModal(enq)}
                          >
                            <UserPlus size={14} className="mr-1" /> Create Account
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Account Modal */}
        {showCreateAccountModal && selectedEnquiry && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass p-6 rounded-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Create Account</h2>
                <Button variant="glass" size="sm" onClick={() => setShowCreateAccountModal(false)}>
                  <X size={16} />
                </Button>
              </div>

              <div className="mb-4 p-3 bg-[rgba(201,151,44,0.1)] rounded-lg">
                <p className="text-sm text-foreground"><strong>Name:</strong> {selectedEnquiry.name}</p>
                <p className="text-sm text-foreground"><strong>Email:</strong> {selectedEnquiry.email}</p>
                {selectedEnquiry.phone && <p className="text-sm text-foreground"><strong>Phone:</strong> {selectedEnquiry.phone}</p>}
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground focus:outline-none focus:border-[#f78222]"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gender *</label>
                  <select
                    value={accountForm.gender}
                    onChange={(e) => setAccountForm({ ...accountForm, gender: e.target.value as "MALE" | "FEMALE" })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground focus:outline-none focus:border-[#f78222]"
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    value={accountForm.dateOfBirth}
                    onChange={(e) => setAccountForm({ ...accountForm, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground focus:outline-none focus:border-[#f78222]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="glass"
                    className="flex-1"
                    onClick={() => setShowCreateAccountModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    className="flex-1"
                    loading={creatingAccount}
                    disabled={creatingAccount}
                  >
                    <Check size={16} className="mr-2" /> Create Account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
