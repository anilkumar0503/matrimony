"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  User, Heart, Briefcase, Users, MapPin, BookOpen, Home,
  Utensils, Star, Target, Edit2, CheckCircle, X, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const MARITAL_STATUS = ["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"];
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"];
const FAMILY_TYPES = ["NUCLEAR", "JOINT"];
const FAMILY_VALUES = ["TRADITIONAL", "MODERATE", "LIBERAL"];
const BLOOD_GROUPS = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"];
const PHYSICAL_STATUS = ["NORMAL", "PHYSICALLY_CHALLENGED"];
const DIET = ["VEGETARIAN", "NON_VEGETARIAN", "EGGETARIAN", "VEGAN"];
const SMOKING = ["NO", "YES", "OCCASIONALLY"];
const DRINKING = ["NO", "YES", "OCCASIONALLY", "SOCIAL"];
const FITNESS_LEVEL = ["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "ATHLETE"];
const SLEEP_SCHEDULE = ["EARLY_BIRD", "NIGHT_OWL", "IRREGULAR"];
const PERSONALITY_TYPE = ["INTROVERT", "EXTROVERT", "AMBIVERT"];
const EMPLOYMENT_TYPE = ["FULL_TIME", "PART_TIME", "SELF_EMPLOYED", "FREELANCE", "CONTRACT", "BUSINESS_OWNER", "RETIRED", "STUDENT", "HOMEMAKER", "UNEMPLOYED"];
const PROFILE_CREATED_BY = ["SELF", "PARENT", "SIBLING", "RELATIVE", "FRIEND"];

const COMPLEXION = ["Very Fair", "Fair", "Wheatish", "Dusky", "Dark"];
const GOTHRAM = ["Bharadwaja", "Angirasa", "Kashyapa", "Vasistha", "Atri", "Vishvamitra", "Jamadagni", "Bhrigu", "Other"];
const NAKSHATRA = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const RASHI = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const LAGNA = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const NADI = ["Adi", "Madhya", "Antya"];
const GANA = ["Deva", "Manushya", "Rakshasa"];
const YONI = ["Simha", "Gaja", "Ashwa", "Marjar", "Mesha", "Vyaghra", "Mriga", "Go", "Mahisha", "Sarpa", "Nakula", "Shardula", "Vanar", "Lava"];
const RAJJU = ["Sarp", "Brahma", "Deva", "Manushya", "Chandra", "Gandharva", "Skanda", "Yama", "Naga"];
const MAHENDRA = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const VEDHA = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const DOSHAM = ["No Dosham", "Chevvai Dosham", "Rahu Dosham", "Ketu Dosham", "Kala Sarpa Dosham", "Other"];
const COMMUNITY_HINDU = ["Brahmin", "Kshatriya", "Vaishya", "Shudra", "Other"];
const COMMUNITY_MUSLIM = ["Sunni", "Shia", "Bohra", "Memon", "Other"];
const COMMUNITY_CHRISTIAN = ["Catholic", "Protestant", "Anglican", "Marthoma", "Other"];
const MOTHER_TONGUES = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "Marathi", "Gujarati", "Bengali", "Punjabi", "Urdu", "Odia", "Assamese", "Konkani", "Sindhi", "Nepali", "English", "Other"];
const LANGUAGES_KNOWN = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "Marathi", "Gujarati", "Bengali", "Punjabi", "Urdu", "Odia", "Assamese", "Konkani", "Sindhi", "Nepali", "Sanskrit", "English", "Other"];
const EDUCATION_LEVELS = ["10th", "12th", "Diploma", "Bachelor's", "Master's", "PhD", "Professional", "Other"];
const INDUSTRIES = ["IT/Software", "Banking/Finance", "Healthcare", "Education", "Manufacturing", "Government/PSU", "Business/Self-employed", "Agriculture", "Defence", "Engineering", "Legal", "Media/Entertainment", "Real Estate", "Hospitality", "Other"];
const STATES_INDIA = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Other"
];
const EXERCISE_HABITS = ["Gym", "Yoga", "Running", "Walking", "Swimming", "Cycling", "Sports", "Home Workout", "None", "Other"];
const WORK_STATES = STATES_INDIA;

const STATE_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kakinada", "Rajahmundry", "Nellore", "Kurnool", "Anantapur", "Kadapa", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Madanapalle", "Tadipatri", "Tenali", "Gudivada", "Amalapuram", "Bapatla", "Srikakulam", "Adoni", "Narasaraopet", "Other"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Tawang", "Bomdila", "Ziro", "Along", "Daporijo", "Anini", "Khonsa", "Seppa", "Yingkiong", "Tezu", "Changlang", "Other"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Diphu", "Karimganj", "Sivasagar", "Lakhimpur", "Nalbari", "Barpeta", "Goalpara", "Marigaon", "Hojai", "Morigaon", "Kokrajhar", "Other"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Sasaram", "Hajipur", "Dehri", "Saharsa", "Sitamarhi", "Motihari", "Bettiah", "Gopalganj", "Siwan", "Kishanganj", "Jamui", "Jehanabad", "Aurangabad", "Lakhisarai", "Nawada", "Bagaha", "Araria", "Sheikhpura", "Banka", "Other"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund", "Dhamtari", "Champa", "Naila", "Janjgir", "Kawardha", "Sakti", "Other"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Cuncolim", "Quepem", "Pernem", "Valpoi", "Canacona", "Sanguem", "Other"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Bharuch", "Navsari", "Porbandar", "Surendranagar", "Bhuj", "Veraval", "Godhra", "Palanpur", "Valsad", "Ankleshwar", "Morbi", "Gandhidham", "Nadiad", "Mehsana", "Dwarka", "Palitana", "Other"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak", "Hisar", "Sonipat", "Yamunanagar", "Panchkula", "Bhiwani", "Bahadurgarh", "Jind", "Sirsa", "Thanesar", "Kaithal", "Rewari", "Hansi", "Narnaul", "Fatehabad", "Palwal", "Other"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Kullu", "Manali", "Bilaspur", "Una", "Hamirpur", "Chamba", "Kangra", "Nahan", "Sundarnagar", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Dumka", "Chaibasa", "Ramgarh", "Jharia", "Medininagar", "Chakradharpur", "Phusro", "Sahebganj", "Jamtara", "Rajmahal", "Godda", "Pakur", "Other"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli-Dharwad", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Vijayapura", "Shimoga", "Tumkur", "Raichur", "Kolar", "Mandya", "Hassan", "Chitradurga", "Udupi", "Ranebennur", "Dharwad", "Koppal", "Other"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Palakkad", "Kannur", "Kottayam", "Alappuzha", "Malappuram", "Kasaragod", "Ernakulam", "Idukki", "Pathanamthitta", "Wayanad", "Other"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Umaria", "Shivpuri", "Chhindwara", "Itarsi", "Guna", "Sehore", "Vidisha", "Sarni", "Mandsaur", "Other"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Kolhapur", "Miraj", "Amravati", "Nanded", "Malegaon", "Jalgaon", "Latur", "Dhule", "Akola", "Chandrapur", "Parbhani", "Jalna", "Bhusawal", "Nandurbar", "Yavatmal", "Wardha", "Gondia", "Bhandara", "Hinganghat", "Other"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong", "Chandel", "Noney", "Jiribam", "Moirang", "Mayang Imphal", "Other"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara", "Williamnagar", "Resubelpara", "Ampati", "Mawkyrwat", "Khliehriat", "Other"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Mamit", "Lawngtlai", "Saitual", "Hnahthial", "Khawzawl", "Other"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Kiphire", "Phek", "Longleng", "Peren", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Puri", "Sambalpur", "Jharsuguda", "Baripada", "Balasore", "Bhadrak", "Jatani", "Angul", "Kendrapara", "Dhenkanal", "Koraput", "Rayagada", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Batala", "Pathankot", "Moga", "Firozpur", "Abohar", "Kapurthala", "Hoshiarpur", "Nabha", "Malerkotla", "Phagwara", "Rupnagar", "Sangrur", "Khanna", "Other"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Pali", "Bharatpur", "Sriganganagar", "Tonk", "Churu", "Baran", "Dholpur", "Nagaur", "Jhunjhunu", "Bundi", "Sawai Madhopur", "Chittorgarh", "Dausa", "Hanumangarh", "Karauli", "Pratapgarh", "Sirohi", "Other"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Singtam", "Rangpo", "Jorethang", "Pakyong", "Ravangla", "Other"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Tiruppur", "Rajapalayam", "Sivakasi", "Thanjavur", "Nagercoil", "Kumbakonam", "Cuddalore", "Karur", "Tiruchengode", "Pudukkottai", "Nagapattinam", "Kanchipuram", "Tiruvannamalai", "Ariyalur", "Perambalur", "Viluppuram", "Krishnagiri", "Dharmapuri", "Tirupathur", "Namakkal", "Ramanathapuram", "Virudhunagar", "Theni", "Karaikudi", "Other"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Miryalaguda", "Adilabad", "Suryapet", "Siddipet", "Jagtial", "Mancherial", "Peddapalli", "Nirmal", "Bodhan", "Kothagudem", "Medak", "Jangaon", "Bhongir", "Wanaparthy", "Kamareddy", "Sircilla", "Other"],
  "Tripura": ["Agartala", "Dharmanagar", "Kailashahar", "Udaipur", "Belonia", "Khowai", "Pratapgarh", "Ranirbazar", "Sonamura", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Firozabad", "Jhansi", "Mathura", "Rampur", "Bulandshahr", "Muzaffarnagar", "Pilibhit", "Fatehpur", "Shahjahanpur", "Sitapur", "Bijnor", "Hapur", "Etawah", "Mirzapur", "Raebareli", "Sultanpur", "Unnao", "Farrukhabad", "Hathras", "Budaun", "Other"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Kashipur", "Rishikesh", "Kotdwar", "Rudrapur", "Kichha", "Jaspur", "Ramnagar", "Srinagar", "Pauri", "Almora", "Nainital", "Other"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Kharagpur", "Shantipur", "Dankuni", "Haldia", "Berhampur", "Raiganj", "Kulti", "Medinipur", "Jalpaiguri", "Balurghat", "English Bazar", "Bolpur", "Suri", "Kanchrapara", "Barasat", "Other"],
  "Delhi": ["New Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central Delhi", "North East Delhi", "North West Delhi", "South West Delhi", "Shahdara", "Other"],
  "Other": ["Other"]
};

const CITIES_INDIA = Object.values(STATE_CITIES).flat();
const INCOME_RANGES = [
  "Below 3 LPA", "3-5 LPA", "5-7 LPA", "7-10 LPA", "10-15 LPA", "15-20 LPA", "20-25 LPA",
  "25-30 LPA", "30-40 LPA", "40-50 LPA", "50-75 LPA", "75 LPA+", "Not Disclosing"
];
const INDIAN_FOOD = [
  "Biryani", "Dosa", "Idli", "Sambar", "Rasam", "Chole Bhature", "Paneer Tikka", "Butter Chicken",
  "Samosa", "Poha", "Upma", "Vada Pav", "Pav Bhaji", "Misal Pav", "Thali", "Rajma Chawal",
  "Dal Makhani", "Roti/Naan", "Curry", "South Indian", "North Indian", "Gujarati", "Bengali",
  "Punjabi", "Maharashtrian", "Kerala", "Andhra", "Chettinad", "Hyderabadi", "Mughlai", "Continental", "Chinese", "Other"
];
const INDIAN_MOVIES = [
  "Bollywood", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Punjabi", "Hollywood", "Other"
];
const INDIAN_MUSIC = [
  "Bollywood", "Carnatic", "Hindustani Classical", "Ghazals", "Devotional", "Folk", "Western Pop", "Other"
];
const INDIAN_BOOKS = [
  "Fiction", "Non-fiction", "Self-help", "Spiritual/Religious", "Biography", "History", "Science", "Other"
];
const INDIAN_TRAVEL = [
  "Hill Stations", "Beaches", "Historical Places", "Pilgrimage", "Wildlife", "Adventure", "International", "Other"
];

const INTERESTS_OPTIONS = [
  "Technology", "Business", "Reading", "Writing", "Traveling", 
  "Photography", "Cooking", "Gardening", "Social Service", 
  "Spiritual Activities", "Investing", "Entrepreneurship"
];

const HOBBIES_OPTIONS = [
  "Cricket", "Football", "Chess", "Music", "Singing", "Dancing",
  "Movies", "Trekking", "Cycling", "Painting", "Drawing", "Yoga", "Swimming", "Gaming"
];

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { id: "basic", label: "Basic Information", icon: User },
  { id: "contact", label: "Contact & Location", icon: MapPin },
  { id: "religion", label: "Religion & Community", icon: Star },
  { id: "horoscope", label: "Horoscope / Astrology", icon: Target },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "career", label: "Career & Professional", icon: Briefcase },
  { id: "family", label: "Family Details", icon: Users },
  { id: "lifestyle", label: "Lifestyle", icon: Utensils },
  { id: "interests", label: "Interests & Hobbies", icon: Heart },
  { id: "favorites", label: "Favorites", icon: Sparkles },
  { id: "personality", label: "Personality & Values", icon: User },
  { id: "assets", label: "Assets", icon: Home },
  { id: "partner", label: "Partner Preferences", icon: Heart },
];

type Profile = Record<string, any>;

// ─── Helper to display a value row ───────────────────────────────────────────
function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-foreground font-medium text-right max-w-[55%]">{String(value).replace(/_/g, " ")}</span>
    </div>
  );
}

// ─── Section View Card ────────────────────────────────────────────────────────
function SectionCard({
  section, profile, onEdit,
}: { section: typeof SECTIONS[0]; profile: Profile; onEdit: () => void }) {
  const Icon = section.icon;
  const hasData = getHasData(section.id, profile);

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgba(201,151,44,0.12)] flex items-center justify-center">
            <Icon size={15} className="text-[#C9972C]" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">{section.label}</h3>
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-muted hover:text-[#C9972C] hover:bg-[rgba(201,151,44,0.08)] transition-colors"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
      </div>

      {!hasData ? (
        <button
          onClick={onEdit}
          className="text-sm text-[#C9972C] hover:underline"
        >
          + Add Details
        </button>
      ) : (
        <div className="space-y-0">
          <SectionRows sectionId={section.id} profile={profile} />
        </div>
      )}
    </div>
  );
}

function getHasData(sectionId: string, p: Profile): boolean {
  const checks: Record<string, string[]> = {
    basic: ["fullName", "firstName", "maritalStatus", "height"],
    contact: ["city", "state", "country", "currentAddress"],
    religion: ["religion", "caste", "motherTongue"],
    horoscope: ["rashi", "nakshatra", "lagna", "timeOfBirth"],
    education: ["qualification", "degree", "university"],
    career: ["occupation", "companyName", "annualIncome"],
    family: ["fatherName", "motherName", "familyType"],
    lifestyle: ["diet", "smoking", "drinking"],
    interests: ["interests", "hobbies"],
    favorites: ["favoriteFood", "favoriteMovie", "favoriteMusicGenre"],
    personality: ["personalityType", "futureGoals", "partnerExpectations"],
    assets: ["ownHouse", "ownFlat", "vehicleDetails"],
    partner: ["ageMin", "ageMax", "religion_pref"],
  };
  return (checks[sectionId] || []).some((k) => p[k] != null && p[k] !== "" && p[k] !== false);
}

function SectionRows({ sectionId, profile: p }: { sectionId: string; profile: Profile }) {
  const fmt = (v: any) => Array.isArray(v) ? v.join(", ") : v;
  switch (sectionId) {
    case "basic": return (<>
      <Row label="Full Name" value={[p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || p.fullName} />
      <Row label="Marital Status" value={p.maritalStatus} />
      <Row label="Height" value={p.height ? `${p.height} cm` : null} />
      <Row label="Weight" value={p.weight ? `${p.weight} kg` : null} />
      <Row label="Blood Group" value={p.bloodGroup} />
      <Row label="Physical Status" value={p.physicalStatus} />
      <Row label="Complexion" value={p.complexion} />
      {p.aboutMe && <p className="text-sm text-muted mt-2 line-clamp-2">{p.aboutMe}</p>}
    </>);
    case "contact": return (<>
      <Row label="City" value={p.city} />
      <Row label="State" value={p.state} />
      <Row label="Country" value={p.country} />
      <Row label="Postal Code" value={p.postalCode} />
      <Row label="Alternate Phone" value={p.alternatePhone} />
    </>);
    case "religion": return (<>
      <Row label="Religion" value={p.religion} />
      <Row label="Community" value={p.community} />
      <Row label="Caste" value={p.caste} />
      <Row label="Sub Caste" value={p.subCaste} />
      <Row label="Gothram" value={p.gothram} />
      <Row label="Mother Tongue" value={p.motherTongue} />
      {p.languagesKnown?.length > 0 && <Row label="Languages Known" value={fmt(p.languagesKnown)} />}
    </>);
    case "horoscope": return (<>
      <Row label="Rashi" value={p.rashi} />
      <Row label="Nakshatra" value={p.nakshatra} />
      <Row label="Lagna" value={p.lagna} />
      <Row label="Nadi" value={p.nadi} />
      <Row label="Gana" value={p.gana} />
      <Row label="Dosham" value={fmt(p.dosham)} />
      <Row label="Time of Birth" value={p.timeOfBirth} />
      <Row label="Place of Birth" value={p.placeOfBirth} />
    </>);
    case "education": return (<>
      <Row label="Qualification" value={p.qualification} />
      <Row label="Degree" value={p.degree} />
      <Row label="Specialization" value={p.specialization} />
      <Row label="College" value={p.collegeName} />
      <Row label="University" value={p.university} />
      <Row label="Passing Year" value={p.passingYear} />
    </>);
    case "career": return (<>
      <Row label="Occupation" value={p.occupation} />
      <Row label="Designation" value={p.designation} />
      <Row label="Company" value={p.companyName} />
      <Row label="Industry" value={p.industry} />
      <Row label="Employment Type" value={p.employmentType} />
      <Row label="Annual Income" value={p.annualIncome} />
      <Row label="Work Location" value={p.workLocation} />
    </>);
    case "family": return (<>
      <Row label="Father's Name" value={p.fatherName} />
      <Row label="Father's Occupation" value={p.fatherOccupation} />
      <Row label="Mother's Name" value={p.motherName} />
      <Row label="Mother's Occupation" value={p.motherOccupation} />
      <Row label="Brothers" value={p.brothersCount} />
      <Row label="Sisters" value={p.sistersCount} />
      <Row label="Family Type" value={p.familyType} />
      <Row label="Family Values" value={p.familyValues} />
      <Row label="Family Status" value={p.familyStatus} />
    </>);
    case "lifestyle": return (<>
      <Row label="Diet" value={p.diet} />
      <Row label="Smoking" value={p.smoking} />
      <Row label="Drinking" value={p.drinking} />
      <Row label="Fitness Level" value={p.fitnessLevel} />
      <Row label="Exercise Habits" value={p.exerciseHabits} />
      <Row label="Sleep Schedule" value={p.sleepSchedule} />
    </>);
    case "interests": return (<>
      {p.interests?.length > 0 && <Row label="Interests" value={fmt(p.interests)} />}
      {p.hobbies?.length > 0 && <Row label="Hobbies" value={fmt(p.hobbies)} />}
    </>);
    case "favorites": return (<>
      <Row label="Favorite Food" value={p.favoriteFood} />
      <Row label="Favorite Movie" value={p.favoriteMovie} />
      <Row label="Favorite Music" value={p.favoriteMusicGenre} />
      <Row label="Favorite Book" value={p.favoriteBook} />
      <Row label="Favorite Travel" value={p.favoriteTravelDestination} />
    </>);
    case "personality": return (<>
      <Row label="Personality Type" value={p.personalityType} />
      {p.futureGoals && <p className="text-sm text-muted mt-1 line-clamp-2">{p.futureGoals}</p>}
      {p.partnerExpectations && <p className="text-sm text-muted mt-1 line-clamp-2">{p.partnerExpectations}</p>}
    </>);
    case "assets": return (<>
      {p.ownHouse && <Row label="Own House" value="Yes" />}
      {p.ownFlat && <Row label="Own Flat" value="Yes" />}
      {p.agriculturalLand && <Row label="Agricultural Land" value="Yes" />}
      <Row label="Vehicle Details" value={p.vehicleDetails} />
      <Row label="Investments" value={p.investments} />
    </>);
    case "partner": return (<>
      {(p.ageMin || p.ageMax) && <Row label="Age Range" value={`${p.ageMin || "?"} - ${p.ageMax || "?"} yrs`} />}
      {(p.heightMin || p.heightMax) && <Row label="Height Range" value={`${p.heightMin || "?"} - ${p.heightMax || "?"} cm`} />}
      <Row label="Preferred Religion" value={p.religion_pref} />
      <Row label="Preferred Caste" value={p.caste_pref} />
      <Row label="Income Preference" value={p.incomePref} />
      <Row label="Diet Preference" value={p.dietPref} />
    </>);
    default: return null;
  }
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  sectionId, profile, userData, onClose, onSaved,
}: {
  sectionId: string;
  profile: Profile;
  userData: { email?: string; phone?: string };
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}) {
  const form = useForm({ defaultValues: profile, mode: "onChange" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState(profile.state || "");

  const stateValue = form.watch("state");
  useEffect(() => { if (stateValue) setSelectedState(stateValue); }, [stateValue]);

  const token = () => typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const values = form.getValues();
      if (sectionId === "basic") {
        values.fullName = [values.firstName, values.middleName, values.lastName]
          .filter(Boolean).join(" ") || values.fullName;
      }
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error || "Save failed"); return; }
      onSaved(values);
      onClose();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-medium text-muted mb-1">{children}</label>
  );
  const Sel = ({ name, options, placeholder }: { name: string; options: string[]; placeholder?: string }) => (
    <select className="input-glass" {...form.register(name)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  );

  const sectionLabel = SECTIONS.find((s) => s.id === sectionId)?.label || "";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-background border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl my-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-base">Edit {sectionLabel}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {sectionId === "basic" && (<>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Input label="First Name" placeholder="First name" {...form.register("firstName")} />
              <Input label="Middle Name" placeholder="Middle name" {...form.register("middleName")} />
              <Input label="Last Name" placeholder="Last name" {...form.register("lastName")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Marital Status</Label><Sel name="maritalStatus" options={MARITAL_STATUS} placeholder="Select" /></div>
              <div><Label>Blood Group</Label><Sel name="bloodGroup" options={BLOOD_GROUPS} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Input label="Height (cm)" type="number" placeholder="170" {...form.register("height", { valueAsNumber: true })} />
              <Input label="Weight (kg)" type="number" placeholder="70" {...form.register("weight", { valueAsNumber: true })} />
              <div><Label>Complexion</Label><Sel name="complexion" options={COMPLEXION} placeholder="Select" /></div>
            </div>
            <div><Label>Physical Status</Label><Sel name="physicalStatus" options={PHYSICAL_STATUS} placeholder="Select" /></div>
            <div><Label>About Me</Label>
              <textarea className="input-glass min-h-[80px] resize-none" placeholder="Write a brief introduction..." {...form.register("aboutMe")} />
            </div>
            <div><Label>Profile Created By</Label><Sel name="profileCreatedBy" options={PROFILE_CREATED_BY} placeholder="Select" /></div>
          </>)}

          {sectionId === "contact" && (<>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mobile Number</Label><Input type="tel" value={userData.phone || ""} disabled /></div>
              <Input label="Alternate Mobile" type="tel" placeholder="Enter Alternate Mobile Number" {...form.register("alternatePhone")} />
            </div>
            <div><Label>Email</Label><Input type="email" value={userData.email || ""} disabled /></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>State</Label><Sel name="state" options={STATES_INDIA} placeholder="Select" /></div>
              <div><Label>City</Label><Sel name="city" options={selectedState ? STATE_CITIES[selectedState] || [] : []} placeholder="Select" /></div>
              <Input label="Postal Code" placeholder="600001" {...form.register("postalCode")} />
            </div>
            <Input label="Country" placeholder="India" {...form.register("country")} />
            <div><Label>Current Address</Label>
              <textarea className="input-glass min-h-[60px] resize-none" {...form.register("currentAddress")} />
            </div>
            <div><Label>Permanent Address</Label>
              <textarea className="input-glass min-h-[60px] resize-none" {...form.register("permanentAddress")} />
            </div>
          </>)}

          {sectionId === "religion" && (<>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Religion</Label><Sel name="religion" options={RELIGIONS} placeholder="Select" /></div>
              <div><Label>Community</Label><Sel name="community" options={COMMUNITY_HINDU} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Caste" placeholder="e.g. Vellalar" {...form.register("caste")} />
              <Input label="Sub Caste" placeholder="e.g. Kamma" {...form.register("subCaste")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Gothram</Label><Sel name="gothram" options={GOTHRAM} placeholder="Select" /></div>
              <div><Label>Mother Tongue</Label><Sel name="motherTongue" options={MOTHER_TONGUES} placeholder="Select" /></div>
            </div>
            <div><Label>Languages Known</Label>
              <textarea className="input-glass min-h-[50px] resize-none" placeholder="e.g. Tamil, English, Hindi" {...form.register("languagesKnown")} />
            </div>
          </>)}

          {sectionId === "horoscope" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Time of Birth" type="time" {...form.register("timeOfBirth")} />
              <Input label="Place of Birth" placeholder="e.g. Chennai" {...form.register("placeOfBirth")} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Rashi</Label><Sel name="rashi" options={RASHI} placeholder="Select" /></div>
              <div><Label>Nakshatra</Label><Sel name="nakshatra" options={NAKSHATRA} placeholder="Select" /></div>
              <div><Label>Lagna</Label><Sel name="lagna" options={LAGNA} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Nadi</Label><Sel name="nadi" options={NADI} placeholder="Select" /></div>
              <div><Label>Gana</Label><Sel name="gana" options={GANA} placeholder="Select" /></div>
              <div><Label>Yoni</Label><Sel name="yoni" options={YONI} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Rajju</Label><Sel name="rajju" options={RAJJU} placeholder="Select" /></div>
              <div><Label>Mahendra</Label><Sel name="mahendra" options={MAHENDRA} placeholder="Select" /></div>
              <div><Label>Vedha</Label><Sel name="vedha" options={VEDHA} placeholder="Select" /></div>
            </div>
            <div><Label>Dosham</Label><Sel name="dosham" options={DOSHAM} placeholder="Select" /></div>
            <div><Label>Dasa Details</Label>
              <textarea className="input-glass min-h-[50px] resize-none" {...form.register("dasaDetails")} />
            </div>
            <div><Label>Horoscope Notes</Label>
              <textarea className="input-glass min-h-[50px] resize-none" {...form.register("horoscopeNotes")} />
            </div>
          </>)}

          {sectionId === "education" && (<>
            <div><Label>Highest Qualification</Label><Sel name="qualification" options={EDUCATION_LEVELS} placeholder="Select" /></div>
            <Input label="Degree" placeholder="e.g. Bachelor of Technology" {...form.register("degree")} />
            <Input label="Specialization" placeholder="e.g. Computer Science" {...form.register("specialization")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="College Name" placeholder="e.g. IIT Madras" {...form.register("collegeName")} />
              <Input label="University Name" placeholder="e.g. Anna University" {...form.register("university")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Passing Year" type="number" placeholder="2020" {...form.register("passingYear", { valueAsNumber: true })} />
              <Input label="Additional Certifications" placeholder="e.g. PMP, AWS" {...form.register("additionalCerts")} />
            </div>
          </>)}

          {sectionId === "career" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Occupation" placeholder="e.g. Software Engineer" {...form.register("occupation")} />
              <Input label="Designation" placeholder="e.g. Senior Developer" {...form.register("designation")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Company Name" placeholder="e.g. Google" {...form.register("companyName")} />
              <div><Label>Industry</Label><Sel name="industry" options={INDUSTRIES} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Employment Type</Label><Sel name="employmentType" options={EMPLOYMENT_TYPE} placeholder="Select" /></div>
              <Input label="Work Location" placeholder="e.g. Bangalore" {...form.register("workLocation")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Experience" placeholder="e.g. 5 years" {...form.register("experience")} />
              <div><Label>Annual Income</Label><Sel name="annualIncome" options={INCOME_RANGES} placeholder="Select" /></div>
            </div>
          </>)}

          {sectionId === "family" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Father's Name" {...form.register("fatherName")} />
              <Input label="Father's Occupation" {...form.register("fatherOccupation")} />
            </div>
            <Input label="Father's Income" placeholder="e.g. 10-15 LPA" {...form.register("fatherIncome")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mother's Name" {...form.register("motherName")} />
              <Input label="Mother's Occupation" {...form.register("motherOccupation")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Brothers" type="number" min={0} {...form.register("brothersCount", { valueAsNumber: true })} />
              <Input label="Married Brothers" type="number" min={0} {...form.register("marriedBrothers", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Sisters" type="number" min={0} {...form.register("sistersCount", { valueAsNumber: true })} />
              <Input label="Married Sisters" type="number" min={0} {...form.register("marriedSisters", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Family Type</Label><Sel name="familyType" options={FAMILY_TYPES} placeholder="Select" /></div>
              <div><Label>Family Values</Label><Sel name="familyValues" options={FAMILY_VALUES} placeholder="Select" /></div>
              <div><Label>Family Status</Label><Sel name="familyStatus" options={["MIDDLE_CLASS", "UPPER_MIDDLE_CLASS", "AFFLUENT"]} placeholder="Select" /></div>
            </div>
          </>)}

          {sectionId === "lifestyle" && (<>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Diet</Label><Sel name="diet" options={DIET} placeholder="Select" /></div>
              <div><Label>Smoking</Label><Sel name="smoking" options={SMOKING} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Drinking</Label><Sel name="drinking" options={DRINKING} placeholder="Select" /></div>
              <div><Label>Fitness Level</Label><Sel name="fitnessLevel" options={FITNESS_LEVEL} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Exercise Habits</Label><Sel name="exerciseHabits" options={EXERCISE_HABITS} placeholder="Select" /></div>
              <div><Label>Sleep Schedule</Label><Sel name="sleepSchedule" options={SLEEP_SCHEDULE} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Have Pets?</Label>
                <select className="input-glass" {...form.register("hasPets")}>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <Input label="Pet Details" placeholder="e.g. Dog, Cat" {...form.register("petsDetails")} />
            </div>
          </>)}

          {sectionId === "interests" && (<>
            <div><Label>Interests</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {INTERESTS_OPTIONS.map((i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer text-sm text-muted">
                    <input type="checkbox" value={i} className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("interests")} />
                    {i}
                  </label>
                ))}
              </div>
            </div>
            <div><Label>Hobbies</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {HOBBIES_OPTIONS.map((h) => (
                  <label key={h} className="flex items-center gap-2 cursor-pointer text-sm text-muted">
                    <input type="checkbox" value={h} className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("hobbies")} />
                    {h}
                  </label>
                ))}
              </div>
            </div>
          </>)}

          {sectionId === "favorites" && (<>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Favorite Food</Label><Sel name="favoriteFood" options={INDIAN_FOOD} placeholder="Select" /></div>
              <div><Label>Favorite Cuisine</Label><Sel name="favoriteCuisine" options={["South Indian","North Indian","Gujarati","Bengali","Punjabi","Maharashtrian","Kerala","Andhra","Chettinad","Hyderabadi","Mughlai","Continental","Chinese","Other"]} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Favorite Movie Type</Label><Sel name="favoriteMovie" options={INDIAN_MOVIES} placeholder="Select" /></div>
              <Input label="Favorite Actor" {...form.register("favoriteActor")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Favorite Actress" {...form.register("favoriteActress")} />
              <div><Label>Favorite Music Genre</Label><Sel name="favoriteMusicGenre" options={INDIAN_MUSIC} placeholder="Select" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Favorite Book Genre</Label><Sel name="favoriteBook" options={INDIAN_BOOKS} placeholder="Select" /></div>
              <div><Label>Favorite Travel Type</Label><Sel name="favoriteTravelDestination" options={INDIAN_TRAVEL} placeholder="Select" /></div>
            </div>
          </>)}

          {sectionId === "personality" && (<>
            <div><Label>Personality Type</Label><Sel name="personalityType" options={PERSONALITY_TYPE} placeholder="Select" /></div>
            <div className="grid grid-cols-2 gap-3">
              {[["isIntrovert","Introvert"],["isExtrovert","Extrovert"],["isFamilyOriented","Family Oriented"],["isCareerOriented","Career Oriented"]].map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm text-muted">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register(k)} />{l}
                </label>
              ))}
            </div>
            <div><Label>Religious Beliefs</Label><textarea className="input-glass min-h-[50px] resize-none" {...form.register("religiousBeliefs")} /></div>
            <div><Label>Future Goals</Label><textarea className="input-glass min-h-[50px] resize-none" {...form.register("futureGoals")} /></div>
            <div><Label>Life Priorities</Label><textarea className="input-glass min-h-[50px] resize-none" {...form.register("lifePriorities")} /></div>
            <div><Label>Expectations From Partner</Label><textarea className="input-glass min-h-[60px] resize-none" {...form.register("partnerExpectations")} /></div>
          </>)}

          {sectionId === "assets" && (<>
            <div className="grid grid-cols-2 gap-3">
              {[["ownHouse","Own House"],["ownFlat","Own Flat"],["agriculturalLand","Agricultural Land"],["commercialProperty","Commercial Property"]].map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm text-muted">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register(k)} />{l}
                </label>
              ))}
            </div>
            <Input label="Vehicle Details" placeholder="e.g. Car, Bike" {...form.register("vehicleDetails")} />
            <Input label="Investments" placeholder="e.g. Stocks, Mutual Funds" {...form.register("investments")} />
            <Input label="Family Business Details" {...form.register("familyBusinessDetails")} />
          </>)}

          {sectionId === "partner" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Age" type="number" min={18} placeholder="22" {...form.register("ageMin", { valueAsNumber: true })} />
              <Input label="Max Age" type="number" min={18} placeholder="32" {...form.register("ageMax", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Height (cm)" type="number" placeholder="155" {...form.register("heightMin", { valueAsNumber: true })} />
              <Input label="Max Height (cm)" type="number" placeholder="185" {...form.register("heightMax", { valueAsNumber: true })} />
            </div>
            <div><Label>Preferred Marital Status</Label><Sel name="maritalStatus_pref" options={["Any", ...MARITAL_STATUS]} placeholder="Any" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preferred Religion</Label><Sel name="religion_pref" options={["Any", ...RELIGIONS]} placeholder="Any" /></div>
              <Input label="Preferred Caste" placeholder="Any" {...form.register("caste_pref")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Education Preference" {...form.register("educationPref")} />
              <Input label="Income Preference" placeholder="e.g. 10-15 LPA" {...form.register("incomePref")} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Diet Preference</Label><Sel name="dietPref" options={["Any", ...DIET]} placeholder="Any" /></div>
              <div><Label>Smoking Preference</Label><Sel name="smokingPref" options={["Any", ...SMOKING]} placeholder="Any" /></div>
              <div><Label>Drinking Preference</Label><Sel name="drinkingPref" options={["Any", ...DRINKING]} placeholder="Any" /></div>
            </div>
          </>)}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="glass" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="gold" onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({});
  const [userData, setUserData] = useState<{ email?: string; phone?: string }>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = () => typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const json = await res.json();
        if (json.success) {
          setProfile(json.data.profile || {});
          setUserData({ email: json.data.user?.email, phone: json.data.user?.phone });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const completedSections = SECTIONS.filter((s) => getHasData(s.id, profile)).length;
  const pct = Math.round((completedSections / SECTIONS.length) * 100);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted text-sm mt-1">{completedSections} of {SECTIONS.length} sections completed</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#C9972C]">{pct}%</div>
          <p className="text-muted text-xs">Complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#C9972C] to-[#E8C76A] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {pct === 100 && (
        <div className="glass-gold p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-[#C9972C]" />
          <div>
            <p className="text-sm font-semibold text-foreground">Profile Complete!</p>
            <p className="text-xs text-muted">You can now proceed to KYC verification.</p>
          </div>
          <Button variant="gold" size="sm" className="ml-auto" onClick={() => router.push("/dashboard/profile/kyc")}>
            Start KYC
          </Button>
        </div>
      )}

      {/* Section cards grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            profile={profile}
            onEdit={() => setEditingSection(section.id)}
          />
        ))}
      </div>

      {/* Edit modal */}
      {editingSection && (
        <EditModal
          sectionId={editingSection}
          profile={profile}
          userData={userData}
          onClose={() => setEditingSection(null)}
          onSaved={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
}
