import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import { notifications } from '@/lib/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}
		const isAdmin = session.user.isAdmin;
		if (!isAdmin) {
			return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
		}

		// Get notifications for the admin user
		const userNotifications = await db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, session.user.id))
			.orderBy(desc(notifications.createdAt))
			.limit(50);

		const unreadCountResult = await db
			.select({ count: count() })
			.from(notifications)
			.where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

		return NextResponse.json({
			success: true,
			data: {
				notifications: userNotifications,
				unreadCount: unreadCountResult[0]?.count || 0
			}
		});
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}
		const body = await request.json();
		const { type, title, message, data, userId } = body;

		if (!type || !title || !message || !userId) {
			return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
		}
		const newNotification = await db
			.insert(notifications)
			.values({
				userId,
				type,
				title,
				message,
				data: data ? JSON.stringify(data) : null
			})
			.returning();

		return NextResponse.json({
			success: true,
			notification: newNotification[0]
		});
	} catch (error) {
		console.error('Error creating notification:', error);
		return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
