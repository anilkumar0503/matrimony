"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin, MessageSquare, ChevronLeft, Send, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{
    name: string; email: string; phone: string; subject: string; message: string;
  }>();

  const onSubmit = async (data: Record<string, string>) => {
    setSubmitting(true);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      <div className="blob-bg" />
      <div className="page-wrapper max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <MessageSquare size={13} /> Support
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Contact Us</h1>
          <p className="text-muted">Our team is here to help. Reach out to us anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "support@matrimony.com", href: "mailto:support@matrimony.com" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: Clock, label: "Support Hours", value: "Mon–Sat, 9am–6pm IST", href: null },
              { icon: MapPin, label: "Address", value: "123 Business Park, Bengaluru, Karnataka 560001", href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="glass p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C9972C]/10 border border-[#C9972C]/20 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-[#C9972C]" />
                </div>
                <div>
                  <div className="text-muted text-xs mb-0.5">{label}</div>
                  {href ? (
                    <a href={href} className="text-muted text-sm hover:text-[#E8C76A] transition-colors">{value}</a>
                  ) : (
                    <div className="text-muted text-sm">{value}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="glass p-4">
              <div className="text-muted text-xs mb-2">For DPO / DPDP Queries</div>
              <a href="mailto:dpo@matrimony.com" className="text-[#C9972C] text-sm hover:text-[#E8C76A]">dpo@matrimony.com</a>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 glass p-6">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted">We&apos;ll get back to you within 24–48 hours.</p>
                <Button variant="glass" className="mt-6" onClick={() => setSubmitted(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Send us a message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name" {...register("name", { required: "Required" })} error={errors.name?.message} />
                  <Input label="Email Address" type="email" {...register("email", { required: "Required" })} error={errors.email?.message} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Phone (optional)" {...register("phone")} />
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Subject</label>
                    <select className="input-glass" {...register("subject", { required: "Required" })}>
                      <option value="">Select topic</option>
                      <option value="Account Issues">Account Issues</option>
                      <option value="KYC Support">KYC Support</option>
                      <option value="Payment / Billing">Payment / Billing</option>
                      <option value="Privacy & DPDP">Privacy & DPDP</option>
                      <option value="Report a Member">Report a Member</option>
                      <option value="General Enquiry">General Enquiry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Message</label>
                  <textarea className="input-glass min-h-[120px]" placeholder="Describe your issue or question..."
                    {...register("message", { required: "Required", minLength: { value: 10, message: "Too short" } })} />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <Button variant="gold" type="submit" loading={submitting} className="w-full">
                  <Send size={15} /> Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
