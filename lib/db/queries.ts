import { eq, sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  ActivityType,
  type NewActivityLog,
  NewUser,
  users,
} from "./schema";

export async function getUserByEmail(email: string) {
  const usersList = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (usersList.length === 0) {
    throw new Error("User not found");
  }

  return usersList[0];
}

export async function logActivity(
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || "",
  };

  await db.insert(activityLogs).values(newActivity);
}

export async function updateUserPassword(
  newPasswordHash: string,
  userId: string
) {
  return db
    .update(users)
    .set({ passwordHash: newPasswordHash })
    .where(eq(users.id, userId));
}

export async function insertNewUser(user: NewUser) {
  return db.insert(users).values(user).returning();
}

export async function softDeleteUser(userId: string) {
  return db
    .update(users)
    .set({
      deletedAt: sql`CURRENT_TIMESTAMP`,
      email: sql`CONCAT(email, '-', id, '-deleted')`,
    })
    .where(eq(users.id, userId));
}

export async function updateUser(
  values: Pick<NewUser, "email" | "name">,
  userId: string
) {
  return db.update(users).set(values).where(eq(users.id, userId));
}

export async function getActivityLogs() {}
