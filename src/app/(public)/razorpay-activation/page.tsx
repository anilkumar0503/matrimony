import { Shield, CheckCircle, Lock, CreditCard, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Razorpay Activation & Compliance",
  description: "Information about our payment gateway activation and compliance with Razorpay requirements.",
};

export default function RazorpayActivationPage() {
  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <CreditCard size={13} /> Payment Gateway
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Razorpay <span className="text-gold">Activation</span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Information about our payment gateway integration and compliance with regulatory requirements.
          </p>
        </div>

        <div className="space-y-6">
          {/* Business Information */}
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[#f78222]" size={24} />
              <h2 className="font-display text-xl font-bold text-foreground">Business Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Business Name</span>
                <span className="text-foreground font-medium">Jasmine Matrimony</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Business Type</span>
                <span className="text-foreground font-medium">Online Matrimony Service</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Industry Category</span>
                <span className="text-foreground font-medium">Online Services / Dating & Matrimony</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">Primary Website</span>
                <span className="text-foreground font-medium">jasminematrimony.com</span>
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-[#f78222]" size={24} />
              <h2 className="font-display text-xl font-bold text-foreground">Services Offered</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[#f78222] mt-0.5 shrink-0" />
                Premium subscription plans for enhanced matchmaking features
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[#f78222] mt-0.5 shrink-0" />
                VIP membership with dedicated matchmaking services
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[#f78222] mt-0.5 shrink-0" />
                Community-based membership plans
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[#f78222] mt-0.5 shrink-0" />
                Profile verification and KYC services
              </li>
            </ul>
          </div>

          {/* Compliance & Security */}
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-[#f78222]" size={24} />
              <h2 className="font-display text-xl font-bold text-foreground">Compliance & Security</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 border border-border rounded-xl">
                <div className="font-medium text-foreground mb-1">GST Compliance</div>
                <div className="text-muted">GST registered business with valid GSTIN</div>
              </div>
              <div className="p-4 border border-border rounded-xl">
                <div className="font-medium text-foreground mb-1">DPDP Act 2023</div>
                <div className="text-muted">Compliant with Digital Personal Data Protection Act</div>
              </div>
              <div className="p-4 border border-border rounded-xl">
                <div className="font-medium text-foreground mb-1">PCI DSS</div>
                <div className="text-muted">Payment processing via PCI DSS compliant gateway</div>
              </div>
              <div className="p-4 border border-border rounded-xl">
                <div className="font-medium text-foreground mb-1">Data Security</div>
                <div className="text-muted">AES-256 encryption for sensitive data</div>
              </div>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-[#f78222]" size={24} />
              <h2 className="font-display text-xl font-bold text-foreground">Refund & Cancellation Policy</h2>
            </div>
            <div className="text-sm text-muted space-y-3">
              <p>
                All subscription plans are non-refundable once activated. Users may cancel their subscription at any time, 
                and the service will continue until the end of the current billing period.
              </p>
              <p>
                In case of technical issues preventing service delivery, users may request a refund by contacting our 
                support team within 7 days of payment. Refunds are processed within 7-10 business days.
              </p>
              <p className="text-xs">
                For refund requests, please contact us at support@jasminematrimony.com with your order ID and reason for refund.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[#f78222]" size={24} />
              <h2 className="font-display text-xl font-bold text-foreground">Contact Information</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <span className="text-foreground">Email:</span>
                <a href="mailto:support@jasminematrimony.com" className="text-[#f78222] hover:underline">
                  support@jasminematrimony.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span className="text-foreground">Support:</span>
                <a href="/contact" className="text-[#f78222] hover:underline">
                  Contact Form
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass p-6 border-l-4 border-[#f78222]">
            <p className="text-xs text-muted">
              This page is provided for payment gateway activation and compliance purposes. 
              All information is accurate as of the last update date. For the most current business information, 
              please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
