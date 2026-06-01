import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ["query", "error", "warn"],
});

// Realistic Indian user data
const demoUsers = [
  {
    fullName: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+919876543210",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1995-05-15"),
    city: "Mumbai",
    state: "Maharashtra",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Hindi",
    height: 165,
    qualification: "MBA - Finance",
    occupationType: "Investment Banker",
    annualIncome: "15-20 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Ambitious and family-oriented. Looking for someone who values education and career growth.",
  },
  {
    fullName: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "+919876543211",
    gender: "MALE" as const,
    dateOfBirth: new Date("1992-08-22"),
    city: "Delhi",
    state: "Delhi",
    religion: "Hindu",
    caste: "Kayastha",
    motherTongue: "Hindi",
    height: 178,
    qualification: "B.Tech - Computer Science",
    occupationType: "Software Engineer",
    annualIncome: "20-25 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Tech enthusiast who loves traveling and reading. Seeking a partner with similar interests.",
  },
  {
    fullName: "Ananya Patel",
    email: "ananya.patel@example.com",
    phone: "+919876543212",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1994-12-10"),
    city: "Ahmedabad",
    state: "Gujarat",
    religion: "Hindu",
    caste: "Patel",
    motherTongue: "Gujarati",
    height: 160,
    qualification: "CA",
    occupationType: "Chartered Accountant",
    annualIncome: "10-15 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Simple and grounded. Love cooking and spending time with family.",
  },
  {
    fullName: "Arjun Singh",
    email: "arjun.singh@example.com",
    phone: "+919876543213",
    gender: "MALE" as const,
    dateOfBirth: new Date("1990-03-18"),
    city: "Jaipur",
    state: "Rajasthan",
    religion: "Hindu",
    caste: "Rajput",
    motherTongue: "Hindi",
    height: 182,
    qualification: "MBA - Marketing",
    occupationType: "Business Owner",
    annualIncome: "25-30 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Entrepreneur with a passion for fitness and outdoor activities.",
  },
  {
    fullName: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+919876543214",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1996-09-05"),
    city: "Hyderabad",
    state: "Telangana",
    religion: "Hindu",
    caste: "Reddy",
    motherTongue: "Telugu",
    height: 163,
    qualification: "MBBS",
    occupationType: "Doctor",
    annualIncome: "15-20 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Dedicated doctor looking for a supportive and understanding partner.",
  },
  {
    fullName: "Vikram Krishnan",
    email: "vikram.krishnan@example.com",
    phone: "+919876543215",
    gender: "MALE" as const,
    dateOfBirth: new Date("1991-11-30"),
    city: "Chennai",
    state: "Tamil Nadu",
    religion: "Hindu",
    caste: "Iyer",
    motherTongue: "Tamil",
    height: 175,
    qualification: "M.Tech - Mechanical",
    occupationType: "Mechanical Engineer",
    annualIncome: "12-18 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Carnatic music lover and avid reader. Seeking a cultured partner.",
  },
  {
    fullName: "Meera Nair",
    email: "meera.nair@example.com",
    phone: "+919876543216",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1993-07-20"),
    city: "Kochi",
    state: "Kerala",
    religion: "Hindu",
    caste: "Nair",
    motherTongue: "Malayalam",
    height: 162,
    qualification: "M.A. - English Literature",
    occupationType: "Teacher",
    annualIncome: "6-8 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Passionate about teaching and classical dance. Love simple living.",
  },
  {
    fullName: "Karan Mehta",
    email: "karan.mehta@example.com",
    phone: "+919876543217",
    gender: "MALE" as const,
    dateOfBirth: new Date("1989-04-12"),
    city: "Pune",
    state: "Maharashtra",
    religion: "Jain",
    caste: "Jain",
    motherTongue: "Marathi",
    height: 180,
    qualification: "CA",
    occupationType: "Financial Analyst",
    annualIncome: "18-22 LPA",
    maritalStatus: "DIVORCED" as const,
    aboutMe: "Looking for a fresh start with someone who understands life's journey.",
  },
  {
    fullName: "Pooja Gupta",
    email: "pooja.gupta@example.com",
    phone: "+919876543218",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1997-02-28"),
    city: "Bangalore",
    state: "Karnataka",
    religion: "Hindu",
    caste: "Baniya",
    motherTongue: "Hindi",
    height: 158,
    qualification: "B.Tech - IT",
    occupationType: "Data Scientist",
    annualIncome: "18-25 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Tech professional who enjoys yoga and meditation. Seeking a balanced life partner.",
  },
  {
    fullName: "Aditya Kapoor",
    email: "aditya.kapoor@example.com",
    phone: "+919876543219",
    gender: "MALE" as const,
    dateOfBirth: new Date("1988-10-08"),
    city: "Mumbai",
    state: "Maharashtra",
    religion: "Hindu",
    caste: "Punjabi Khatri",
    motherTongue: "Punjabi",
    height: 176,
    qualification: "MBA - Operations",
    occupationType: "Operations Manager",
    annualIncome: "20-28 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Family-oriented professional who loves cooking and traveling.",
  },
  {
    fullName: "Divya Iyer",
    email: "divya.iyer@example.com",
    phone: "+919876543220",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1995-06-15"),
    city: "Chennai",
    state: "Tamil Nadu",
    religion: "Hindu",
    caste: "Iyer",
    motherTongue: "Tamil",
    height: 164,
    qualification: "M.Sc - Biotechnology",
    occupationType: "Research Scientist",
    annualIncome: "10-15 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Researcher with a love for nature and environmental conservation.",
  },
  {
    fullName: "Rohit Sharma",
    email: "rohit.sharma@example.com",
    phone: "+919876543221",
    gender: "MALE" as const,
    dateOfBirth: new Date("1993-01-25"),
    city: "Delhi",
    state: "Delhi",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Hindi",
    height: 179,
    qualification: "B.Tech - Civil",
    occupationType: "Civil Engineer",
    annualIncome: "12-16 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Sports enthusiast and fitness freak. Looking for an active partner.",
  },
  {
    fullName: "Kavita Desai",
    email: "kavita.desai@example.com",
    phone: "+919876543222",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1994-08-10"),
    city: "Ahmedabad",
    state: "Gujarat",
    religion: "Hindu",
    caste: "Patel",
    motherTongue: "Gujarati",
    height: 161,
    qualification: "B.Com",
    occupationType: "Accountant",
    annualIncome: "5-8 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Simple and caring. Love traditional values and family bonding.",
  },
  {
    fullName: "Suresh Kumar",
    email: "suresh.kumar@example.com",
    phone: "+919876543223",
    gender: "MALE" as const,
    dateOfBirth: new Date("1990-12-05"),
    city: "Bangalore",
    state: "Karnataka",
    religion: "Hindu",
    caste: "Lingayat",
    motherTongue: "Kannada",
    height: 174,
    qualification: "MCA",
    occupationType: "Software Developer",
    annualIncome: "15-20 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Quiet and thoughtful. Enjoy reading and technology.",
  },
  {
    fullName: "Neha Singh",
    email: "neha.singh@example.com",
    phone: "+919876543224",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1996-03-22"),
    city: "Lucknow",
    state: "Uttar Pradesh",
    religion: "Hindu",
    caste: "Rajput",
    motherTongue: "Hindi",
    height: 167,
    qualification: "B.A. - Psychology",
    occupationType: "HR Manager",
    annualIncome: "8-12 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "People person who believes in communication and understanding.",
  },
  {
    fullName: "Amit Joshi",
    email: "amit.joshi@example.com",
    phone: "+919876543225",
    gender: "MALE" as const,
    dateOfBirth: new Date("1992-07-14"),
    city: "Pune",
    state: "Maharashtra",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Marathi",
    height: 177,
    qualification: "M.Tech - Electrical",
    occupationType: "Electrical Engineer",
    annualIncome: "14-18 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Nature lover and trekking enthusiast. Seeking adventurous partner.",
  },
  {
    fullName: "Riya Mukherjee",
    email: "riya.mukherjee@example.com",
    phone: "+919876543226",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1995-11-18"),
    city: "Kolkata",
    state: "West Bengal",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Bengali",
    height: 159,
    qualification: "M.A. - Economics",
    occupationType: "Economist",
    annualIncome: "12-15 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Intellectual and cultured. Love arts, music, and literature.",
  },
  {
    fullName: "Deepak Rao",
    email: "deepak.rao@example.com",
    phone: "+919876543227",
    gender: "MALE" as const,
    dateOfBirth: new Date("1991-05-30"),
    city: "Hyderabad",
    state: "Telangana",
    religion: "Hindu",
    caste: "Kamma",
    motherTongue: "Telugu",
    height: 173,
    qualification: "MBA - Finance",
    occupationType: "Bank Manager",
    annualIncome: "16-22 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Stable and responsible. Value traditions and modern thinking equally.",
  },
  {
    fullName: "Sunita Menon",
    email: "sunita.menon@example.com",
    phone: "+919876543228",
    gender: "FEMALE" as const,
    dateOfBirth: new Date("1994-09-25"),
    city: "Kochi",
    state: "Kerala",
    religion: "Hindu",
    caste: "Nair",
    motherTongue: "Malayalam",
    height: 163,
    qualification: "B.Tech - Electronics",
    occupationType: "Electronics Engineer",
    annualIncome: "10-14 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Career-oriented but family-first. Love traveling and photography.",
  },
  {
    fullName: "Mohammed Ali",
    email: "mohammed.ali@example.com",
    phone: "+919876543229",
    gender: "MALE" as const,
    dateOfBirth: new Date("1990-02-14"),
    city: "Mumbai",
    state: "Maharashtra",
    religion: "Muslim",
    caste: "Sunni",
    motherTongue: "Urdu",
    height: 175,
    qualification: "B.Com",
    occupationType: "Business Owner",
    annualIncome: "20-30 LPA",
    maritalStatus: "NEVER_MARRIED" as const,
    aboutMe: "Family-oriented businessman with strong values and principles.",
  },
];

const communities = [
  { name: "Tamil Brahmins", description: "Community for Tamil Brahmin families", region: "Tamil Nadu" },
  { name: "Punjabi Khatri", description: "Punjabi Khatri matrimonial community", region: "Punjab" },
  { name: "Gujarati Patels", description: "Gujarati Patel community", region: "Gujarat" },
  { name: "Telugu Reddys", description: "Telugu Reddy community", region: "Telangana" },
  { name: "Marathi Families", description: "Marathi speaking community", region: "Maharashtra" },
  { name: "Bengali Brahmins", description: "Bengali Brahmin community", region: "West Bengal" },
  { name: "North Indian Hindus", description: "North Indian Hindu community", region: "North India" },
  { name: "South Indian Hindus", description: "South Indian Hindu community", region: "South India" },
];

async function main() {
  console.log("🌱 Seeding demo data with 20 users...");

  // Get subscription plans
  const freePlan = await prisma.subscriptionPlan.findFirst({ where: { tier: "FREE" } });
  const premiumPlan = await prisma.subscriptionPlan.findFirst({ where: { tier: "PREMIUM" } });

  if (!freePlan) {
    console.error("❌ Free plan not found. Please run main seed first.");
    process.exit(1);
  }

  const createdUsers: any[] = [];

  // Create users
  console.log("  Creating 20 demo users...");
  for (const userData of demoUsers) {
    const passwordHash = await bcrypt.hash("Demo@123456", 12);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      create: {
        email: userData.email,
        phone: userData.phone,
        passwordHash,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        status: "ACTIVE",
        emailVerified: true,
      },
      update: {},
    });

    // Create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: userData.fullName,
        height: userData.height,
        city: userData.city,
        state: userData.state,
        religion: userData.religion,
        caste: userData.caste,
        motherTongue: userData.motherTongue,
        maritalStatus: userData.maritalStatus,
        aboutMe: userData.aboutMe,
        qualification: userData.qualification,
        occupationType: userData.occupationType,
        annualIncome: userData.annualIncome,
        profileCompletionPct: 85,
        adminOverrideVisibility: true,
      },
      update: {},
    });

    // Create subscription
    const plan = Math.random() > 0.7 ? premiumPlan : freePlan;
    if (plan) {
      const existingSub = await prisma.userSubscription.findFirst({ where: { userId: user.id } });
      if (!existingSub) {
        await prisma.userSubscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    // Create KYC submission (some approved, some pending)
    const kycApproved = Math.random() > 0.5;
    const existingKyc = await prisma.kYCSubmission.findFirst({ where: { userId: user.id } });
    if (!existingKyc) {
      await prisma.kYCSubmission.create({
        data: {
          userId: user.id,
          status: kycApproved ? "APPROVED" : "PENDING",
          verificationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          codeGeneratedAt: new Date(),
          codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          attempts: 1,
        },
      });
    }

    createdUsers.push({ user, profile, gender: userData.gender });
  }

  console.log(`  ✅ Created ${createdUsers.length} users`);

  // Create communities
  console.log("  Creating communities...");
  const createdCommunities: any[] = [];
  for (const comm of communities) {
    const slug = comm.name.toLowerCase().replace(/\s+/g, '-');
    const existing = await prisma.community.findFirst({ where: { slug } });
    if (!existing) {
      const community = await prisma.community.create({
        data: {
          name: comm.name,
          slug,
          description: comm.description,
          category: comm.region,
          isActive: true,
        },
      });
      createdCommunities.push(community);
    } else {
      createdCommunities.push(existing);
    }
  }
  console.log(`  ✅ Created ${createdCommunities.length} communities`);

  // Create community memberships
  console.log("  Creating community memberships...");
  let membershipCount = 0;
  for (const { user, profile } of createdUsers) {
    // Add user to relevant community based on region/caste
    const relevantCommunities = createdCommunities.filter(c => 
      profile.state.includes(c.category) || 
      profile.caste.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
    );
    
    for (const community of relevantCommunities.slice(0, 2)) {
      const existing = await prisma.communityMember.findFirst({
        where: { 
          userId: user.id, 
          communityId: community.id 
        } 
      });
      if (!existing) {
        await prisma.communityMember.create({
          data: {
            userId: user.id,
            communityId: community.id,
            status: "APPROVED",
          },
        });
        membershipCount++;
      }
    }
  }
  console.log(`  ✅ Created ${membershipCount} community memberships`);

  // Create interests (male to female)
  console.log("  Creating interests...");
  const males = createdUsers.filter(u => u.gender === "MALE");
  const females = createdUsers.filter(u => u.gender === "FEMALE");
  let interestCount = 0;

  for (const male of males) {
    // Each male sends interest to 2-3 random females
    const targetFemales = females
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 2);
    
    for (const female of targetFemales) {
      const status = Math.random() > 0.6 ? "ACCEPTED" : "PENDING";
      await prisma.interest.upsert({
        where: { 
          senderId_receiverId: { 
            senderId: male.user.id, 
            receiverId: female.user.id 
          } 
        },
        create: {
          senderId: male.user.id,
          receiverId: female.user.id,
          status,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {},
      });
      interestCount++;
    }
  }
  console.log(`  ✅ Created ${interestCount} interests`);

  // Create wishlist entries
  console.log("  Creating wishlist entries...");
  let wishlistCount = 0;
  for (const { user, gender } of createdUsers) {
    const oppositeGender = gender === "MALE" ? "FEMALE" : "MALE";
    const targets = createdUsers
      .filter(u => u.gender === oppositeGender)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const target of targets) {
      const existing = await prisma.wishlist.findFirst({
        where: { 
          userId: user.id, 
          profileId: target.profile.id 
        } 
      });
      if (!existing) {
        await prisma.wishlist.create({
          data: {
            userId: user.id,
            profileId: target.profile.id,
          },
        });
        wishlistCount++;
      }
    }
  }
  console.log(`  ✅ Created ${wishlistCount} wishlist entries`);

  // Create mutual matches
  console.log("  Creating mutual matches...");
  const acceptedInterests = await prisma.interest.findMany({
    where: { status: "ACCEPTED" },
    take: 5,
  });
  
  let matchCount = 0;
  for (const interest of acceptedInterests) {
    // Check if reverse interest also exists and is accepted
    const reverseInterest = await prisma.interest.findFirst({
      where: {
        senderId: interest.receiverId,
        receiverId: interest.senderId,
        status: "ACCEPTED",
      },
    });

    if (reverseInterest) {
      const existing = await prisma.mutualMatch.findFirst({
        where: { 
          userAId: interest.senderId, 
          userBId: interest.receiverId 
        } 
      });
      if (!existing) {
        await prisma.mutualMatch.create({
          data: {
            userAId: interest.senderId,
            userBId: interest.receiverId,
            interestId: interest.id,
          },
        });
        matchCount++;
      }
    }
  }
  console.log(`  ✅ Created ${matchCount} mutual matches`);

  console.log("\n✅ Demo data seeding complete!");
  console.log("\n📋 Demo User Credentials (all users):");
  console.log("   Password: Demo@123456");
  console.log("\n   Sample emails:");
  console.log("   - priya.sharma@example.com");
  console.log("   - rahul.verma@example.com");
  console.log("   - ananya.patel@example.com");
  console.log("   - arjun.singh@example.com");
  console.log("   - sneha.reddy@example.com");
}

main()
  .catch((e) => {
    console.error("❌ Demo seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
