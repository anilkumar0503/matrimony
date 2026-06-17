import { HoroscopeData, MatchResult, GunaBreakdown, DoshaCheck } from "./types";
import { calculateGunaMilan, getTotalGunaScore } from "./guna-milan";
import { checkDoshaCompatibility } from "./dosha-check";

function getMatchCategory(score: number): "Excellent" | "Good" | "Average" | "Poor" {
  if (score >= 32) return "Excellent";
  if (score >= 24) return "Good";
  if (score >= 18) return "Average";
  return "Poor";
}

function getRecommendations(breakdown: GunaBreakdown, doshaCheck: DoshaCheck): string[] {
  const recommendations: string[] = [];

  // Guna-based recommendations
  if (breakdown.nadi.score === 0) {
    recommendations.push("Nadi Dosha present - Consider performing Nadi Dosha remedies");
  }
  if (breakdown.bhakoot.score < 4) {
    recommendations.push("Bhakoot score low - May affect financial harmony");
  }
  if (breakdown.gana.score === 0) {
    recommendations.push("Opposite Gana - Temperament differences may require understanding");
  }

  // Dosha-based recommendations
  if (doshaCheck.hasManglikDosha) {
    recommendations.push("Manglik Dosha - Consider Manglik remedies or consult astrologer");
  }
  if (doshaCheck.hasNadiDosha) {
    recommendations.push("Nadi Dosha - May affect health of offspring; consult astrologer");
  }
  if (doshaCheck.hasBhakootDosha) {
    recommendations.push("Bhakoot Dosha - May affect relationship stability");
  }

  // Positive recommendations
  if (breakdown.grahaMaitri.score >= 4) {
    recommendations.push("Excellent mental compatibility - Good communication expected");
  }
  if (breakdown.yoni.score >= 3) {
    recommendations.push("Good physical compatibility - Strong attraction likely");
  }
  if (breakdown.varna.score === 1) {
    recommendations.push("Same Varna - Spiritual alignment");
  }

  return recommendations;
}

export function calculateHoroscopeMatch(userA: HoroscopeData, userB: HoroscopeData): MatchResult {
  const breakdown = calculateGunaMilan(userA, userB);
  const doshaCheck = checkDoshaCompatibility(userA, userB);

  let gunaScore = getTotalGunaScore(breakdown);
  let finalScore = gunaScore;

  // Adjust score based on doshas
  if (doshaCheck.severity === "severe") {
    finalScore -= 4; // Severe penalty for Nadi Dosha
  } else if (doshaCheck.severity === "moderate") {
    finalScore -= 2; // Moderate penalty
  } else if (doshaCheck.severity === "mild") {
    finalScore -= 1; // Mild penalty
  }

  // Ensure score doesn't go below 0
  finalScore = Math.max(0, finalScore);

  const maxScore = 36;
  const percentage = (finalScore / maxScore) * 100;
  const category = getMatchCategory(finalScore);
  const recommendations = getRecommendations(breakdown, doshaCheck);

  return {
    gunaScore,
    finalScore,
    maxScore,
    percentage: Math.round(percentage),
    category,
    breakdown,
    doshaCheck,
    recommendations,
  };
}

// Calculate match score for a user against multiple profiles
export function calculateBatchMatches(
  user: HoroscopeData,
  profiles: HoroscopeData[]
): Array<{ profile: HoroscopeData; match: MatchResult }> {
  return profiles.map((profile) => ({
    profile,
    match: calculateHoroscopeMatch(user, profile),
  }));
}

// Filter profiles by minimum match score
export function filterByMatchScore(
  matches: Array<{ profile: HoroscopeData; match: MatchResult }>,
  minScore: number
): Array<{ profile: HoroscopeData; match: MatchResult }> {
  return matches.filter(({ match }) => match.finalScore >= minScore);
}

// Sort matches by score (highest first)
export function sortMatchesByScore(
  matches: Array<{ profile: HoroscopeData; match: MatchResult }>
): Array<{ profile: HoroscopeData; match: MatchResult }> {
  return [...matches].sort((a, b) => b.match.finalScore - a.match.finalScore);
}
