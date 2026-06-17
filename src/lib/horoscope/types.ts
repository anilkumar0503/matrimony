export interface HoroscopeData {
  nakshatra?: string;
  rashi?: string;
  lagna?: string;
  nadi?: string;
  gana?: string;
  dosham?: string[];
  community?: string;
}

export interface GunaBreakdown {
  varna: { score: number; max: number; description: string };
  vashya: { score: number; max: number; description: string };
  tara: { score: number; max: number; description: string };
  yoni: { score: number; max: number; description: string };
  grahaMaitri: { score: number; max: number; description: string };
  gana: { score: number; max: number; description: string };
  bhakoot: { score: number; max: number; description: string };
  nadi: { score: number; max: number; description: string };
}

export interface DoshaCheck {
  hasManglikDosha: boolean;
  hasNadiDosha: boolean;
  hasBhakootDosha: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  warnings: string[];
}

export interface MatchResult {
  gunaScore: number;
  finalScore: number;
  maxScore: number;
  percentage: number;
  category: "Excellent" | "Good" | "Average" | "Poor";
  breakdown: GunaBreakdown;
  doshaCheck: DoshaCheck;
  recommendations: string[];
}
