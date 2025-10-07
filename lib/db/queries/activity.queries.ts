import { db } from '../drizzle';
import { activityLogs, type NewActivityLog, type ActivityType } from '../schema';

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
