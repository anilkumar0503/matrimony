"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Heart, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const emailForm = useForm<{ email: string }>();
  const otpForm = useForm<{ code: string }>();
  const resetForm = useForm<{ newPassword: string; confirmPassword: string }>();

  const onEmailSubmit = async (data: { email: string }) => {
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error); return; }
    setEmail(data.email);
    setStep("otp");
  };

  const onOtpSubmit = async (data: { code: string }) => {
    setError("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: data.code, purpose: "FORGOT_PASSWORD" }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error); return; }
    setResetToken(json.data.resetToken);
    setStep("reset");
  };

  const onResetSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    setError("");
    if (data.newPassword !== data.confirmPassword) { setError("Passwords do not match"); return; }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resetToken, newPassword: data.newPassword }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error); return; }
    router.push("/login?reset=success");
  };

  const stepTitle = { email: "Forgot Password", otp: "Verify OTP", reset: "Set New Password" };
  const stepDesc = {
    email: "Enter your registered email to receive an OTP",
    otp: `Enter the 6-digit OTP sent to ${email}`,
    reset: "Choose a strong new password",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B1D1D] to-[#C9972C] flex items-center justify-center">
              <Heart size={18} className="text-white fill-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Premium <span className="text-gold">Matrimony</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">{stepTitle[step]}</h1>
          <p className="text-white/50 text-sm">{stepDesc[step]}</p>
        </div>

        <div className="glass p-8">
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
              <Input label="Registered Email" type="email" placeholder="you@example.com" icon={<Mail size={16} />}
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register("email", { required: "Email is required" })} />
              {error && <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}
              <Button variant="gold" size="lg" type="submit" loading={emailForm.formState.isSubmitting} className="w-full">
                Send OTP
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
              <div className="bg-[rgba(201,151,44,0.08)] border border-[rgba(201,151,44,0.2)] rounded-xl p-4 text-center text-sm text-[#E8C76A]">
                OTP sent to <strong>{email}</strong> · Valid for 10 mins
              </div>
              <Input label="6-Digit OTP" type="text" inputMode="numeric" maxLength={6} placeholder="• • • • • •"
                className="text-center text-2xl tracking-[1rem] font-mono"
                error={otpForm.formState.errors.code?.message}
                {...otpForm.register("code", { required: "Enter OTP", pattern: { value: /^\d{6}$/, message: "Enter 6-digit OTP" } })} />
              {error && <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}
              <Button variant="gold" size="lg" type="submit" loading={otpForm.formState.isSubmitting} className="w-full">
                Verify OTP
              </Button>
              <Button variant="ghost" size="sm" type="button" className="w-full" onClick={() => { setStep("email"); setError(""); }}>
                Change Email
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
              <Input label="New Password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                icon={<Lock size={16} />} error={resetForm.formState.errors.newPassword?.message}
                rightIcon={<button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                {...resetForm.register("newPassword", { required: "Password required", minLength: { value: 8, message: "Min. 8 characters" } })} />
              <Input label="Confirm New Password" type="password" placeholder="Repeat password"
                icon={<Lock size={16} />} error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register("confirmPassword", { required: "Please confirm password" })} />
              {error && <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}
              <Button variant="gold" size="lg" type="submit" loading={resetForm.formState.isSubmitting} className="w-full">
                <CheckCircle size={16} /> Reset Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
