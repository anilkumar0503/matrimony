"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Bell, Shield, Lock, Trash2, Download, Eye, EyeOff,
  CheckCircle, AlertTriangle, ExternalLink, Monitor, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NOTIFICATION_PREFS = [
  { key: "interest_received", label: "Interest Received" },
  { key: "interest_accepted", label: "Interest Accepted" },
  { key: "mutual_match", label: "Mutual Match" },
  { key: "kyc_status", label: "KYC Status Updates" },
  { key: "subscription", label: "Subscription & Payments" },
  { key: "system", label: "System Announcements" },
];

const VISIBILITY_OPTIONS = [
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email Address" },
  { key: "lastSeen", label: "Last Seen" },
  { key: "profileViews", label: "Profile Views" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"notifications" | "privacy" | "security" | "dpdp" | "danger">("notifications");
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map((n) => [n.key, true]))
  );
  const [visPrefs, setVisPrefs] = useState<Record<string, string>>(
    Object.fromEntries(VISIBILITY_OPTIONS.map((v) => [v.key, "MATCHES_ONLY"]))
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exported, setExported] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [nomination, setNomination] = useState({ name: "", relationship: "", phone: "", email: "" });
  const [savingNomination, setSavingNomination] = useState(false);

  const pwForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();
  const deleteForm = useForm<{ password: string; reason: string }>();
  const token = () => localStorage.getItem("accessToken");

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/user/sessions", { headers: { Authorization: `Bearer ${token()}` } });
      const json = await res.json();
      if (json.success) setSessions(json.data.sessions || []);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
    setLoadingSessions(false);
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      loadSessions();
    } catch (err) {
      console.error("Failed to revoke session", err);
    }
  };

  useEffect(() => {
    if (tab === "security") loadSessions();
  }, [tab]);

  const saveNomination = async () => {
    setSavingNomination(true);
    try {
      const res = await fetch("/api/user/nomination", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(nomination),
      });
      const json = await res.json();
      if (json.success) {
        alert("Nomination saved successfully");
      } else {
        alert(json.error || "Failed to save nomination");
      }
    } catch (err) {
      console.error("Failed to save nomination", err);
      alert("Failed to save nomination");
    }
    setSavingNomination(false);
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/notifications/preferences", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: notifPrefs }),
      });
    } finally {
      setSaving(false);
    }
  };

  const saveVisibility = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ visibilitySettings: visPrefs }),
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      pwForm.setError("confirmPassword", { message: "Passwords do not match" }); return;
    }
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    const json = await res.json();
    if (json.success) pwForm.reset();
    else pwForm.setError("currentPassword", { message: json.error });
  };

  const requestDataExport = async () => {
    await fetch("/api/user/data-export", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
    setExported(true);
  };

  const deleteAccount = async (data: { password: string; reason: string }) => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { localStorage.clear(); router.replace("/"); }
      else deleteForm.setError("password", { message: json.error });
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "privacy", label: "Privacy", icon: Eye },
    { key: "security", label: "Security", icon: Lock },
    { key: "dpdp", label: "DPDP Rights", icon: Shield },
    { key: "danger", label: "Danger Zone", icon: AlertTriangle },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Account Settings</h1>
        <p className="text-muted text-sm">Manage your notifications, privacy, security, and data rights</p>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === key
                ? "bg-[rgba(201,151,44,0.12)] text-[#E8C76A] border border-[rgba(201,151,44,0.25)]"
                : "text-muted hover:text-foreground hover:bg-white/[0.05]"
              } ${key === "danger" ? "text-red-400 hover:text-red-300 hover:bg-red-900/10" : ""}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {tab === "notifications" && (
        <div className="glass p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Notification Preferences</h3>
          <div className="space-y-3">
            {NOTIFICATION_PREFS.map((pref) => (
              <label key={pref.key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-muted text-sm group-hover:text-foreground transition-colors">{pref.label}</span>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer
                    ${notifPrefs[pref.key] ? "bg-[#C9972C]" : "bg-white/10"}`}
                  onClick={() => setNotifPrefs((prev) => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                    ${notifPrefs[pref.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            ))}
          </div>
          <Button variant="gold" size="sm" onClick={saveNotifications} loading={saving}>Save Preferences</Button>
        </div>
      )}

      {/* Privacy */}
      {tab === "privacy" && (
        <div className="glass p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Visibility Controls</h3>
          <p className="text-muted text-sm">Control who can see your sensitive information</p>
          <div className="space-y-4">
            {VISIBILITY_OPTIONS.map((opt) => (
              <div key={opt.key} className="flex items-center justify-between">
                <span className="text-muted text-sm">{opt.label}</span>
                <select
                  className="input-glass w-44 text-sm"
                  value={visPrefs[opt.key]}
                  onChange={(e) => setVisPrefs((prev) => ({ ...prev, [opt.key]: e.target.value }))}
                >
                  <option value="PUBLIC">Everyone</option>
                  <option value="MATCHES_ONLY">Matches Only</option>
                  <option value="PREMIUM_ONLY">Premium Members</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>
            ))}
          </div>
          <Button variant="gold" size="sm" onClick={saveVisibility} loading={saving}>Save Privacy Settings</Button>
        </div>
      )}

      {/* Security */}
      {tab === "security" && (
        <div className="glass p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Change Password</h3>
          <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••"
              icon={<Lock size={15} />} error={pwForm.formState.errors.currentPassword?.message}
              {...pwForm.register("currentPassword", { required: "Current password required" })} />
            <Input label="New Password" type="password" placeholder="Min. 8 characters"
              icon={<Lock size={15} />} error={pwForm.formState.errors.newPassword?.message}
              {...pwForm.register("newPassword", {
                required: "New password required",
                minLength: { value: 8, message: "Min. 8 characters" },
              })} />
            <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
              icon={<Lock size={15} />} error={pwForm.formState.errors.confirmPassword?.message}
              {...pwForm.register("confirmPassword", { required: "Please confirm your password" })} />
            <Button variant="gold" size="sm" type="submit" loading={pwForm.formState.isSubmitting}>
              Update Password
            </Button>
          </form>
          <hr className="border-border" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Active Sessions</h3>
            <p className="text-muted text-sm mb-4">Manage your active login sessions across devices.</p>
            {loadingSessions ? (
              <div className="text-muted text-sm">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-muted text-sm">No active sessions found.</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-border">
                    <div className="flex items-center gap-3">
                      <Monitor size={16} className="text-muted" />
                      <div>
                        <div className="text-foreground text-sm">{s.deviceInfo || "Unknown Device"}</div>
                        <div className="text-muted text-xs">
                          {s.ipAddress} • {new Date(s.createdAt).toLocaleDateString()}
                          {s.isCurrent && <span className="ml-2 text-[#C9972C] text-[10px]">(Current)</span>}
                        </div>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <button
                        onClick={() => revokeSession(s.id)}
                        className="text-muted hover:text-red-400 transition-colors p-1"
                        title="Revoke session"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="glass" size="sm" onClick={async () => {
                await fetch("/api/auth/logout", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ allDevices: true }),
                });
                loadSessions();
              }}>
                Logout All Other Devices
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DPDP Rights */}
      {tab === "dpdp" && (
        <div className="glass p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <Shield size={16} className="text-[#C9972C]" /> Your Data Rights
            </h3>
            <p className="text-muted text-sm">
              Under the Digital Personal Data Protection Act 2023, you have the following rights.
            </p>
          </div>

          {[
            {
              title: "Right to Access",
              desc: "View all personal data we hold about you.",
              action: <Button variant="glass" size="sm" asChild><Link href="/dashboard/settings/data-request">Request Access <ExternalLink size={12} /></Link></Button>,
            },
            {
              title: "Right to Correction",
              desc: "Correct inaccurate personal data.",
              action: <Button variant="glass" size="sm" asChild><Link href="/dashboard/profile">Edit Profile</Link></Button>,
            },
            {
              title: "Right to Data Portability",
              desc: "Download a copy of all your data in machine-readable format.",
              action: exported
                ? <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle size={13} /> Request Submitted</span>
                : <Button variant="glass" size="sm" onClick={requestDataExport}><Download size={13} /> Request Export</Button>,
            },
            {
              title: "Right to Erasure",
              desc: "Request deletion of all your personal data (irreversible).",
              action: <Button variant="glass" size="sm" className="text-red-400" onClick={() => setTab("danger")}>
                <Trash2 size={13} /> Request Deletion
              </Button>,
            },
            {
              title: "Consent Management",
              desc: "Review and update the consents you have given.",
              action: <Button variant="glass" size="sm" asChild><Link href="/dashboard/settings/consent">Manage Consent</Link></Button>,
            },
          ].map((right) => (
            <div key={right.title} className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <div className="font-medium text-foreground text-sm">{right.title}</div>
                <div className="text-muted text-xs mt-0.5">{right.desc}</div>
              </div>
              {right.action}
            </div>
          ))}

          <div className="glass-dark p-4 rounded-xl text-muted text-xs">
            Data Protection Officer: dpo@matrimony.com · Grievance redressal within 30 days per DPDP Act 2023
          </div>

          <hr className="border-border" />

          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <Shield size={16} className="text-[#C9972C]" /> Nomination (DPDP Right)
            </h3>
            <p className="text-muted text-sm mb-4">
              Nominate a person to manage your account in case of death or incapacity.
            </p>
            <div className="space-y-3">
              <Input
                label="Nominee Name"
                placeholder="Full name of nominee"
                value={nomination.name}
                onChange={(e) => setNomination((n) => ({ ...n, name: e.target.value }))}
              />
              <Input
                label="Relationship"
                placeholder="e.g., Spouse, Parent, Sibling"
                value={nomination.relationship}
                onChange={(e) => setNomination((n) => ({ ...n, relationship: e.target.value }))}
              />
              <Input
                label="Phone Number"
                placeholder="10-digit mobile number"
                value={nomination.phone}
                onChange={(e) => setNomination((n) => ({ ...n, phone: e.target.value }))}
              />
              <Input
                label="Email Address"
                placeholder="nominee@example.com"
                value={nomination.email}
                onChange={(e) => setNomination((n) => ({ ...n, email: e.target.value }))}
              />
              <Button variant="gold" size="sm" onClick={saveNomination} loading={savingNomination}>
                Save Nomination
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {tab === "danger" && (
        <div className="glass border-red-800/30 p-6 space-y-4">
          <h3 className="font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} /> Danger Zone
          </h3>
          <p className="text-muted text-sm">
            Deleting your account is irreversible. All your data, matches, and subscription will be permanently removed
            after the 30-day retention period as per DPDP Act 2023.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={15} /> Delete My Account
          </Button>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-background border border-border p-6 rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Trash2 size={16} /> Confirm Account Deletion
            </h3>
            <p className="text-muted text-sm mb-5">
              This will permanently delete your profile, photos, matches, and all associated data.
              Your data will be retained for 30 days for compliance, then permanently erased.
            </p>
            <form onSubmit={deleteForm.handleSubmit(deleteAccount)} className="space-y-4">
              <Input label="Confirm your password" type="password" placeholder="••••••••"
                icon={<Lock size={15} />} error={deleteForm.formState.errors.password?.message}
                {...deleteForm.register("password", { required: "Password required" })} />
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Reason (optional)</label>
                <textarea className="input-glass min-h-[70px]" placeholder="Tell us why you're leaving..."
                  {...deleteForm.register("reason")} />
              </div>
              <div className="flex gap-3">
                <Button variant="glass" type="button" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
                <Button variant="danger" type="submit" loading={deleting} className="flex-1">Delete Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
