import type { PageServerLoad } from './$types';
import { getMatchAnalysis } from '$lib/matching.remote';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		redirect(302, '/auth/login');
	}

	const placementId = params.id;
	if (!placementId) {
		redirect(302, '/app/student');
	}

	// Only students can view placement match analysis
	if (session.user.userType !== 'student') {
		redirect(302, '/app/company');
	}

	try {
		const matchAnalysis = await getMatchAnalysis(session.user.id, placementId);
		
		return {
			matchAnalysis,
			user: session.user
		};
	} catch (error) {
		console.error('Failed to load placement:', error);
		redirect(302, '/app/student/matches');
	}
}) satisfies PageServerLoad;
