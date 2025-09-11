import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/db/index.js';
import { notifications } from '$lib/db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';

// Get user notifications
export const getNotifications = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return { notifications: userNotifications };
});

// Get unread notification count
export const getUnreadCount = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, session.user.id),
      eq(notifications.isRead, false)
    ));

  return { count: result[0]?.count || 0 };
});

// Mark all notifications as read
export const markAllAsRead = command(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, session.user.id));

  return { success: true };
});