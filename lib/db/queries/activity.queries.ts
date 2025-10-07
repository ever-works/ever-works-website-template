import { and, eq, desc } from 'drizzle-orm';
import { db } from '../drizzle';
import { activityLogs, ActivityType, type NewActivityLog, type ActivityLog } from '../schema';

/**
 * Log an activity to the activity logs table
 * @param type - The type of activity
 * @param userId - Optional user ID
 * @param ipAddress - Optional IP address
 */
export async function logActivity(
  type: ActivityType,
  userId?: string,
  ipAddress?: string
): Promise<void> {
  const newActivity: NewActivityLog = {
    userId: userId || null,
    action: type,
    ipAddress: ipAddress || ''
  };

  await db.insert(activityLogs).values(newActivity);
}

/**
 * Get the last login activity for a client
 * @param clientId - Client ID
 * @returns Last login activity or null if not found
 */
export async function getLastLoginActivity(clientId: string): Promise<ActivityLog | null> {
  const [lastLogin] = await db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.clientId, clientId), eq(activityLogs.action, ActivityType.SIGN_IN)))
    .orderBy(desc(activityLogs.timestamp))
    .limit(1);

  return lastLogin || null;
}
