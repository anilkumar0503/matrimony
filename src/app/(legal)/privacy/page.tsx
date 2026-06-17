import Link from "next/link";
import { Shield, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal data under the DPDP Act 2023.",
};

const LAST_UPDATED = "June 1, 2025";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect the following categories of personal data:

**Account Data:** Name, email address, phone number, date of birth, and gender when you register.

**Profile Data:** Photographs, educational qualifications, profession, family background, religious/community information, and partner preferences you voluntarily provide.

**Identity Verification (KYC):** Government-issued ID documents and selfie photographs for identity verification purposes only.

**Usage Data:** Log files, IP addresses, browser type, pages visited, and interaction patterns to improve our services.

**Payment Data:** Transaction records processed via Razorpay. We do not store card or bank account details directly.

**Communications:** Messages you send to our support team.`,
  },
  {
    title: "2. How We Use Your Data",
    content: `Your data is used for:
- Matching you with compatible profiles based on preferences
- Identity verification and fraud prevention
- Processing subscription payments and generating invoices
- Sending service-related communications and notifications
- Complying with legal obligations under the DPDP Act 2023 and other applicable laws
- Improving platform safety, security, and user experience`,
  },
  {
    title: "3. Legal Basis for Processing",
    content: `We process your data under the following legal bases as per the Digital Personal Data Protection Act 2023:

- **Consent:** You provide explicit consent during registration for primary data processing
- **Contractual necessity:** To deliver the matrimony matching service you signed up for
- **Legal obligation:** Tax records, fraud prevention, and regulatory compliance
- **Legitimate interests:** Platform security and abuse prevention`,
  },
  {
    title: "4. Data Sharing",
    content: `We share your data only with:

**Other Members:** Profile information is visible to other registered members, subject to your privacy settings. Sensitive information (phone, email) is shared only upon mutual interest acceptance.

**Service Providers:** KYC verification partner (Digio), payment processor (Razorpay), cloud storage (Linode), and email service providers — bound by data processing agreements.

**Legal Authorities:** When required by court order, law enforcement, or regulatory mandate.

We do **not** sell your personal data to third parties.`,
  },
  {
    title: "5. Data Retention",
    content: `- Active account data is retained for the duration of your membership
- Deleted accounts: Personal data is anonymised within 30 days of deletion request
- Payment and invoice records: 7 years as required by tax law
- KYC documents: 5 years for regulatory compliance
- Audit logs: 2 years`,
  },
  {
    title: "6. Your Rights Under DPDP Act 2023",
    content: `You have the following rights:

- **Right to Access:** Request a copy of all personal data we hold about you
- **Right to Correction:** Update inaccurate information via your profile
- **Right to Erasure:** Request deletion of your account and personal data
- **Right to Portability:** Download your data in a machine-readable format
- **Right to Withdraw Consent:** Withdraw consent for optional processing
- **Right to Grievance Redressal:** Lodge complaints with our Data Protection Officer

Exercise these rights from your **Dashboard → Settings → DPDP Rights** page.`,
  },
  {
    title: "7. Cookies",
    content: `We use strictly necessary cookies for authentication and security. Analytics cookies are only placed with your explicit consent. You may manage cookie preferences at any time via the cookie settings panel.`,
  },
  {
    title: "8. Data Security",
    content: `We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest for sensitive fields, regular security audits, and access controls. In the event of a data breach affecting your rights, we will notify you and the Data Protection Board within 72 hours as required by law.`,
  },
  {
    title: "9. Contact & Grievances",
    content: `**Data Protection Officer:** Raghav Sharma  
**Email:** dpo@matrimony.com  
**Address:** 123 Business Park, Bengaluru, Karnataka 560001  

Grievances will be acknowledged within 48 hours and resolved within 30 days per the DPDP Act 2023.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a0505]">
      <div className="blob-bg" />
      <div className="page-wrapper max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Home
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <Shield size={13} /> Privacy Policy
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/50">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="glass p-6 mb-6 text-white/60 text-sm leading-relaxed">
          This policy explains how Jasmine Matrimony (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and protects your personal
          data in compliance with the <strong className="text-[#E8C76A]">Digital Personal Data Protection Act 2023 (DPDP Act)</strong>.
          By using our platform, you consent to the practices described herein.
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="glass p-6">
              <h2 className="font-display text-lg font-bold text-white mb-4">{section.title}</h2>
              <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line prose-sm">
                {section.content.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={i} className="font-semibold text-white/80 mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
                  }
                  if (line.startsWith("- ")) {
                    return <li key={i} className="ml-4 mb-1">{line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</li>;
                  }
                  return line ? <p key={i} className="mb-2">{line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</p> : <br key={i} />;
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="glass p-6 mt-6 text-center">
          <p className="text-white/40 text-sm mb-3">Questions about our privacy practices?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact" className="badge-glass text-sm">Contact Us</Link>
            <Link href="/dashboard/settings#dpdp" className="badge-gold text-sm">Exercise Your Rights</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
