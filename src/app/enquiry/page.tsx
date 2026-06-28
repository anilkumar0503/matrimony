"use client";
import { useState } from "react";
import { Mail, Phone, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function EnquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Your enquiry has been submitted. We'll get back to you soon!", variant: "success" });
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast({ title: "Error", description: json.error || "Failed to submit enquiry", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to submit enquiry", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0505]">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Get in Touch</h1>
          <p className="text-muted">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground placeholder-muted focus:outline-none focus:border-[#C9972C] transition-colors"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground placeholder-muted focus:outline-none focus:border-[#C9972C] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground placeholder-muted focus:outline-none focus:border-[#C9972C] transition-colors"
                  placeholder="Enter Phone Number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Message (optional)</label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3 top-3 text-muted" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-border text-foreground placeholder-muted focus:outline-none focus:border-[#C9972C] transition-colors resize-none"
                  placeholder="Tell us about yourself or ask any questions..."
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              loading={submitting}
              disabled={submitting}
            >
              <Send size={16} className="mr-2" />
              Submit Enquiry
            </Button>
          </form>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account? <a href="/login" className="text-[#C9972C] hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
