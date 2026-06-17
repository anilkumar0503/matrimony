import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ["query", "error", "warn"],
});

async function main() {
  console.log("🌱 Seeding match tickets...");

  // Get an active admin user
  const adminUser = await prisma.adminUser.findFirst({ where: { isActive: true } });
  if (!adminUser) {
    console.error("❌ No active admin user found. Please run reset-admin.ts first.");
    process.exit(1);
  }
  console.log(`  Using admin: ${adminUser.email}`);

  // Get or create mutual matches
  console.log("  Finding mutual matches...");
  let mutualMatches = await prisma.mutualMatch.findMany({ take: 10 });

  // Filter out matches that already have tickets
  const matchIdsWithTickets = new Set(
    (await prisma.matchTicket.findMany({ select: { matchId: true } })).map(t => t.matchId)
  );
  mutualMatches = mutualMatches.filter(m => !matchIdsWithTickets.has(m.id));

  if (mutualMatches.length < 5) {
    console.log("  Not enough mutual matches without tickets. Creating from accepted interests...");
    const acceptedInterests = await prisma.interest.findMany({
      where: { status: "ACCEPTED" },
      take: 20,
    });

    let createdCount = 0;
    for (const interest of acceptedInterests) {
      if (createdCount >= 10) break;

      // Check if reverse interest exists
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
            OR: [
              { userAId: interest.senderId, userBId: interest.receiverId },
              { userAId: interest.receiverId, userBId: interest.senderId },
            ],
          },
        });

        if (!existing) {
          const match = await prisma.mutualMatch.create({
            data: {
              userAId: interest.senderId,
              userBId: interest.receiverId,
              interestId: interest.id,
            },
          });
          mutualMatches.push(match);
          console.log(`    Created mutual match for ${interest.senderId} <-> ${interest.receiverId}`);
          createdCount++;
        }
      }
    }

    // If still not enough, create directly from user pairs
    if (mutualMatches.length < 5) {
      console.log("  Still not enough matches. Creating from user pairs...");
      const users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, gender: true },
        take: 20,
      });

      const males = users.filter(u => u.gender === "MALE");
      const females = users.filter(u => u.gender === "FEMALE");

      for (let i = 0; i < Math.min(males.length, females.length) && createdCount < 10; i++) {
        const male = males[i];
        const female = females[i];

        const existing = await prisma.mutualMatch.findFirst({
          where: {
            OR: [
              { userAId: male.id, userBId: female.id },
              { userAId: female.id, userBId: male.id },
            ],
          },
        });

        if (!existing) {
          const match = await prisma.mutualMatch.create({
            data: {
              userAId: male.id,
              userBId: female.id,
            },
          });
          mutualMatches.push(match);
          console.log(`    Created direct mutual match for ${male.id} <-> ${female.id}`);
          createdCount++;
        }
      }
    }
  }

  console.log(`  Found ${mutualMatches.length} mutual matches without tickets`);

  // Create match tickets
  console.log("  Creating match tickets...");
  const statuses = ["OPEN", "IN_REVIEW", "SCHEDULED", "COMPLETED", "CLOSED"] as const;
  const meetingTypes = ["GOOGLE_MEET", "PHYSICAL", "OFFLINE_ASSISTED"] as const;
  const outcomes = ["PROCEEDING", "NOT_PROCEEDING", "ENGAGED", "MARRIED"] as const;
  let ticketCount = 0;

  for (const match of mutualMatches) {
    const existingTicket = await prisma.matchTicket.findUnique({ where: { matchId: match.id } });
    if (!existingTicket) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const ticketData: any = {
        matchId: match.id,
        status,
        assignedTo: adminUser.id,
      };

      // Add meeting details for scheduled tickets
      if (status === "SCHEDULED") {
        ticketData.meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
        ticketData.meetingTime = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        ticketData.meetingLink = ticketData.meetingType === "GOOGLE_MEET"
          ? `https://meet.google.com/demo-${Math.random().toString(36).substring(7)}`
          : null;
      }

      // Add outcome for completed/closed tickets
      if (status === "COMPLETED") {
        ticketData.outcome = outcomes[Math.floor(Math.random() * 2)]; // PROCEEDING or NOT_PROCEEDING
      } else if (status === "CLOSED") {
        ticketData.outcome = "NOT_PROCEEDING";
        ticketData.closeReason = [
          "Not compatible after review",
          "User requested closure",
          "No response from users",
          "Profile mismatch",
        ][Math.floor(Math.random() * 4)];
      }

      const ticket = await prisma.matchTicket.create({ data: ticketData });
      console.log(`    Created ticket: ${ticket.id} (${status})`);

      // Add notes to some tickets
      if (Math.random() > 0.5) {
        const notes = [
          "Initial review - profiles look compatible. Recommend scheduling a meeting.",
          "Both users have completed KYC verification.",
          "Similar educational background and career goals.",
          "Families are from same region, potential cultural match.",
          "Users have exchanged contact information and are communicating.",
        ];
        await prisma.matchTicketNote.create({
          data: {
            ticketId: ticket.id,
            adminId: adminUser.id,
            note: notes[Math.floor(Math.random() * notes.length)],
          },
        });
      }

      ticketCount++;
    }
  }

  console.log(`\n✅ Created ${ticketCount} match tickets`);
  console.log("\n📋 Summary:");
  console.log(`   Admin: ${adminUser.email}`);
  console.log(`   Mutual Matches: ${mutualMatches.length}`);
  console.log(`   Match Tickets: ${ticketCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Match ticket seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
