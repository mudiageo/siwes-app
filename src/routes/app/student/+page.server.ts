import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const user = event.locals.user;
	if (!user || user.userType !== 'student') redirect(302, '/auth/login');

	// Return minimal data - remote functions will handle the rest
	return {
		user
	};
};