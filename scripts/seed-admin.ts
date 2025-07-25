import { db } from "../lib/db/drizzle";
import { users } from "../lib/db/schema";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const password = "adminpassword"; // Change this for production!
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    id: crypto.randomUUID(),
    name: "Admin User",
    email: "admin@example.com",
    passwordHash,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin user seeded! Email: admin@example.com, Password: adminpassword");
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin user:", err);
  process.exit(1);
}); 