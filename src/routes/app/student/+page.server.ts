import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user || session.user.userType !== 'student') {
		redirect(302, '/auth/login');
	}

	// Return minimal data - remote functions will handle the rest
	return {
		user: session.user
	};
};