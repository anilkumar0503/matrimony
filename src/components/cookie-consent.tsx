"use client";
import { useState, useEffect } from "react";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_KEY = "cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<ConsentState>({ necessary: true, analytics: false, marketing: false });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const save = (consent: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, timestamp: new Date().toISOString() }));
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: consent }));
    }
  };

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const acceptNecessary = () => save({ necessary: true, analytics: false, marketing: false });
  const savePrefs = () => save(prefs);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto glass border border-[rgba(201,151,44,0.2)] rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie size={20} className="text-[#C9972C] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">We value your privacy</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                We use cookies to enhance your experience, personalise content, and analyse platform usage. 
                Under the <strong className="text-white/80">DPDP Act 2023</strong>, you have full control over your data preferences.{" "}
                <a href="/privacy" className="text-[#C9972C] underline hover:text-[#E8C76A]">Privacy Policy</a>
              </p>
            </div>
          </div>
          <button onClick={acceptNecessary} className="text-white/30 hover:text-white transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Manage Preferences */}
        <div className="mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-white/50 hover:text-white/80 text-xs transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Manage Preferences
          </button>
          {expanded && (
            <div className="mt-3 space-y-2.5 border border-white/[0.08] rounded-xl p-4">
              {[
                { key: "necessary", label: "Strictly Necessary", desc: "Required for the platform to function. Cannot be disabled.", locked: true },
                { key: "analytics", label: "Analytics", desc: "Helps us understand how visitors use the platform (anonymous)." },
                { key: "marketing", label: "Marketing", desc: "Allows personalised content and relevant recommendations." },
              ].map(({ key, label, desc, locked }) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white/80 text-xs font-medium">{label}</div>
                    <div className="text-white/40 text-xs">{desc}</div>
                  </div>
                  <div className={`relative shrink-0 ${locked ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input
                      type="checkbox"
                      checked={prefs[key as keyof ConsentState]}
                      disabled={locked}
                      onChange={(e) => !locked && setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                      className="sr-only peer"
                      id={`cookie-${key}`}
                    />
                    <label
                      htmlFor={`cookie-${key}`}
                      className={`flex w-9 h-5 rounded-full cursor-pointer transition-colors ${
                        prefs[key as keyof ConsentState] ? "bg-[#C9972C]" : "bg-white/20"
                      } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform m-0.5 ${
                        prefs[key as keyof ConsentState] ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={acceptAll}
            className="px-4 py-2 bg-[#C9972C] hover:bg-[#B8861B] text-[#1a0505] text-xs font-semibold rounded-lg transition-colors"
          >
            Accept All
          </button>
          {expanded ? (
            <button
              onClick={savePrefs}
              className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs rounded-lg transition-colors border border-white/[0.1]"
            >
              Save Preferences
            </button>
          ) : (
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs rounded-lg transition-colors border border-white/[0.1]"
            >
              Accept Necessary Only
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
