import { PrismaClient, Dosham } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  // Update male profiles with horoscope data
  const updates = [
    {
      email: "rahul.verma@example.com",
      nakshatra: "Punarvasu",
      rashi: "Gemini",
      lagna: "Virgo",
      nadi: "Adi",
      gana: "Dev",
      dosham: [] as Dosham[],
    },
    {
      email: "arjun.singh@example.com",
      nakshatra: "Ashwini",
      rashi: "Aries",
      lagna: "Aries",
      nadi: "Madhya",
      gana: "Rakshas",
      dosham: [Dosham.MANGAL_DOSHAM],
    },
    {
      email: "vikram.krishnan@example.com",
      nakshatra: "Magha",
      rashi: "Leo",
      lagna: "Sagittarius",
      nadi: "Antya",
      gana: "Rakshas",
      dosham: [] as Dosham[],
    },
    {
      email: "karan.mehta@example.com",
      nakshatra: "Swati",
      rashi: "Libra",
      lagna: "Aquarius",
      nadi: "Madhya",
      gana: "Manush",
      dosham: [] as Dosham[],
    },
    {
      email: "aditya.kapoor@example.com",
      nakshatra: "Vishakha",
      rashi: "Scorpio",
      lagna: "Cancer",
      nadi: "Adi",
      gana: "Dev",
      dosham: [] as Dosham[],
    },
  ];

  for (const update of updates) {
    const user = await prisma.user.findUnique({
      where: { email: update.email },
    });

    if (!user) {
      console.log(`User not found: ${update.email}`);
      continue;
    }

    const profile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        nakshatra: update.nakshatra,
        rashi: update.rashi,
        lagna: update.lagna,
        nadi: update.nadi,
        gana: update.gana,
        dosham: update.dosham,
      },
    });

    console.log(`Updated ${update.email}:`, { nakshatra: profile.nakshatra, rashi: profile.rashi });
  }

  console.log("All male profiles updated");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
