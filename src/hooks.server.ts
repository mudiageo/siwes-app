import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export async function handle({ event, resolve }) {
	
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers,
	});
	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}
	
	// Populate event.locals.auth with a function that gets the session
  	event.locals.auth = async () => {
		return await auth.api.getSession({
			headers: event.request.headers
		});
	};

	
	return svelteKitHandler({ event, resolve, auth, building });
}