import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Seeding user profile for bakkashettianilkumar@gmail.com...");

  // Find or create the user
  let user = await prisma.user.findUnique({
    where: { email: "bakkashettianilkumar@gmail.com" },
  });

  if (!user) {
    console.log("User not found. Creating user...");
    const passwordHash = await bcrypt.hash("User@123456", 12);
    user = await prisma.user.create({
      data: {
        email: "bakkashettianilkumar@gmail.com",
        passwordHash,
        phone: "+91 98765 43210",
        gender: "MALE",
        dateOfBirth: "1998-05-15T00:00:00.000Z",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    console.log(`✅ User created: ${user.email} (ID: ${user.id})`);
  } else {
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    // Update emailVerified to true if not already
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, status: "ACTIVE" },
      });
      console.log("✅ User email verified and status set to ACTIVE");
    }
  }

  // Create or update UserProfile
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      
      // 1. Basic Personal Information
      profileCreatedBy: "SELF",
      firstName: "Bakkash",
      middleName: "Hettianil",
      lastName: "Kumar",
      fullName: "Bakkash Hettianil Kumar",
      height: 175,
      weight: 72,
      bloodGroup: "B_POSITIVE",
      physicalStatus: "NORMAL",
      complexion: "Wheatish",
      aboutMe: "I am a software engineer passionate about technology and looking for a life partner who shares similar values.",
      maritalStatus: "NEVER_MARRIED",
      
      // 2. Contact Information
      alternatePhone: "+91 98765 43212",
      currentAddress: "123, Tech Park, OMR",
      permanentAddress: "456, Gandhi Nagar, Chennai",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      postalCode: "600001",
      
      // 3. Religion & Community
      motherTongue: "Tamil",
      religion: "Hindu",
      community: "Brahmin",
      caste: "Iyer",
      subCaste: "Vadama",
      gothram: "Bharadwaja",
      languagesKnown: ["Tamil", "English", "Hindi"],
      
      // 4. Horoscope / Astrology
      timeOfBirth: "10:30",
      placeOfBirth: "Chennai",
      nakshatra: "Ashwini",
      rashi: "Mesha",
      lagna: "Mesha",
      dosham: ["CHEVVAI_DOSHAM"],
      nadi: "Madhya",
      gana: "Deva",
      yoni: "Simha",
      rajju: "Sarp",
      mahendra: "Leo",
      vedha: "Sun",
      dasaDetails: "Currently in Ketu Dasa",
      horoscopeNotes: "No major dosham",
      
      // 5. Education (basic fields - detailed in EducationDetail)
      qualification: "B.Tech Computer Science",
      university: "Anna University",
      
      // 6. Professional (basic fields - detailed in CareerDetail)
      occupationType: "Software Engineer",
      employerName: "Tech Corp",
      annualIncome: "15-20 LPA",
      workCity: "Chennai",
      workState: "Tamil Nadu",
      
      // 7. Family Details
      fatherName: "Rajesh Kumar",
      fatherOccupation: "Retired Government Employee",
      fatherIncome: "8-10 LPA",
      motherName: "Lakshmi Devi",
      motherOccupation: "Homemaker",
      brothersCount: 1,
      marriedBrothers: 0,
      sistersCount: 1,
      marriedSisters: 1,
      familyType: "NUCLEAR",
      familyStatus: "UPPER_MIDDLE_CLASS",
      familyValues: "MODERATE",
      
      // 8. Lifestyle
      diet: "VEGETARIAN",
      smoking: "NO",
      drinking: "NO",
      fitnessLevel: "MODERATELY_ACTIVE",
      exerciseHabits: "Gym, Running",
      sleepSchedule: "EARLY_BIRD",
      hasPets: false,
      petsDetails: null,
      
      // 9. Interests (detailed in UserInterest)
      // 10. Hobbies (detailed in UserHobby)
      // 11. Favorites (detailed in UserFavorite)
      
      // 12. Personality & Values
      personalityType: "AMBIVERT",
      isIntrovert: true,
      isExtrovert: true,
      isFamilyOriented: true,
      isCareerOriented: true,
      religiousBeliefs: "Spiritual but not orthodox",
      futureGoals: "Build a successful career and happy family",
      lifePriorities: "Family, Career, Health",
      partnerExpectations: "Looking for someone who is educated, family-oriented, and shares similar values",
      
      // 13. Assets (detailed in AssetDetail)
      
      profileCompletionPct: 100,
    },
    update: {
      // Update all fields
      profileCreatedBy: "SELF",
      firstName: "Bakkash",
      middleName: "Hettianil",
      lastName: "Kumar",
      fullName: "Bakkash Hettianil Kumar",
      height: 175,
      weight: 72,
      bloodGroup: "B_POSITIVE",
      physicalStatus: "NORMAL",
      complexion: "Wheatish",
      aboutMe: "I am a software engineer passionate about technology and looking for a life partner who shares similar values.",
      maritalStatus: "NEVER_MARRIED",
      alternatePhone: "+91 98765 43212",
      currentAddress: "123, Tech Park, OMR",
      permanentAddress: "456, Gandhi Nagar, Chennai",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      postalCode: "600001",
      motherTongue: "Tamil",
      religion: "Hindu",
      community: "Brahmin",
      caste: "Iyer",
      subCaste: "Vadama",
      gothram: "Bharadwaja",
      languagesKnown: ["Tamil", "English", "Hindi"],
      timeOfBirth: "10:30",
      placeOfBirth: "Chennai",
      nakshatra: "Ashwini",
      rashi: "Mesha",
      lagna: "Mesha",
      dosham: ["CHEVVAI_DOSHAM"],
      nadi: "Madhya",
      gana: "Deva",
      yoni: "Simha",
      rajju: "Sarp",
      mahendra: "Leo",
      vedha: "Sun",
      dasaDetails: "Currently in Ketu Dasa",
      horoscopeNotes: "No major dosham",
      qualification: "B.Tech Computer Science",
      university: "Anna University",
      occupationType: "Software Engineer",
      employerName: "Tech Corp",
      annualIncome: "15-20 LPA",
      workCity: "Chennai",
      workState: "Tamil Nadu",
      fatherName: "Rajesh Kumar",
      fatherOccupation: "Retired Government Employee",
      fatherIncome: "8-10 LPA",
      motherName: "Lakshmi Devi",
      motherOccupation: "Homemaker",
      brothersCount: 1,
      marriedBrothers: 0,
      sistersCount: 1,
      marriedSisters: 1,
      familyType: "NUCLEAR",
      familyStatus: "UPPER_MIDDLE_CLASS",
      familyValues: "MODERATE",
      diet: "VEGETARIAN",
      smoking: "NO",
      drinking: "NO",
      fitnessLevel: "MODERATELY_ACTIVE",
      exerciseHabits: "Gym, Running",
      sleepSchedule: "EARLY_BIRD",
      hasPets: false,
      personalityType: "AMBIVERT",
      isIntrovert: true,
      isExtrovert: true,
      isFamilyOriented: true,
      isCareerOriented: true,
      religiousBeliefs: "Spiritual but not orthodox",
      futureGoals: "Build a successful career and happy family",
      lifePriorities: "Family, Career, Health",
      partnerExpectations: "Looking for someone who is educated, family-oriented, and shares similar values",
      profileCompletionPct: 100,
    },
  });

  console.log(`✅ Profile created/updated: ${profile.id}`);

  // Delete existing related records
  await prisma.educationDetail.deleteMany({ where: { profileId: profile.id } });
  await prisma.careerDetail.deleteMany({ where: { profileId: profile.id } });
  await prisma.assetDetail.deleteMany({ where: { profileId: profile.id } });
  await prisma.userInterest.deleteMany({ where: { profileId: profile.id } });
  await prisma.userHobby.deleteMany({ where: { profileId: profile.id } });
  await prisma.userFavorite.deleteMany({ where: { profileId: profile.id } });
  await prisma.partnerPreference.deleteMany({ where: { profileId: profile.id } });

  // Create Education Details
  await prisma.educationDetail.create({
    data: {
      profileId: profile.id,
      highestQualification: "B.Tech",
      degree: "Bachelor of Technology",
      specialization: "Computer Science",
      collegeName: "SSN College of Engineering",
      universityName: "Anna University",
      passingYear: 2020,
      additionalCerts: ["AWS Solutions Architect", "PMP"],
    },
  });
  console.log("✅ Education details created");

  // Create Career Details
  await prisma.careerDetail.create({
    data: {
      profileId: profile.id,
      occupation: "Software Engineer",
      designation: "Senior Software Engineer",
      companyName: "Tech Corp India Pvt Ltd",
      industry: "IT/Software",
      employmentType: "FULL_TIME",
      workLocation: "Chennai",
      experience: "4 years",
      annualIncome: "18 LPA",
      currency: "INR",
    },
  });
  console.log("✅ Career details created");

  // Create Asset Details
  await prisma.assetDetail.create({
    data: {
      profileId: profile.id,
      ownHouse: true,
      ownFlat: false,
      agriculturalLand: false,
      commercialProperty: false,
      vehicleDetails: "Honda City 2022 Model",
      investments: "Mutual Funds: 5 Lakhs, Stocks: 3 Lakhs",
      familyBusinessDetails: null,
    },
  });
  console.log("✅ Asset details created");

  // Create Interests
  const interests = ["Technology", "Reading", "Traveling", "Photography", "Investing"];
  for (const interest of interests) {
    await prisma.userInterest.create({
      data: {
        profileId: profile.id,
        interest,
        category: "General",
      },
    });
  }
  console.log("✅ Interests created");

  // Create Hobbies
  const hobbies = ["Chess", "Music", "Movies", "Trekking", "Gaming"];
  for (const hobby of hobbies) {
    await prisma.userHobby.create({
      data: {
        profileId: profile.id,
        hobby,
        category: "Recreation",
      },
    });
  }
  console.log("✅ Hobbies created");

  // Create Favorites
  const favorites = [
    { category: "Food", value: "Biryani" },
    { category: "Cuisine", value: "South Indian" },
    { category: "Movie", value: "3 Idiots" },
    { category: "Actor", value: "Vijay" },
    { category: "Actress", value: "Deepika Padukone" },
    { category: "Singer", value: "A.R. Rahman" },
    { category: "Music Genre", value: "Classical" },
    { category: "Book", value: "The Alchemist" },
    { category: "Sport", value: "Cricket" },
    { category: "Travel Destination", value: "Goa" },
  ];
  for (const fav of favorites) {
    await prisma.userFavorite.create({
      data: {
        profileId: profile.id,
        category: fav.category,
        value: fav.value,
      },
    });
  }
  console.log("✅ Favorites created");

  // Create Partner Preferences
  await prisma.partnerPreference.create({
    data: {
      profileId: profile.id,
      ageMin: 22,
      ageMax: 28,
      heightMin: 155,
      heightMax: 170,
      maritalStatus: "NEVER_MARRIED",
      religion: "Hindu",
      caste: "Any",
      subCaste: null,
      motherTongue: "Tamil",
      educationPref: "Graduate",
      degreePref: "Any",
      occupationPref: "Any",
      incomeMin: "5 LPA",
      incomeMax: null,
      countryPref: "India",
      statePref: "Tamil Nadu",
      cityPref: "Chennai",
      dietPref: "VEGETARIAN",
      smokingPref: "NO",
      drinkingPref: "NO",
      doshamPref: "No Chevvai Dosham",
      manglikPref: "Any",
    },
  });
  console.log("✅ Partner preferences created");

  console.log("\n🎉 User profile seeded successfully!");
  console.log(`📧 Email: bakkashettianilkumar@gmail.com`);
  console.log(`👤 Profile ID: ${profile.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
