import { writable } from 'svelte/store';
import type { Notification } from '$lib/db/schema.js';

export const notifications = writable<Notification[]>([]);
export const unreadCount = writable(0);

export async function fetchNotifications() {
	try {
		const response = await fetch('/api/notifications');
		if (response.ok) {
			const data = await response.json();
			notifications.set(data.notifications);
		}
	} catch (error) {
		console.error('Failed to fetch notifications:', error);
	}
}

export async function fetchUnreadCount() {
	try {
		const response = await fetch('/api/notifications?count=true');
		if (response.ok) {
			const data = await response.json();
			unreadCount.set(data.count);
		}
	} catch (error) {
		console.error('Failed to fetch unread count:', error);
	}
}

export async function markAllAsRead() {
	try {
		const response = await fetch('/api/notifications', { method: 'PUT' });
		if (response.ok) {
			unreadCount.set(0);
			notifications.update(notifs => 
				notifs.map(n => ({ ...n, isRead: true }))
			);
		}
	} catch (error) {
		console.error('Failed to mark notifications as read:', error);
	}
}