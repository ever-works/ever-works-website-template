import { eq, sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  ActivityType,
  type NewActivityLog,
  NewUser,
  passwordResetTokens,
  users,
  verificationTokens,
  newsletterSubscriptions,
  type NewNewsletterSubscription,
  type NewsletterSubscription,
} from "./schema";

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

// ######################### User Queries #########################

export async function getUserByEmail(email: string) {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. User validation is disabled.");
    return null;
  }
  
  try {
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (usersList.length === 0) {
      throw new Error("User not found");
    }

    return usersList[0];
  } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            console.warn(`User validation failed: No user found with email ${email}`);
          } else {
            console.error("Database error in getUserByEmail:", error);
          }    
          // Return null instead of throwing an error to allow the auth flow to continue
    return null;
  }
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

export async function updateUserVerification(email: string, verified: boolean) {
  return db
    .update(users)
    .set({ emailVerified: verified ? new Date() : null })
    .where(eq(users.email, email));
}

// ######################### Password Token Queries #########################

export async function getPasswordResetTokenByEmail(email: string) {
  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.email, email))
    .limit(1);

  return tokens[0];
}

export async function getPasswordResetTokenByToken(token: string) {
  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return tokens.at(0);
}

export async function deletePasswordResetToken(token: string) {
  return db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));
}

// ######################### Verification Token Queries #########################

export async function getVerificationTokenByEmail(email: string) {
  const tokens = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.email, email))
    .limit(1);

  return tokens[0];
}

export async function getVerificationTokenByToken(token: string) {
  const tokens = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  return tokens.at(0);
}

export async function deleteVerificationToken(token: string) {
  return db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));
}

export async function getUserById(id: string) {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. User validation is disabled.");
    return null;
  }
  try {
      const usersList = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
  
      if (usersList.length === 0) {
        throw new Error("User not found");
      }
      return usersList[0];
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      console.warn(`User validation failed: No user found with id ${id}`);
    } else {
      console.error("Database error in getUserById:", error);
    }
    return null;
  }
}

// ######################### Newsletter Subscription Queries #########################

export async function createNewsletterSubscription(
  email: string,
  source: string = "footer"
): Promise<NewsletterSubscription | null> {
  try {
    const newSubscription: NewNewsletterSubscription = {
      email: email.toLowerCase().trim(),
      source,
    };

    const result = await db
      .insert(newsletterSubscriptions)
      .values(newSubscription)
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error creating newsletter subscription:", error);
    return null;
  }
}

export async function getNewsletterSubscriptionByEmail(email: string) {
  try {
    const subscriptions = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .limit(1);

    return subscriptions[0] || null;
  } catch (error) {
    console.error("Error getting newsletter subscription:", error);
    return null;
  }
}

export async function updateNewsletterSubscription(
  email: string,
  updates: Partial<Pick<NewsletterSubscription, "isActive" | "unsubscribedAt">>
) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set(updates)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating newsletter subscription:", error);
    return null;
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return null;
  }
}

export async function resubscribeToNewsletter(email: string) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set({
        isActive: true,
        unsubscribedAt: null,
      })
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error resubscribing to newsletter:", error);
    return null;
  }
}

export async function getNewsletterStats() {
  try {
    const totalSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.isActive, true));

    const recentSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions)
      .where(
        sql`${newsletterSubscriptions.subscribedAt} >= NOW() - INTERVAL '30 days'`
      );

    return {
      totalActive: totalSubscriptions[0]?.count || 0,
      recentSubscriptions: recentSubscriptions[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error getting newsletter stats:", error);
    return {
      totalActive: 0,
      recentSubscriptions: 0,
    };
  }
}

// export async function getActivityLogs() {}
