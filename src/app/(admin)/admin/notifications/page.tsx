"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Bell, PlusCircle, Pencil, X, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Template {
  id: string; eventKey: string; label: string;
  emailSubject: string | null; emailBody: string | null;
  smsBody: string | null; inAppBody: string | null;
  variables: string[] | null; version: number;
}

const TABS = ["Templates", "Send Broadcast"] as const;
type Tab = typeof TABS[number];

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<Tab>("Templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const templateForm = useForm<{
    label: string; emailSubject: string; emailBody: string;
    smsBody: string; inAppBody: string;
  }>();

  const broadcastForm = useForm<{
    targetType: string; subject: string; body: string; channel: string;
  }>({ defaultValues: { targetType: "ALL", channel: "IN_APP" } });

  const token = () => localStorage.getItem("adminAccessToken");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notification-templates", { headers: { Authorization: `Bearer ${token()}` } });
    const json = await res.json();
    if (json.success) setTemplates(json.data.templates);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openEdit = (t: Template) => {
    setEditTemplate(t);
    templateForm.reset({
      label: t.label,
      emailSubject: t.emailSubject || "",
      emailBody: t.emailBody || "",
      smsBody: t.smsBody || "",
      inAppBody: t.inAppBody || "",
    });
  };

  const onSaveTemplate = async (data: Record<string, string>) => {
    if (!editTemplate) return;
    setSaving(true);
    await fetch(`/api/admin/notification-templates/${editTemplate.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setEditTemplate(null);
    fetchTemplates();
  };

  const onSendBroadcast = async (data: { targetType: string; subject: string; body: string; channel: string }) => {
    setSaving(true);
    const res = await fetch("/api/admin/notifications/broadcast", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setSaving(false);
    setBroadcastResult(json.success ? `Broadcast queued for ${data.targetType.toLowerCase()} users` : json.error);
    broadcastForm.reset({ targetType: "ALL", channel: "IN_APP" });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell size={22} className="text-[#f78222]" /> Notifications
        </h1>
        <p className="text-muted text-sm">Manage notification templates and send broadcasts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <Button key={t} variant={tab === t ? "gold" : "glass"} size="sm" onClick={() => setTab(t)}>{t}</Button>
        ))}
      </div>

      {/* Templates tab */}
      {tab === "Templates" && (
        <div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
          ) : (
            <div className="glass overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Event Key", "Label", "Channels", "Version", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted text-xs font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id} className="border-b border-border hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-muted text-xs">{t.eventKey}</td>
                      <td className="px-4 py-3 text-muted text-sm">{t.label}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {t.emailBody && <Badge variant="info" className="text-[9px]">Email</Badge>}
                          {t.inAppBody && <Badge variant="success" className="text-[9px]">In-App</Badge>}
                          {t.smsBody && <Badge variant="warning" className="text-[9px]">SMS</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">v{t.version}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil size={14} /></Button>
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-muted">No templates found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Broadcast tab */}
      {tab === "Send Broadcast" && (
        <div className="glass p-6 max-w-xl">
          <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2"><Users size={16} className="text-[#f78222]" /> Broadcast Message</h3>
          {broadcastResult && (
            <div className="mb-4 glass-dark p-3 rounded-xl text-sm text-emerald-400">{broadcastResult}</div>
          )}
          <form onSubmit={broadcastForm.handleSubmit(onSendBroadcast)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Target Audience</label>
                <select className="input-glass" {...broadcastForm.register("targetType")}>
                  <option value="ALL">All Users</option>
                  <option value="ACTIVE">Active Members</option>
                  <option value="PREMIUM">Premium Members</option>
                  <option value="VIP">VIP Members</option>
                  <option value="PENDING_KYC">Pending KYC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Channel</label>
                <select className="input-glass" {...broadcastForm.register("channel")}>
                  <option value="IN_APP">In-App</option>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
            <Input label="Subject (for email)" {...broadcastForm.register("subject")} />
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Message Body</label>
              <textarea className="input-glass min-h-[120px]" {...broadcastForm.register("body", { required: "Message required" })} />
            </div>
            <Button variant="gold" type="submit" loading={saving} className="w-full">
              <Send size={15} /> Send Broadcast
            </Button>
          </form>
        </div>
      )}

      {/* Template editor modal */}
      {editTemplate && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex items-start justify-center p-4 pt-8" onClick={() => setEditTemplate(null)}>
          <div className="glass-dark p-6 rounded-2xl max-w-2xl w-full my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Edit Template: <span className="font-mono text-[#f78222] text-sm">{editTemplate.eventKey}</span></h3>
              <button onClick={() => setEditTemplate(null)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            {editTemplate.variables && editTemplate.variables.length > 0 && (
              <div className="mb-4 p-3 bg-white/[0.04] rounded-xl text-xs text-muted">
                Available variables: {editTemplate.variables.map(v => <code key={v} className="mx-1 text-[#f78222]">{`{{${v}}}`}</code>)}
              </div>
            )}
            <form onSubmit={templateForm.handleSubmit(onSaveTemplate)} className="space-y-4">
              <Input label="Template Label" {...templateForm.register("label")} />
              <Input label="Email Subject" {...templateForm.register("emailSubject")} />
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Email Body (HTML)</label>
                <textarea className="input-glass min-h-[120px] font-mono text-xs" {...templateForm.register("emailBody")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">In-App Notification Body</label>
                <textarea className="input-glass min-h-[60px]" {...templateForm.register("inAppBody")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">SMS Body (max 160 chars)</label>
                <textarea className="input-glass min-h-[60px]" maxLength={160} {...templateForm.register("smsBody")} />
              </div>
              <div className="flex gap-3">
                <Button variant="glass" type="button" onClick={() => setEditTemplate(null)} className="flex-1">Cancel</Button>
                <Button variant="gold" type="submit" loading={saving} className="flex-1">Save Template</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
