import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient, adminClient, multiSessionClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [
		twoFactorClient(),
		multiSessionClient(),
		adminClient()
	]
});

export const { signIn, signUp, signOut, useSession } = authClient;
