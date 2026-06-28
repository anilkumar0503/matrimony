"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/theme-toggle";

interface LoginForm { email: string; password: string }

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      localStorage.setItem("adminAccessToken", json.data.accessToken);
      localStorage.setItem("adminRefreshToken", json.data.refreshToken);
      localStorage.setItem("adminInfo", JSON.stringify({ name: json.data.admin.name, role: json.data.admin.role }));
      router.push("/admin/dashboard");
    } catch { setError("Login failed. Please try again."); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background transition-colors duration-300">
      {/* Theme toggle top-right */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gradient-maroon)] to-[var(--gradient-gold)] flex items-center justify-center mx-auto mb-5">
            <Shield size={24} className="text-[var(--icon-on-gradient)]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted text-sm">Authorized personnel only</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com" 
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email", { required: "Email is required" })}
            />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register("password", { required: "Password is required" })}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <Button variant="gold" size="lg" type="submit" loading={isSubmitting} className="w-full">
              <Shield size={16} /> Sign In to Admin
            </Button>
          </form>

          <p className="text-center text-muted text-xs mt-6">
            All admin actions are logged for compliance &amp; audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
