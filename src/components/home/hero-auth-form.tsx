"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "register" | "login";
type RegStep = "form" | "otp";

interface LoginForm { email: string; password: string; }
interface RegisterForm { email: string; phone: string; password: string; terms: boolean; dpdpConsent: boolean; }
interface OTPForm { code: string; }

export function HeroAuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("register");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [regStep, setRegStep] = useState<RegStep>("form");
  const [regEmail, setRegEmail] = useState("");
  const [resending, setResending] = useState(false);

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();
  const otpForm = useForm<OTPForm>();

  const switchTab = (t: Tab) => { setTab(t); setError(""); setRegStep("form"); };

  const onLogin = async (data: LoginForm) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      localStorage.setItem("accessToken", json.data.accessToken);
      localStorage.setItem("refreshToken", json.data.refreshToken);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setError("");
    if (!data.terms || !data.dpdpConsent) { setError("Please accept the required consents to continue"); return; }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, phone: data.phone, password: data.password }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      setRegEmail(data.email);
      setRegStep("otp");
    } catch { setError("Registration failed. Please try again."); }
  };

  const onVerifyOtp = async (data: OTPForm) => {
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, code: data.code, purpose: "REGISTRATION" }),
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
      body: JSON.stringify({ email: regEmail, purpose: "REGISTRATION" }),
    });
    setResending(false);
  };

  const headerTitle =
    tab === "login"
      ? "Welcome Back"
      : regStep === "otp"
      ? "Verify Your Email"
      : "Create a Matrimony Profile";

  return (
    <div className="w-full overflow-hidden rounded-2xl shadow-2xl border border-[rgba(201,151,44,0.15)]">
      {/* Coloured header banner */}
      <div className="bg-[linear-gradient(135deg,var(--btn-gold-from)_0%,var(--btn-gold-via)_50%,var(--btn-gold-from)_100%)] px-6 py-5 text-center">
        <h2 className="font-display text-xl font-bold text-[var(--btn-gold-text)] tracking-wide">{headerTitle}</h2>
        {/* Tab switcher sits inside the banner */}
        {regStep === "form" && (
          <div className="flex mt-4 bg-black/20 rounded-lg p-1 gap-1">
            {(["register", "login"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  tab === t
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t === "register" ? "Create Profile" : "Sign In"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form body */}
      <div className="glass rounded-none rounded-b-2xl p-6">

      {/* Login form */}
      {tab === "login" && (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={loginForm.formState.errors.email?.message}
            {...loginForm.register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
            })}
          />
          <div>
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              error={loginForm.formState.errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted hover:text-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...loginForm.register("password", { required: "Password is required" })}
            />
            <div className="flex justify-end mt-1.5">
              <Link href="/forgot-password" className="text-xs text-[#E8C76A] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button variant="gold" size="lg" type="submit" loading={loginForm.formState.isSubmitting} className="w-full">
            Sign In <ArrowRight size={16} />
          </Button>

          <p className="text-center text-muted text-xs">
            No account?{" "}
            <button type="button" onClick={() => switchTab("register")} className="text-[#E8C76A] hover:underline font-medium">
              Create free profile
            </button>
          </p>
        </form>
      )}

      {/* Register form */}
      {tab === "register" && regStep === "form" && (
        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={registerForm.formState.errors.email?.message}
            {...registerForm.register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
            })}
          />
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="Enter Phone Number"
            error={registerForm.formState.errors.phone?.message}
            {...registerForm.register("phone", {
              required: "Mobile number is required",
              minLength: { value: 10, message: "Enter a valid mobile number" },
            })}
          />
          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            placeholder="Min. 8 characters"
            error={registerForm.formState.errors.password?.message}
            rightIcon={
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted hover:text-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...registerForm.register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Min. 8 characters" },
            })}
          />

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded accent-[#f78222]"
                {...registerForm.register("terms", { required: true })}
              />
              <span className="text-xs text-muted">
                I agree to the{" "}
                <Link href="/terms" className="text-[#E8C76A] hover:underline">Terms</Link>
                {" "}&{" "}
                <Link href="/privacy" className="text-[#E8C76A] hover:underline">Privacy Policy</Link>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded accent-[#f78222]"
                {...registerForm.register("dpdpConsent", { required: true })}
              />
              <span className="text-xs text-muted">
                I consent to DPDP Act 2023 data processing for matchmaking
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button variant="gold" size="lg" type="submit" loading={registerForm.formState.isSubmitting} className="w-full">
            Create Free Profile <ArrowRight size={16} />
          </Button>

          <p className="text-center text-muted text-xs">
            Already registered?{" "}
            <button type="button" onClick={() => switchTab("login")} className="text-[#E8C76A] hover:underline font-medium">
              Sign in
            </button>
          </p>
        </form>
      )}

      {/* OTP step */}
      {tab === "register" && regStep === "otp" && (
        <div className="space-y-4">
          <div className="bg-[rgba(201,151,44,0.08)] border border-[rgba(201,151,44,0.2)] rounded-xl p-3 text-center">
            <div className="text-[#E8C76A] text-sm">OTP sent to <strong>{regEmail}</strong></div>
            <div className="text-muted text-xs mt-0.5">Valid for 10 minutes</div>
          </div>

          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
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
                pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit OTP" },
              })}
            />

            {error && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button variant="gold" size="lg" type="submit" loading={otpForm.formState.isSubmitting} className="w-full">
              <CheckCircle size={16} /> Verify & Continue
            </Button>
          </form>

          <div className="flex justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={resendOtp} loading={resending}>
              Resend OTP
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRegStep("form")}>
              Change Email
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
