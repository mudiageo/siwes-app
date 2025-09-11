import { redirect } from '@sveltejs/kit';
import { getDashboardData } from '$lib/server/remote-functions.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user || session.user.userType !== 'student') {
		throw redirect(302, '/auth/login');
	}

	try {
		return await getDashboardData(event);
	} catch (error) {
		console.error('Student dashboard load error:', error);
		throw redirect(302, '/auth/login');
	}
};