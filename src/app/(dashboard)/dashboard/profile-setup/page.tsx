"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { User, Heart, Briefcase, Users, CheckCircle, Phone, MapPin, BookOpen, Home, Utensils, Star, Shield, Camera, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STEPS = [
  { id: 1, label: "Basic Info", icon: User },
  { id: 2, label: "Contact", icon: Phone },
  { id: 3, label: "Religion", icon: Star },
  { id: 4, label: "Horoscope", icon: Target },
  { id: 5, label: "Education", icon: BookOpen },
  { id: 6, label: "Career", icon: Briefcase },
  { id: 7, label: "Family", icon: Users },
  { id: 8, label: "Lifestyle", icon: Utensils },
  { id: 9, label: "Interests", icon: Heart },
  { id: 10, label: "Hobbies", icon: Star },
  { id: 11, label: "Favorites", icon: Heart },
  { id: 12, label: "Personality", icon: User },
  { id: 13, label: "Assets", icon: Home },
  { id: 14, label: "Partner Prefs", icon: Heart },
];

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

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<{ email?: string; phone?: string }>({});
  const [selectedState, setSelectedState] = useState("");
  const form = useForm({ mode: "onChange" });

  const token = () => typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Fetch existing profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const json = await res.json();
        if (json.success) {
          const profile = json.data.profile;
          const user = json.data.user;
          
          // Store user data for read-only fields
          if (user) {
            setUserData({ email: user.email, phone: user.phone });
          }
          
          // Populate form with existing profile data
          if (profile) {
            Object.keys(profile).forEach((key) => {
              if (profile[key] !== null && profile[key] !== undefined) {
                form.setValue(key, profile[key]);
              }
            });
            // Set selected state if exists
            if (profile.state) {
              setSelectedState(profile.state);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, [form]);

  // Watch state changes to update city options
  const stateValue = form.watch("state");
  useEffect(() => {
    if (stateValue) {
      setSelectedState(stateValue);
    }
  }, [stateValue]);

  const saveStep = async (stepData: object) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(stepData),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return false; }
      return true;
    } catch { setError("Save failed. Please try again."); return false; }
    finally { setSaving(false); }
  };

  const handleNext = async () => {
    const values = form.getValues();
    const ok = await saveStep(values);
    if (ok && step < STEPS.length) setStep(step + 1);
    else if (ok) router.push("/dashboard/profile/kyc");
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-white/70 mb-1.5">{children}</label>
  );

  const Select = ({ name, options, placeholder }: { name: string; options: string[]; placeholder?: string }) => (
    <select
      className="input-glass"
      {...form.register(name)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
        <p className="text-white/50 text-sm mb-6">Step {step} of {STEPS.length}</p>
        <div className="flex gap-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-bold transition-all
                ${step === s.id ? "step-active" : step > s.id ? "step-done" : "step-pending"}`}>
                {step > s.id ? <CheckCircle size={16} /> : <s.icon size={16} />}
              </div>
              <span className={`text-[10px] font-medium ${step >= s.id ? "text-[#E8C76A]" : "text-white/30"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1 bg-white/10 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-[#C9972C] to-[#E8C76A] rounded-full transition-all"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass p-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Basic Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Profile Created By</Label>
                <Select name="profileCreatedBy" options={PROFILE_CREATED_BY} placeholder="Select" />
              </div>
              <div>
                <Label>Gender</Label>
                <Select name="gender" options={["MALE", "FEMALE", "OTHER"]} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="First Name" placeholder="First name" {...form.register("firstName")} />
              <Input label="Middle Name" placeholder="Middle name" {...form.register("middleName")} />
              <Input label="Last Name" placeholder="Last name" {...form.register("lastName")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Marital Status</Label>
                <Select name="maritalStatus" options={MARITAL_STATUS} placeholder="Select" />
              </div>
              <Input label="Date of Birth" type="date" {...form.register("dateOfBirth")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Height (cm)" type="number" placeholder="170" {...form.register("height", { valueAsNumber: true })} />
              <Input label="Weight (kg)" type="number" placeholder="70" {...form.register("weight", { valueAsNumber: true })} />
              <div>
                <Label>Blood Group</Label>
                <Select name="bloodGroup" options={BLOOD_GROUPS} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Physical Status</Label>
                <Select name="physicalStatus" options={PHYSICAL_STATUS} placeholder="Select" />
              </div>
              <div>
                <Label>Complexion</Label>
                <Select name="complexion" options={COMPLEXION} placeholder="Select" />
              </div>
            </div>
            <div>
              <Label>About Me</Label>
              <textarea
                className="input-glass min-h-[100px] resize-none"
                placeholder="Write a brief introduction about yourself and what you're looking for..."
                {...form.register("aboutMe")}
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mobile Number</Label>
                <Input type="tel" value={userData.phone || ""} disabled className="bg-white/5" />
              </div>
              <Input label="Alternate Mobile" type="tel" placeholder="+91 98765 43211" {...form.register("alternatePhone")} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input type="email" value={userData.email || ""} disabled className="bg-white/5" />
            </div>
            <div>
              <Label>Current Address</Label>
              <textarea className="input-glass min-h-[80px] resize-none" placeholder="Your current address" {...form.register("currentAddress")} />
            </div>
            <div>
              <Label>Permanent Address</Label>
              <textarea className="input-glass min-h-[80px] resize-none" placeholder="Your permanent address" {...form.register("permanentAddress")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>State</Label>
                <Select name="state" options={STATES_INDIA} placeholder="Select" />
              </div>
              <div>
                <Label>City</Label>
                <Select name="city" options={selectedState ? STATE_CITIES[selectedState] || [] : []} placeholder="Select" />
              </div>
              <Input label="Postal Code" placeholder="600001" {...form.register("postalCode")} />
            </div>
            <Input label="Country" placeholder="India" {...form.register("country")} />
          </div>
        )}

        {/* Step 3: Religion & Community */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Religion & Community Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Religion</Label>
                <Select name="religion" options={RELIGIONS} placeholder="Select" />
              </div>
              <div>
                <Label>Community</Label>
                <Select name="community" options={COMMUNITY_HINDU} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Caste" placeholder="e.g. Vellalar" {...form.register("caste")} />
              <Input label="Sub Caste" placeholder="e.g. Kamma" {...form.register("subCaste")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gothram</Label>
                <Select name="gothram" options={GOTHRAM} placeholder="Select" />
              </div>
              <div>
                <Label>Mother Tongue</Label>
                <Select name="motherTongue" options={MOTHER_TONGUES} placeholder="Select" />
              </div>
            </div>
            <div>
              <Label>Languages Known</Label>
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="e.g. Tamil, English, Hindi" {...form.register("languagesKnown")} />
            </div>
          </div>
        )}

        {/* Step 4: Horoscope */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Horoscope / Astrology Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Time of Birth" type="time" {...form.register("timeOfBirth")} />
              <Input label="Place of Birth" placeholder="e.g. Chennai" {...form.register("placeOfBirth")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Rashi</Label>
                <Select name="rashi" options={RASHI} placeholder="Select" />
              </div>
              <div>
                <Label>Nakshatra</Label>
                <Select name="nakshatra" options={NAKSHATRA} placeholder="Select" />
              </div>
              <div>
                <Label>Lagna</Label>
                <Select name="lagna" options={LAGNA} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Nadi</Label>
                <Select name="nadi" options={NADI} placeholder="Select" />
              </div>
              <div>
                <Label>Gana</Label>
                <Select name="gana" options={GANA} placeholder="Select" />
              </div>
              <div>
                <Label>Yoni</Label>
                <Select name="yoni" options={YONI} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Rajju</Label>
                <Select name="rajju" options={RAJJU} placeholder="Select" />
              </div>
              <div>
                <Label>Mahendra</Label>
                <Select name="mahendra" options={MAHENDRA} placeholder="Select" />
              </div>
              <div>
                <Label>Vedha</Label>
                <Select name="vedha" options={VEDHA} placeholder="Select" />
              </div>
            </div>
            <div>
              <Label>Dosham</Label>
              <Select name="dosham" options={DOSHAM} placeholder="Select" />
            </div>
            <div>
              <Label>Dasa Details</Label>
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="Current Dasa period" {...form.register("dasaDetails")} />
            </div>
            <div>
              <Label>Horoscope Notes</Label>
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="Any additional horoscope details" {...form.register("horoscopeNotes")} />
            </div>
          </div>
        )}

        {/* Step 5: Education */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Education Details</h2>
            <div>
              <Label>Highest Qualification</Label>
              <Select name="qualification" options={EDUCATION_LEVELS} placeholder="Select" />
            </div>
            <Input label="Degree" placeholder="e.g. Bachelor of Technology" {...form.register("degree")} />
            <Input label="Specialization" placeholder="e.g. Computer Science" {...form.register("specialization")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="College Name" placeholder="e.g. IIT Madras" {...form.register("collegeName")} />
              <Input label="University Name" placeholder="e.g. Anna University" {...form.register("university")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Passing Year" type="number" placeholder="2020" {...form.register("passingYear", { valueAsNumber: true })} />
              <Input label="Additional Certifications" placeholder="e.g. PMP, AWS" {...form.register("additionalCerts")} />
            </div>
          </div>
        )}

        {/* Step 6: Career */}
        {step === 6 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Professional Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Occupation" placeholder="e.g. Software Engineer" {...form.register("occupation")} />
              <Input label="Designation" placeholder="e.g. Senior Developer" {...form.register("designation")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Company Name" placeholder="e.g. Google" {...form.register("companyName")} />
              <div>
                <Label>Industry</Label>
                <Select name="industry" options={INDUSTRIES} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employment Type</Label>
                <Select name="employmentType" options={EMPLOYMENT_TYPE} placeholder="Select" />
              </div>
              <Input label="Work Location" placeholder="e.g. Bangalore" {...form.register("workLocation")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Experience" placeholder="e.g. 5 years" {...form.register("experience")} />
              <div>
                <Label>Annual Income</Label>
                <Select name="annualIncome" options={INCOME_RANGES} placeholder="Select" />
              </div>
            </div>
            <Input label="Currency" placeholder="INR" {...form.register("currency")} />
          </div>
        )}

        {/* Step 7: Family */}
        {step === 7 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Family Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Father's Name" placeholder="Father's name" {...form.register("fatherName")} />
              <Input label="Father's Occupation" placeholder="e.g. Retired IAS" {...form.register("fatherOccupation")} />
            </div>
            <Input label="Father's Income" placeholder="e.g. 10-15 LPA" {...form.register("fatherIncome")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Mother's Name" placeholder="Mother's name" {...form.register("motherName")} />
              <Input label="Mother's Occupation" placeholder="e.g. Homemaker" {...form.register("motherOccupation")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Number of Brothers" type="number" min={0} placeholder="2" {...form.register("brothersCount", { valueAsNumber: true })} />
              <Input label="Married Brothers" type="number" min={0} placeholder="1" {...form.register("marriedBrothers", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Number of Sisters" type="number" min={0} placeholder="1" {...form.register("sistersCount", { valueAsNumber: true })} />
              <Input label="Married Sisters" type="number" min={0} placeholder="0" {...form.register("marriedSisters", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Family Type</Label>
                <Select name="familyType" options={FAMILY_TYPES} placeholder="Select" />
              </div>
              <div>
                <Label>Family Values</Label>
                <Select name="familyValues" options={FAMILY_VALUES} placeholder="Select" />
              </div>
              <div>
                <Label>Family Status</Label>
                <Select name="familyStatus" options={["MIDDLE_CLASS", "UPPER_MIDDLE_CLASS", "AFFLUENT"]} placeholder="Select" />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Lifestyle */}
        {step === 8 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Lifestyle Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Diet Preference</Label>
                <Select name="diet" options={DIET} placeholder="Select" />
              </div>
              <div>
                <Label>Smoking Habit</Label>
                <Select name="smoking" options={SMOKING} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Drinking Habit</Label>
                <Select name="drinking" options={DRINKING} placeholder="Select" />
              </div>
              <div>
                <Label>Fitness Level</Label>
                <Select name="fitnessLevel" options={FITNESS_LEVEL} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Exercise Habits</Label>
                <Select name="exerciseHabits" options={EXERCISE_HABITS} placeholder="Select" />
              </div>
              <div>
                <Label>Sleep Schedule</Label>
                <Select name="sleepSchedule" options={SLEEP_SCHEDULE} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Have Pets?</Label>
                <select className="input-glass" {...form.register("hasPets")}>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <Input label="Pets Details" placeholder="e.g. Dog, Cat" {...form.register("petsDetails")} />
            </div>
          </div>
        )}

        {/* Step 9: Interests */}
        {step === 9 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Interests</h2>
            <div className="grid grid-cols-3 gap-3">
              {INTERESTS_OPTIONS.map((interest) => (
                <label key={interest} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={interest}
                    className="w-4 h-4 rounded accent-[#C9972C]"
                    {...form.register("interests")}
                  />
                  <span className="text-sm text-white/70">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 10: Hobbies */}
        {step === 10 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Hobbies</h2>
            <div className="grid grid-cols-3 gap-3">
              {HOBBIES_OPTIONS.map((hobby) => (
                <label key={hobby} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={hobby}
                    className="w-4 h-4 rounded accent-[#C9972C]"
                    {...form.register("hobbies")}
                  />
                  <span className="text-sm text-white/70">{hobby}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 11: Favorites */}
        {step === 11 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Favorites</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Favorite Food</Label>
                <Select name="favoriteFood" options={INDIAN_FOOD} placeholder="Select" />
              </div>
              <div>
                <Label>Favorite Cuisine</Label>
                <Select name="favoriteCuisine" options={["South Indian", "North Indian", "Gujarati", "Bengali", "Punjabi", "Maharashtrian", "Kerala", "Andhra", "Chettinad", "Hyderabadi", "Mughlai", "Continental", "Chinese", "Other"]} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Favorite Movie Type</Label>
                <Select name="favoriteMovie" options={INDIAN_MOVIES} placeholder="Select" />
              </div>
              <Input label="Favorite Actor" placeholder="e.g. Shah Rukh Khan" {...form.register("favoriteActor")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Favorite Actress" placeholder="e.g. Deepika Padukone" {...form.register("favoriteActress")} />
              <div>
                <Label>Favorite Music Genre</Label>
                <Select name="favoriteMusicGenre" options={INDIAN_MUSIC} placeholder="Select" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Favorite Book Genre</Label>
                <Select name="favoriteBook" options={INDIAN_BOOKS} placeholder="Select" />
              </div>
              <div>
                <Label>Favorite Travel Type</Label>
                <Select name="favoriteTravelDestination" options={INDIAN_TRAVEL} placeholder="Select" />
              </div>
            </div>
          </div>
        )}

        {/* Step 12: Personality & Values */}
        {step === 12 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Personality & Values</h2>
            <div>
              <Label>Personality Type</Label>
              <Select name="personalityType" options={PERSONALITY_TYPE} placeholder="Select" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("isIntrovert")} />
                <span className="text-sm text-white/70">Introvert</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("isExtrovert")} />
                <span className="text-sm text-white/70">Extrovert</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("isFamilyOriented")} />
                <span className="text-sm text-white/70">Family Oriented</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("isCareerOriented")} />
                <span className="text-sm text-white/70">Career Oriented</span>
              </label>
            </div>
            <div>
              <Label>Religious Beliefs</Label>
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="Your religious beliefs" {...form.register("religiousBeliefs")} />
            </div>
            <div>
              <Label>Future Goals</Label>
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="Your future goals" {...form.register("futureGoals")} />
            </div>
            <div>
              <Label>Life Priorities</Label>
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="Your life priorities" {...form.register("lifePriorities")} />
            </div>
            <div>
              <Label>Expectations From Partner</Label>
              <textarea className="input-glass min-h-[80px] resize-none" placeholder="What you expect from your partner" {...form.register("partnerExpectations")} />
            </div>
          </div>
        )}

        {/* Step 13: Assets */}
        {step === 13 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Assets & Financial Details (Optional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("ownHouse")} />
                <span className="text-sm text-white/70">Own House</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("ownFlat")} />
                <span className="text-sm text-white/70">Own Flat</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("agriculturalLand")} />
                <span className="text-sm text-white/70">Agricultural Land</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#C9972C]" {...form.register("commercialProperty")} />
                <span className="text-sm text-white/70">Commercial Property</span>
              </label>
            </div>
            <Input label="Vehicle Details" placeholder="e.g. Car, Bike" {...form.register("vehicleDetails")} />
            <Input label="Investments" placeholder="e.g. Stocks, Mutual Funds" {...form.register("investments")} />
            <Input label="Family Business Details" placeholder="Details about family business" {...form.register("familyBusinessDetails")} />
          </div>
        )}

        {/* Step 14: Partner Preferences */}
        {step === 14 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-white text-lg">Partner Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Age" type="number" min={18} placeholder="22" {...form.register("ageMin", { valueAsNumber: true })} />
              <Input label="Max Age" type="number" min={18} placeholder="32" {...form.register("ageMax", { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Height (cm)" type="number" placeholder="155" {...form.register("heightMin", { valueAsNumber: true })} />
              <Input label="Max Height (cm)" type="number" placeholder="185" {...form.register("heightMax", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Preferred Marital Status</Label>
              <Select name="maritalStatus_pref" options={["Any", ...MARITAL_STATUS]} placeholder="Any" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preferred Religion</Label>
                <Select name="religion_pref" options={["Any", ...RELIGIONS]} placeholder="Any" />
              </div>
              <Input label="Preferred Caste" placeholder="Any" {...form.register("caste_pref")} />
            </div>
            <Input label="Preferred Sub Caste" placeholder="Any" {...form.register("subCaste_pref")} />
            <Input label="Preferred Mother Tongue" placeholder="Any" {...form.register("motherTongue_pref")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Education Preference" placeholder="e.g. Graduate or above" {...form.register("educationPref")} />
              <Input label="Degree Preference" placeholder="e.g. B.Tech" {...form.register("degreePref")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Occupation Preference" placeholder="e.g. Software Engineer" {...form.register("occupationPref")} />
              <Input label="Income Range" placeholder="e.g. 10-15 LPA" {...form.register("incomePref")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Country Preference" placeholder="India" {...form.register("countryPref")} />
              <Input label="State Preference" placeholder="Tamil Nadu" {...form.register("statePref")} />
              <Input label="City Preference" placeholder="Chennai" {...form.register("cityPref")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Diet Preference</Label>
                <Select name="dietPref" options={["Any", ...DIET]} placeholder="Any" />
              </div>
              <div>
                <Label>Smoking Preference</Label>
                <Select name="smokingPref" options={["Any", ...SMOKING]} placeholder="Any" />
              </div>
              <div>
                <Label>Drinking Preference</Label>
                <Select name="drinkingPref" options={["Any", ...DRINKING]} placeholder="Any" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Dosham Preference" placeholder="e.g. No Dosham" {...form.register("doshamPref")} />
              <Input label="Manglik Preference" placeholder="e.g. Any" {...form.register("manglikPref")} />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="glass" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button variant="gold" onClick={handleNext} loading={saving} className="flex-1">
            {step === STEPS.length ? "Complete & Start KYC" : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
