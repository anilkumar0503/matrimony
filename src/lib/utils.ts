import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateAge(dob: Date | string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function validateAge(dob: Date | string, gender: "MALE" | "FEMALE"): boolean {
  const age = calculateAge(dob);
  return gender === "FEMALE" ? age >= 18 : age >= 21;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}****@${domain}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");
}

export function calcGST(amount: number, gstRate: number, customerState?: string, platformState = "Tamil Nadu") {
  const gstAmount = (amount * gstRate) / 100;
  const isIGST = customerState && customerState !== platformState;
  if (isIGST) return { igst: gstAmount, cgst: 0, sgst: 0, total: amount + gstAmount };
  return { igst: 0, cgst: gstAmount / 2, sgst: gstAmount / 2, total: amount + gstAmount };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + "…" : text;
}

export function getProfileCompletionPct(profile: Record<string, unknown>): number {
  const fields = [
    "fullName", "height", "complexion", "motherTongue", "religion",
    "caste", "city", "state", "aboutMe", "maritalStatus",
    "fatherName", "motherName", "familyType", "qualification",
    "occupationType", "annualIncome",
  ];
  const filled = fields.filter((f) => profile[f] !== null && profile[f] !== undefined && profile[f] !== "").length;
  return Math.round((filled / fields.length) * 100);
}
