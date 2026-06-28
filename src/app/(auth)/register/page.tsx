"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Heart, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisterForm {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  dpdpConsent: boolean;
}

interface OTPForm { code: string }

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const form = useForm<RegisterForm>();
  const otpForm = useForm<OTPForm>();

  const onRegister = async (data: RegisterForm) => {
    setError("");
    if (data.password !== data.confirmPassword) { setError("Passwords do not match"); return; }
    if (!data.terms || !data.dpdpConsent) { setError("Please accept the required consents to continue"); return; }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, phone: data.phone, password: data.password }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      setEmail(data.email);
      setStep("otp");
    } catch { setError("Registration failed. Please try again."); }
  };

  const onVerifyOtp = async (data: OTPForm) => {
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: data.code, purpose: "REGISTRATION" }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      localStorage.setItem("accessToken", json.data.accessToken);
      localStorage.setItem("refreshToken", json.data.refreshToken);
      router.push("/dashboard/profile");
    } catch { setError("Verification failed. Please try again."); }
  };

  const resendOtp = async () => {
    setResending(true);
    await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "REGISTRATION" }),
    });
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Jasmine Matrimony" className="h-15 w-auto" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {step === "form" ? "Create Your Profile" : "Verify Your Email"}
          </h1>
          <p className="text-muted text-sm">
            {step === "form"
              ? "Free to join. KYC-verified profiles only."
              : `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {step === "form" ? (
          <div className="glass p-8">
            <form onSubmit={form.handleSubmit(onRegister)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                error={form.formState.errors.email?.message}
                {...form.register("email", {
                  required: "Email is required",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                })}
              />

              <Input
                label="Mobile Number"
                type="tel"
                placeholder="Enter Phone Number"
                icon={<Phone size={16} />}
                error={form.formState.errors.phone?.message}
                {...form.register("phone", {
                  required: "Mobile number is required",
                  minLength: { value: 10, message: "Enter a valid mobile number" },
                })}
              />

              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Min. 8 characters"
                icon={<Lock size={16} />}
                error={form.formState.errors.password?.message}
                rightIcon={
                  <button type="button" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...form.register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                })}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                icon={<Lock size={16} />}
                error={form.formState.errors.confirmPassword?.message}
                {...form.register("confirmPassword", { required: "Please confirm your password" })}
              />

              {/* Consents */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded accent-[#C9972C]"
                    {...form.register("terms", { required: true })}
                  />
                  <span className="text-xs text-muted">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#E8C76A] hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#E8C76A] hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded accent-[#C9972C]"
                    {...form.register("dpdpConsent", { required: true })}
                  />
                  <span className="text-xs text-muted">
                    I consent to processing of my personal data including profile, KYC, and photo data for matrimony
                    matchmaking as per the{" "}
                    <Link href="/dpdp-rights" className="text-[#E8C76A] hover:underline">DPDP Act 2023</Link>.
                    I understand my rights to access, correct, and erase my data.
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button variant="gold" size="lg" type="submit" loading={form.formState.isSubmitting} className="w-full">
                Create Profile & Get OTP
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted text-sm">
                Already registered?{" "}
                <Link href="/login" className="text-[#E8C76A] hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="glass p-8">
            <div className="bg-[rgba(201,151,44,0.08)] border border-[rgba(201,151,44,0.2)] rounded-xl p-4 mb-6 text-center">
              <div className="text-[#E8C76A] text-sm">OTP sent to <strong>{email}</strong></div>
              <div className="text-muted text-xs mt-1">Valid for 10 minutes</div>
            </div>

            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-5">
              <Input
                label="6-Digit OTP"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                className="text-center text-2xl tracking-[1rem] font-mono"
                error={otpForm.formState.errors.code?.message}
                {...otpForm.register("code", {
                  required: "Enter the OTP",
                  minLength: { value: 6, message: "Enter a valid 6-digit OTP" },
                  maxLength: { value: 6, message: "Enter a valid 6-digit OTP" },
                  pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit OTP" },
                })}
              />

              {error && (
                <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button variant="gold" size="lg" type="submit" loading={otpForm.formState.isSubmitting} className="w-full">
                <CheckCircle size={16} /> Verify OTP
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-muted text-xs">Didn't receive it?</p>
              <Button variant="ghost" size="sm" onClick={resendOtp} loading={resending}>
                Resend OTP
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
                Change Email
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
