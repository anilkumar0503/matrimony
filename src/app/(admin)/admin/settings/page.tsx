"use client";
import { useEffect, useState } from "react";
import { Save, Eye, EyeOff, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingGroup {
  label: string;
  keys: { key: string; label: string; type?: string; placeholder?: string; hint?: string }[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    label: "Payment & Razorpay",
    keys: [
      { key: "razorpay.key_id", label: "Razorpay Key ID", placeholder: "rzp_live_..." },
      { key: "razorpay.key_secret", label: "Razorpay Key Secret", type: "password", placeholder: "••••••••" },
      { key: "razorpay.mode", label: "Mode (test/live)", placeholder: "live" },
    ],
  },
  {
    label: "GST & Tax",
    keys: [
      { key: "gst.rate", label: "GST Rate (%)", placeholder: "18", hint: "Default: 18%" },
      { key: "platform.state", label: "Platform State", placeholder: "Tamil Nadu", hint: "Used for CGST/SGST vs IGST" },
      { key: "business.name", label: "Business Name", placeholder: "Jasmine Matrimony Pvt Ltd" },
      { key: "business.gstin", label: "GSTIN", placeholder: "33AABCP1234M1Z5" },
      { key: "business.address", label: "Business Address", placeholder: "No. 1, Chennai, TN 600001" },
      { key: "invoice.prefix", label: "Invoice Number Prefix", placeholder: "INV-" },
    ],
  },
  {
    label: "KYC Configuration",
    keys: [
      { key: "kyc.mode_b_enabled", label: "Mode B (Manual ID) Enabled", placeholder: "true/false" },
      { key: "kyc.mode_c_enabled", label: "Mode C (Digio e-KYC) Enabled", placeholder: "true/false" },
      { key: "kyc.max_attempts", label: "Max KYC Attempts", placeholder: "3" },
      { key: "digio.client_id", label: "Digio Client ID", placeholder: "digio_client_id" },
      { key: "digio.client_secret", label: "Digio Client Secret", type: "password" },
      { key: "digio.env", label: "Digio Environment", placeholder: "sandbox/production" },
    ],
  },
  {
    label: "Email Provider",
    keys: [
      { key: "email.provider", label: "Email Provider", placeholder: "smtp/sendgrid/ses", hint: "smtp, sendgrid, or ses" },
      { key: "mail.mailer", label: "Mail Driver", placeholder: "smtp" },
      { key: "mail.host", label: "SMTP Host", placeholder: "sandbox.smtp.mailtrap.io" },
      { key: "mail.port", label: "SMTP Port", placeholder: "2525" },
      { key: "mail.username", label: "SMTP Username", placeholder: "username" },
      { key: "mail.password", label: "SMTP Password", type: "password" },
      { key: "email.from", label: "From Email", placeholder: "noreply@matrimony.com" },
      { key: "email.from_name", label: "From Name", placeholder: "Jasmine Matrimony" },
      { key: "sendgrid.api_key", label: "SendGrid API Key", type: "password" },
    ],
  },
  {
    label: "SMS (Toggleable)",
    keys: [
      { key: "sms.enabled", label: "SMS Enabled", placeholder: "true/false" },
      { key: "sms.gateway_key", label: "SMS Gateway API Key", type: "password" },
      { key: "sms.sender_id", label: "SMS Sender ID", placeholder: "MTRMNY" },
    ],
  },
  {
    label: "Interest & Matching",
    keys: [
      { key: "interest.expiry_days", label: "Interest Expiry (days)", placeholder: "30" },
    ],
  },
  {
    label: "Image Moderation",
    keys: [
      { key: "image.max_per_profile", label: "Max Images Per Profile", placeholder: "10" },
      { key: "image.max_size_mb", label: "Max Image Size (MB)", placeholder: "5" },
      { key: "image.watermark_enabled", label: "Watermark Enabled", placeholder: "true/false" },
      { key: "image.watermark_text", label: "Watermark Text", placeholder: "Jasmine Matrimony" },
      { key: "image.moderation_sla_hours", label: "Moderation SLA (hours)", placeholder: "24" },
      { key: "image.moderation_alert_threshold", label: "Alert Threshold (count)", placeholder: "20" },
    ],
  },
  {
    label: "DPDP & Data Protection",
    keys: [
      { key: "dpo.name", label: "Data Protection Officer Name", placeholder: "DPO Name" },
      { key: "dpo.email", label: "DPO Email", placeholder: "dpo@matrimony.com" },
      { key: "retention.inactive_months", label: "Inactive Account Retention (months)", placeholder: "24" },
      { key: "retention.post_deletion_days", label: "Post-Deletion Retention (days)", placeholder: "30" },
    ],
  },
  {
    label: "Platform",
    keys: [
      { key: "app.name", label: "App Name", placeholder: "Jasmine Matrimony" },
      { key: "platform.maintenance_mode", label: "Maintenance Mode", placeholder: "true/false" },
      { key: "platform.maintenance_message", label: "Maintenance Message", placeholder: "Under maintenance..." },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [changed, setChanged] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const token = () => localStorage.getItem("adminAccessToken");

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((res) => { if (res.success) setSettings(res.data.settings); })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setChanged((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!Object.keys(changed).length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: Object.entries(changed).map(([key, value]) => ({
            key,
            value,
            isSecret: key.includes("secret") || key.includes("key") || key.includes("password"),
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSettings((prev) => ({ ...prev, ...changed }));
        setChanged({});
        setSavedMsg("Settings saved successfully!");
        setTimeout(() => setSavedMsg(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string) => {
    if (key in changed) return changed[key];
    const raw = settings[key];
    if (!raw) return "";
    if (raw === "••••••••") return "";
    return raw;
  };

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings size={22} className="text-[#C9972C]" /> Platform Settings
          </h1>
          <p className="text-muted text-sm">All changes are audit-logged and cached</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-emerald-400 text-sm">{savedMsg}</span>}
          {Object.keys(changed).length > 0 && (
            <span className="text-amber-400 text-xs">{Object.keys(changed).length} unsaved change(s)</span>
          )}
          <Button variant="gold" onClick={saveSettings} loading={saving} disabled={!Object.keys(changed).length}>
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </div>

      {SETTING_GROUPS.map((group) => (
        <div key={group.label} className="glass p-6">
          <h3 className="font-semibold text-foreground mb-5 pb-3 border-b border-border">{group.label}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {group.keys.map((field) => {
              const isSecret = field.type === "password";
              const visible = showSecrets[field.key];
              const hasChange = field.key in changed;
              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    {field.label}
                    {hasChange && <span className="ml-2 text-amber-400 text-[10px]">● unsaved</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={isSecret && !visible ? "password" : "text"}
                      className={`input-glass w-full ${isSecret ? "pr-10" : ""} ${hasChange ? "border-amber-700/50" : ""}`}
                      placeholder={
                        isSecret && settings[field.key] === "••••••••"
                          ? "Currently set (hidden)"
                          : field.placeholder
                      }
                      value={getValue(field.key)}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                    {isSecret && (
                      <button
                        type="button"
                        onClick={() => setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-muted"
                      >
                        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                  {field.hint && <p className="text-muted text-[10px] mt-1">{field.hint}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="glass p-4 flex items-center gap-3">
        <RefreshCw size={16} className="text-muted" />
        <span className="text-muted text-xs">Settings are cached for 5 minutes. Changes take effect immediately after save.</span>
      </div>
    </div>
  );
}
