import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db/index.js';
import { notifications } from '$lib/server/db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';
import * as v from 'valibot';

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

  return userNotifications;
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
  
    await getNotifications().refresh();
  return { success: true };
});

export const markAsRead = command(v.string(), async (notificationId: string) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
  
    await getNotifications().refresh();
  return { success: true };
});

export const deleteNotification = command(v.string(), async (notificationId : string) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));
  
  await getNotifications().refresh();
  return { success: true };
});