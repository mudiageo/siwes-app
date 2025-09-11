import { redirect } from '@sveltejs/kit';
import { getMatches } from '$lib/server/remote-functions.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user || session.user.userType !== 'student') {
		throw redirect(302, '/auth/login');
	}

	// Get filter parameters
	const filters = {
		industry: event.url.searchParams.get('industry') || '',
		location: event.url.searchParams.get('location') || '',
		duration: event.url.searchParams.get('duration') || '',
		search: event.url.searchParams.get('search') || ''
	};

	try {
		const result = await getMatches(event, filters);
		return {
			...result,
			filters,
			user: session.user
		};
	} catch (error) {
		console.error('Matches load error:', error);
		throw redirect(302, '/auth/login');
	}
};