import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Notification } from '$lib/server/db/schema';

export async function createNotification(
	userId: string,
	title: string,
	message: string,
	type: 'match' | 'application' | 'message' | 'system',
	actionUrl?: string
) {
	const [notification] = await db.insert(notifications).values({
		userId,
		title,
		message,
		type,
		actionUrl
	}).returning();

	return notification;
}

export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
	return db
		.select()
		.from(notifications)
		.where(eq(notifications.userId, userId))
		.orderBy(desc(notifications.createdAt))
		.limit(limit);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
	const result = await db
		.select({ count: notifications.id })
		.from(notifications)
		.where(and(
			eq(notifications.userId, userId),
			eq(notifications.isRead, false)
		));

	return result.length;
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
	await db
		.update(notifications)
		.set({ isRead: true })
		.where(and(
			eq(notifications.id, notificationId),
			eq(notifications.userId, userId)
		));
}

export async function markAllNotificationsAsRead(userId: string) {
	await db
		.update(notifications)
		.set({ isRead: true })
		.where(eq(notifications.userId, userId));
}

// Notification triggers
export async function notifyNewMatch(studentId: string, placementTitle: string, companyName: string) {
	await createNotification(
		studentId,
		'New Match Found!',
		`You have a new match: ${placementTitle} at ${companyName}`,
		'match',
		'/matches'
	);
}

export async function notifyApplicationStatusChange(
	studentId: string,
	placementTitle: string,
	status: string,
	applicationId: string
) {
	const statusMessages = {
		reviewing: 'Your application is now under review',
		interview: 'You have been invited for an interview',
		accepted: 'Congratulations! Your application has been accepted',
		rejected: 'Your application was not successful this time'
	};

	await createNotification(
		studentId,
		'Application Update',
		`${placementTitle}: ${statusMessages[status as keyof typeof statusMessages]}`,
		'application',
		`/applications/${applicationId}`
	);
}

export async function notifyNewApplication(companyUserId: string, studentName: string, placementTitle: string) {
	await createNotification(
		companyUserId,
		'New Application Received',
		`${studentName} applied for ${placementTitle}`,
		'application',
		'/applications'
	);
}

export async function notifyNewMessage(recipientId: string, senderName: string, applicationId: string) {
	await createNotification(
		recipientId,
		'New Message',
		`You have a new message from ${senderName}`,
		'message',
		`/applications/${applicationId}/messages`
	);
}