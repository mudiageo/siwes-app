import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	
	if (!session?.user || session.user.userType !== 'student') {
		throw redirect(302, '/app');
	}

	// Redirect to the shared applications page which handles both student and company views
	throw redirect(302, '/app/applications');
};
