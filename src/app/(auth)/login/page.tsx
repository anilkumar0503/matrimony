"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Heart, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Jasmine Matrimony" className="h-15 w-auto" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm">Sign in to continue your journey</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
              })}
            />

            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.password?.message}
                rightIcon={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/40 hover:text-white/70">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register("password", { required: "Password is required" })}
              />
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password" className="text-xs text-[#E8C76A] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#C9972C]"
                {...register("rememberMe")}
              />
              <span className="text-sm text-white/60">Remember me for 7 days</span>
            </label>

            {error && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button variant="gold" size="lg" type="submit" loading={isSubmitting} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#E8C76A] hover:underline font-medium">
                Create Profile
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          Admin?{" "}
          <Link href="/admin/login" className="hover:text-white/50 underline">
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
