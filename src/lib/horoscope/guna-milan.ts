import { HoroscopeData, GunaBreakdown } from "./types";

// Varna (1 point) - Based on caste/occupation categories
// Categories: Brahmin, Kshatriya, Vaishya, Shudra
const VARNA_MAP: Record<string, number> = {
  "Brahmin": 1,
  "Kshatriya": 2,
  "Vaishya": 3,
  "Shudra": 4,
};

function calculateVarna(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  // If varna data not available, give neutral score
  const varnaA = userA.community || "";
  const varnaB = userB.community || "";
  
  if (!varnaA || !varnaB) {
    return { score: 0, max: 1, description: "Varna data not available" };
  }

  // Same varna gets 1 point
  if (varnaA === varnaB) {
    return { score: 1, max: 1, description: "Same Varna - Excellent spiritual compatibility" };
  }

  // Different varna gets 0
  return { score: 0, max: 1, description: "Different Varna - May need adjustment" };
}

// Vashya (2 points) - Based on attraction/control
// Categories: Chatuspad, Jalchar, Keet, Vanchar, Tarush
const VASHYA_MAP: Record<string, string> = {
  "Aries": "Chatuspad",
  "Taurus": "Chatuspad",
  "Gemini": "Jalchar",
  "Cancer": "Keet",
  "Leo": "Vanchar",
  "Virgo": "Keet",
  "Libra": "Vanchar",
  "Scorpio": "Keet",
  "Sagittarius": "Chatuspad",
  "Capricorn": "Vanchar",
  "Aquarius": "Jalchar",
  "Pisces": "Jalchar",
};

function calculateVashya(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const rashiA = userA.rashi || "";
  const rashiB = userB.rashi || "";
  
  if (!rashiA || !rashiB) {
    return { score: 0, max: 2, description: "Rashi data not available" };
  }

  const vashyaA = VASHYA_MAP[rashiA] || "";
  const vashyaB = VASHYA_MAP[rashiB] || "";

  // Both in same category - 2 points
  if (vashyaA === vashyaB) {
    return { score: 2, max: 2, description: "Same Vashya - Strong mutual attraction" };
  }

  // One controls the other - 1 point
  const controlMap: Record<string, string[]> = {
    "Chatuspad": ["Vanchar"],
    "Vanchar": ["Chatuspad"],
    "Jalchar": ["Jalchar"],
    "Keet": ["Keet"],
  };

  if (controlMap[vashyaA]?.includes(vashyaB) || controlMap[vashyaB]?.includes(vashyaA)) {
    return { score: 1, max: 2, description: "Partial Vashya - Some attraction" };
  }

  return { score: 0, max: 2, description: "No Vashya match - May lack attraction" };
}

// Tara (3 points) - Based on birth star (nakshatra) compatibility
// 27 Nakshatras divided into 3 groups of 9
const NAKSHATRA_LIST = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati"
];

function calculateTara(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const nakshatraA = userA.nakshatra || "";
  const nakshatraB = userB.nakshatra || "";
  
  if (!nakshatraA || !nakshatraB) {
    return { score: 0, max: 3, description: "Nakshatra data not available" };
  }

  const indexA = NAKSHATRA_LIST.indexOf(nakshatraA);
  const indexB = NAKSHATRA_LIST.indexOf(nakshatraB);

  if (indexA === -1 || indexB === -1) {
    return { score: 0, max: 3, description: "Invalid Nakshatra" };
  }

  // Calculate Tara (difference in nakshatra positions)
  const diff = Math.abs(indexA - indexB) % 9;
  
  // Friendly Tara (3 points)
  if (diff === 0 || diff === 3 || diff === 6) {
    return { score: 3, max: 3, description: "Friendly Tara - Excellent birth star compatibility" };
  }
  
  // Neutral Tara (1.5 points)
  if (diff === 1 || diff === 2 || diff === 4 || diff === 5 || diff === 7 || diff === 8) {
    return { score: 1.5, max: 3, description: "Neutral Tara - Average birth star compatibility" };
  }

  return { score: 0, max: 3, description: "No Tara match - Birth star incompatibility" };
}

// Yoni (4 points) - Based on animal nature of nakshatras
const YONI_MAP: Record<string, string> = {
  "Ashwini": "Horse", "Shatabhisha": "Horse",
  "Bharani": "Elephant", "Revati": "Elephant",
  "Krittika": "Sheep", "Pushya": "Sheep",
  "Rohini": "Serpent", "Dhanishta": "Serpent",
  "Mrigashira": "Serpent", "Anuradha": "Serpent",
  "Ardra": "Dog", "Mula": "Dog",
  "Punarvasu": "Cat", "Ashlesha": "Cat",
  "Magha": "Rat", "Purva Phalguni": "Rat",
  "Uttara Phalguni": "Rat", "Purva Ashadha": "Rat",
  "Hasta": "Buffalo", "Swati": "Buffalo",
  "Chitra": "Tiger", "Vishakha": "Tiger",
  "Jyeshtha": "Deer", "Uttara Ashadha": "Deer",
  "Shravana": "Monkey", "Purva Bhadrapada": "Monkey",
  "Uttara Bhadrapada": "Cow",
};

function calculateYoni(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const nakshatraA = userA.nakshatra || "";
  const nakshatraB = userB.nakshatra || "";
  
  if (!nakshatraA || !nakshatraB) {
    return { score: 0, max: 4, description: "Nakshatra data not available" };
  }

  const yoniA = YONI_MAP[nakshatraA] || "";
  const yoniB = YONI_MAP[nakshatraB] || "";

  // Same Yoni - 4 points (excellent physical compatibility)
  if (yoniA === yoniB) {
    return { score: 4, max: 4, description: "Same Yoni - Excellent physical compatibility" };
  }

  // Enemy Yoni pairs - 0 points
  const enemyPairs: Record<string, string[]> = {
    "Horse": ["Buffalo"],
    "Elephant": ["Lion", "Tiger"],
    "Sheep": ["Tiger"],
    "Serpent": ["Eagle", "Mongoose"],
    "Dog": ["Cat", "Rabbit"],
    "Cat": ["Dog", "Snake"],
    "Rat": ["Cat", "Snake", "Eagle"],
    "Buffalo": ["Horse"],
    "Tiger": ["Elephant", "Sheep"],
    "Deer": ["Lion", "Tiger"],
    "Monkey": ["Snake"],
    "Cow": ["Tiger"],
  };

  if (enemyPairs[yoniA]?.includes(yoniB) || enemyPairs[yoniB]?.includes(yoniA)) {
    return { score: 0, max: 4, description: "Enemy Yoni - Physical incompatibility" };
  }

  // Neutral Yoni - 2 points
  return { score: 2, max: 4, description: "Neutral Yoni - Average physical compatibility" };
}

// Graha Maitri (5 points) - Based on planetary friendship of rashis
const GRAHA_MAITRI_MAP: Record<string, string> = {
  "Aries": "Mars",
  "Taurus": "Venus",
  "Gemini": "Mercury",
  "Cancer": "Moon",
  "Leo": "Sun",
  "Virgo": "Mercury",
  "Libra": "Venus",
  "Scorpio": "Mars",
  "Sagittarius": "Jupiter",
  "Capricorn": "Saturn",
  "Aquarius": "Saturn",
  "Pisces": "Jupiter",
};

const PLANET_FRIENDSHIP: Record<string, string[]> = {
  "Sun": ["Moon", "Mars", "Jupiter"],
  "Moon": ["Sun", "Mercury"],
  "Mars": ["Sun", "Moon", "Jupiter"],
  "Mercury": ["Sun", "Venus"],
  "Jupiter": ["Sun", "Moon", "Mars"],
  "Venus": ["Mercury", "Saturn"],
  "Saturn": ["Venus", "Mercury"],
};

function calculateGrahaMaitri(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const rashiA = userA.rashi || "";
  const rashiB = userB.rashi || "";
  
  if (!rashiA || !rashiB) {
    return { score: 0, max: 5, description: "Rashi data not available" };
  }

  const planetA = GRAHA_MAITRI_MAP[rashiA] || "";
  const planetB = GRAHA_MAITRI_MAP[rashiB] || "";

  if (!planetA || !planetB) {
    return { score: 0, max: 5, description: "Invalid planet mapping" };
  }

  // Same planet - 5 points
  if (planetA === planetB) {
    return { score: 5, max: 5, description: "Same ruling planet - Excellent mental compatibility" };
  }

  // Friendly planets - 4 points
  if (PLANET_FRIENDSHIP[planetA]?.includes(planetB) || PLANET_FRIENDSHIP[planetB]?.includes(planetA)) {
    return { score: 4, max: 5, description: "Friendly planets - Good mental compatibility" };
  }

  // Neutral - 2.5 points
  return { score: 2.5, max: 5, description: "Neutral planets - Average mental compatibility" };
}

// Gana (6 points) - Based on temperament (Dev, Manush, Rakshas)
const GANA_MAP: Record<string, string[]> = {
  "Dev": ["Ashwini", "Punarvasu", "Pushya", "Hasta", "Swati", "Shravana", "Revati"],
  "Manush": ["Bharani", "Rohini", "Ardra", "Purva Phalguni", "Uttara Phalguni", "Purva Ashadha", "Uttara Ashadha", "Shatabhisha"],
  "Rakshas": ["Krittika", "Mrigashira", "Ashlesha", "Magha", "Chitra", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Dhanishta", "Purva Bhadrapada", "Uttara Bhadrapada"],
};

function getGanaFromNakshatra(nakshatra: string): string {
  for (const [gana, nakshatras] of Object.entries(GANA_MAP)) {
    if (nakshatras.includes(nakshatra)) return gana;
  }
  return "Manush"; // Default
}

function calculateGana(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const nakshatraA = userA.nakshatra || "";
  const nakshatraB = userB.nakshatra || "";
  
  if (!nakshatraA || !nakshatraB) {
    return { score: 0, max: 6, description: "Nakshatra data not available" };
  }

  const ganaA = userA.gana || getGanaFromNakshatra(nakshatraA);
  const ganaB = userB.gana || getGanaFromNakshatra(nakshatraB);

  // Same Gana - 6 points
  if (ganaA === ganaB) {
    return { score: 6, max: 6, description: "Same Gana - Excellent temperament match" };
  }

  // Dev + Manush or Manush + Rakshas - 4 points
  if (
    (ganaA === "Dev" && ganaB === "Manush") ||
    (ganaA === "Manush" && ganaB === "Dev") ||
    (ganaA === "Manush" && ganaB === "Rakshas") ||
    (ganaA === "Rakshas" && ganaB === "Manush")
  ) {
    return { score: 4, max: 6, description: "Compatible Gana - Good temperament match" };
  }

  // Dev + Rakshas - 0 points (worst match)
  return { score: 0, max: 6, description: "Opposite Gana - Temperament mismatch" };
}

// Bhakoot (7 points) - Based on Rashi positions (12 rashis)
const RASHI_LIST = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function calculateBhakoot(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const rashiA = userA.rashi || "";
  const rashiB = userB.rashi || "";
  
  if (!rashiA || !rashiB) {
    return { score: 0, max: 7, description: "Rashi data not available" };
  }

  const indexA = RASHI_LIST.indexOf(rashiA);
  const indexB = RASHI_LIST.indexOf(rashiB);

  if (indexA === -1 || indexB === -1) {
    return { score: 0, max: 7, description: "Invalid Rashi" };
  }

  // Calculate difference
  const diff = Math.abs(indexA - indexB);
  const oppositeDiff = 12 - diff;

  // Friendly positions (1-2-12, 5-9, 7-11) - 7 points
  if (diff === 1 || diff === 2 || diff === 11 || diff === 12 || diff === 4 || diff === 8 || diff === 6 || diff === 10) {
    return { score: 7, max: 7, description: "Friendly Rashi position - Excellent love & prosperity" };
  }

  // Neutral - 3.5 points
  return { score: 3.5, max: 7, description: "Neutral Rashi position - Average compatibility" };
}

// Nadi (8 points) - Based on Nadi type (Adi, Madhya, Antya)
const NADI_MAP: Record<string, string[]> = {
  "Adi": ["Ashwini", "Bharani", "Krittika", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
  "Madhya": ["Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
  "Antya": ["Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
};

function getNadiFromNakshatra(nakshatra: string): string {
  // Simplified mapping - in production, use proper vedic calculation
  for (const [nadi, nakshatras] of Object.entries(NADI_MAP)) {
    if (nakshatras.includes(nakshatra)) return nadi;
  }
  return "Madhya"; // Default
}

function calculateNadi(userA: HoroscopeData, userB: HoroscopeData): { score: number; max: number; description: string } {
  const nakshatraA = userA.nakshatra || "";
  const nakshatraB = userB.nakshatra || "";
  
  if (!nakshatraA || !nakshatraB) {
    return { score: 0, max: 8, description: "Nakshatra data not available" };
  }

  const nadiA = userA.nadi || getNadiFromNakshatra(nakshatraA);
  const nadiB = userB.nadi || getNadiFromNakshatra(nakshatraB);

  // Different Nadi - 8 points (excellent)
  if (nadiA !== nadiB) {
    return { score: 8, max: 8, description: "Different Nadi - Excellent health/genetic compatibility" };
  }

  // Same Nadi - 0 points (Nadi Dosha)
  return { score: 0, max: 8, description: "Same Nadi - Nadi Dosha (health incompatibility)" };
}

// Main Guna Milan calculation
export function calculateGunaMilan(userA: HoroscopeData, userB: HoroscopeData): GunaBreakdown {
  return {
    varna: calculateVarna(userA, userB),
    vashya: calculateVashya(userA, userB),
    tara: calculateTara(userA, userB),
    yoni: calculateYoni(userA, userB),
    grahaMaitri: calculateGrahaMaitri(userA, userB),
    gana: calculateGana(userA, userB),
    bhakoot: calculateBhakoot(userA, userB),
    nadi: calculateNadi(userA, userB),
  };
}

export function getTotalGunaScore(breakdown: GunaBreakdown): number {
  return Object.values(breakdown).reduce((sum, g) => sum + g.score, 0);
}
