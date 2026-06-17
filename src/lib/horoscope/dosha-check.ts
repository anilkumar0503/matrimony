import { HoroscopeData, DoshaCheck } from "./types";

// Manglik Dosha - Mars in specific houses (1, 4, 7, 8, 12)
// Simplified check based on dosham array
function checkManglikDosha(userA: HoroscopeData, userB: HoroscopeData): { hasDosha: boolean; severity: "none" | "mild" | "moderate" | "severe"; description: string } {
  const doshamA = userA.dosham || [];
  const doshamB = userB.dosham || [];

  const manglikA = doshamA.includes("Manglik") || doshamA.includes("Mangal");
  const manglikB = doshamB.includes("Manglik") || doshamB.includes("Mangal");

  // Both Manglik - acceptable (cancels out)
  if (manglikA && manglikB) {
    return { hasDosha: false, severity: "none", description: "Both partners are Manglik - Dosha cancels out" };
  }

  // One Manglik - partial match
  if (manglikA || manglikB) {
    return { hasDosha: true, severity: "moderate", description: "One partner is Manglik - May require remedies" };
  }

  return { hasDosha: false, severity: "none", description: "No Manglik Dosha" };
}

// Nadi Dosha - Same Nadi type
function checkNadiDosha(userA: HoroscopeData, userB: HoroscopeData): { hasDosha: boolean; severity: "none" | "mild" | "moderate" | "severe"; description: string } {
  const nadiA = userA.nadi;
  const nadiB = userB.nadi;

  if (!nadiA || !nadiB) {
    return { hasDosha: false, severity: "none", description: "Nadi data not available" };
  }

  // Same Nadi - Nadi Dosha (severe)
  if (nadiA === nadiB) {
    return { hasDosha: true, severity: "severe", description: "Same Nadi - Nadi Dosha (health/genetic incompatibility)" };
  }

  return { hasDosha: false, severity: "none", description: "Different Nadi - No Nadi Dosha" };
}

// Bhakoot Dosha - Based on Rashi positions (6-8 or 2-12 relationship)
const RASHI_LIST = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function checkBhakootDosha(userA: HoroscopeData, userB: HoroscopeData): { hasDosha: boolean; severity: "none" | "mild" | "moderate" | "severe"; description: string } {
  const rashiA = userA.rashi;
  const rashiB = userB.rashi;

  if (!rashiA || !rashiB) {
    return { hasDosha: false, severity: "none", description: "Rashi data not available" };
  }

  const indexA = RASHI_LIST.indexOf(rashiA);
  const indexB = RASHI_LIST.indexOf(rashiB);

  if (indexA === -1 || indexB === -1) {
    return { hasDosha: false, severity: "none", description: "Invalid Rashi" };
  }

  const diff = Math.abs(indexA - indexB);

  // 6-8 or 2-12 relationship - Bhakoot Dosha
  if (diff === 6 || diff === 8 || diff === 2 || diff === 10) {
    return { hasDosha: true, severity: "moderate", description: "Bhakoot Dosha - May affect financial/relationship harmony" };
  }

  return { hasDosha: false, severity: "none", description: "No Bhakoot Dosha" };
}

// Main Dosha check function
export function checkDoshaCompatibility(userA: HoroscopeData, userB: HoroscopeData): DoshaCheck {
  const manglik = checkManglikDosha(userA, userB);
  const nadi = checkNadiDosha(userA, userB);
  const bhakoot = checkBhakootDosha(userA, userB);

  const warnings: string[] = [];
  if (manglik.hasDosha) warnings.push(manglik.description);
  if (nadi.hasDosha) warnings.push(nadi.description);
  if (bhakoot.hasDosha) warnings.push(bhakoot.description);

  // Determine overall severity
  let severity: "none" | "mild" | "moderate" | "severe" = "none";
  if (nadi.severity === "severe") {
    severity = "severe";
  } else if (manglik.severity === "moderate" || bhakoot.severity === "moderate") {
    severity = "moderate";
  } else if (warnings.length > 0) {
    severity = "mild";
  }

  return {
    hasManglikDosha: manglik.hasDosha,
    hasNadiDosha: nadi.hasDosha,
    hasBhakootDosha: bhakoot.hasDosha,
    severity,
    warnings,
  };
}
