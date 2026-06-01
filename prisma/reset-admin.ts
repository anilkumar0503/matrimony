import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Resetting admin password...");

  const superAdminRole = await prisma.role.findUnique({ where: { name: "Super Admin" } });
  if (!superAdminRole) {
    console.error("Super Admin role not found. Run full seed first.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash("Admin@123456", 12);
  
  await prisma.adminUser.upsert({
    where: { email: "admin@matrimony.local" },
    create: {
      email: "admin@matrimony.local",
      passwordHash,
      name: "Super Admin",
      roleId: superAdminRole.id,
      isActive: true,
    },
    update: {
      passwordHash,
      isActive: true,
    },
  });

  console.log("✅ Admin password reset successfully!");
  console.log("📋 Admin Credentials:");
  console.log("   Email: admin@matrimony.local");
  console.log("   Password: Admin@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
