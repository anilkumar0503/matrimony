import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  // Update Priya Sharma's profile with horoscope data
  const user = await prisma.user.findUnique({
    where: { email: "priya.sharma@example.com" },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const profile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      nakshatra: "Rohini",
      rashi: "Taurus",
      lagna: "Leo",
      nadi: "Madhya",
      gana: "Manush",
      dosham: [],
    },
  });

  console.log("Updated profile:", profile);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
