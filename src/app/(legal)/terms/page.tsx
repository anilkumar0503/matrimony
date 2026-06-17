import Link from "next/link";
import { FileText, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing your use of the Jasmine Matrimony platform.",
};

const LAST_UPDATED = "June 1, 2025";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By registering on or using this platform, you agree to be bound by these Terms of Service. If you do not agree, you must not use the platform. These terms form a legally binding agreement between you and Jasmine Matrimony ("Company").`,
  },
  {
    title: "2. Eligibility",
    content: `You must meet the following criteria to use the platform:
- You are at least 18 years of age (21 for males as recommended)
- You are legally eligible to marry under the laws of India
- You are creating an account for yourself, not on behalf of another person without their consent
- You have not been previously suspended or banned from the platform`,
  },
  {
    title: "3. Account & Profile",
    content: `You are responsible for maintaining accurate, truthful, and up-to-date information. Providing false information, including age, marital status, or photographs of others, is strictly prohibited and may result in immediate account termination without refund.

You are responsible for keeping your login credentials secure. You must notify us immediately of any unauthorised access to your account.`,
  },
  {
    title: "4. KYC Verification",
    content: `Identity verification is required for full platform access. You consent to us verifying your identity against government-issued documents. KYC data is used solely for identity verification and is handled under strict security controls and our Privacy Policy.`,
  },
  {
    title: "5. Subscriptions & Payments",
    content: `**Free Plan:** Limited features available at no charge.

**Premium / VIP Plans:** Paid subscriptions unlock additional features. All prices are inclusive of applicable GST.

**Refund Policy:** Subscriptions are non-refundable once activated, except where required by law. Prorated refunds may be issued at our discretion for technical failures attributable to us.

**Auto-renewal:** Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.`,
  },
  {
    title: "6. Prohibited Conduct",
    content: `You must not:
- Harass, threaten, or abuse any user
- Share another user's contact information without consent
- Use the platform for commercial solicitation or advertising
- Create fake profiles or misrepresent your identity
- Attempt to bypass security controls or scrape data
- Use the platform for any illegal purpose`,
  },
  {
    title: "7. Content & Photographs",
    content: `You retain ownership of photos you upload. By uploading, you grant us a non-exclusive, royalty-free licence to display, crop, and watermark your photos within the platform. We will not use your photos for marketing without explicit consent.

All uploaded photos are subject to moderation. Explicit, offensive, or misleading content will be removed and may result in account suspension.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `We provide the platform on an "as is" basis. While we take reasonable measures to verify members, we cannot guarantee the accuracy of information provided by users. We are not responsible for the outcome of any meetings or relationships formed through the platform.

Our total liability for any claim shall not exceed the amount you paid in the 3 months preceding the event giving rise to the claim.`,
  },
  {
    title: "9. Termination",
    content: `We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users. You may delete your account at any time from your settings page.

Following account deletion, data is handled per our Privacy Policy and the DPDP Act 2023.`,
  },
  {
    title: "10. Governing Law & Disputes",
    content: `These terms are governed by the laws of India. Any disputes shall first be subject to mediation. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1a0505]">
      <div className="blob-bg" />
      <div className="page-wrapper max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Home
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <FileText size={13} /> Legal
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-white/50">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="glass p-6 mb-6 text-white/60 text-sm leading-relaxed">
          Please read these Terms of Service carefully before using the Jasmine Matrimony platform. These terms govern
          your access to and use of all features, content, and services provided by us.
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="glass p-6">
              <h2 className="font-display text-lg font-bold text-white mb-4">{section.title}</h2>
              <div className="text-white/60 text-sm leading-relaxed">
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
          <p className="text-white/40 text-sm mb-3">By using Jasmine Matrimony, you acknowledge that you have read and understood these terms.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/privacy" className="badge-glass text-sm">Privacy Policy</Link>
            <Link href="/contact" className="badge-gold text-sm">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
