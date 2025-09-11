import type { PageServerLoad } from './$types';
import { getNotifications, markAsRead } from '$lib/notifications.remote';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		redirect(302, '/auth/login');
	}

	try {
		const notifications = await getNotifications(session.user.id);
		
		return {
			notifications,
			user: session.user
		};
	} catch (error) {
		console.error('Failed to load notifications:', error);
		return {
			notifications: [],
			user: session.user
		};
	}
}) satisfies PageServerLoad;
