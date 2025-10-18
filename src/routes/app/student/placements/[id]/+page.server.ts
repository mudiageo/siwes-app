import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.auth();
	
	if (!session?.user || session.user.userType !== 'student') {
		redirect(302, '/app');
	}

	// Redirect to the shared placements detail page
	redirect(302, `/app/placements/${params.id}`);
};
