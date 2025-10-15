import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor, admin, multiSession } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";


export const auth = betterAuth({
	database: drizzleAdapter(db, {
		schema: {
			...schema,
			user: schema.users
		},
		provider: 'pg',
		usePlural: true
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Set to true when email provider is configured
		minPasswordLength: 8,
		maxPasswordLength: 128,
		autoSignIn: true,
		sendResetPassword: async ({ user, url, token }) => {
			// TODO: Implement email sending for password reset
			// When ready, send email with reset link: url
			console.log(`Password reset link for ${user.email}: ${url}`);
		}
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string,
			enabled: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET
		}
	},
	// Email verification configuration
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }) => {
			// TODO: Implement email sending for verification
			// When ready, send email with verification link: url
			console.log(`Email verification link for ${user.email}: ${url}`);
		},
		sendOnSignUp: false, // Set to true when email provider is configured
		autoSignInAfterVerification: true
	},
	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day - update session if older than this
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5 // 5 minutes
		}
	},
	// Account management
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ['google']
		}
	},
	// Security settings
	rateLimit: {
		enabled: true,
		window: 60, // 1 minute
		max: 10 // 10 requests per window
	},
	// Advanced configuration
	advanced: {
		generateId: () => crypto.randomUUID(),
		crossSubDomainCookies: {
			enabled: false
		}
	},
	// User configuration
	user: {
		additionalFields: {
			firstName: {
				type: 'string',
				required: false,
				input: true
			},
			lastName: {
				type: 'string',
				required: false,
				input: true
			},
			phone: {
				type: 'string',
				required: false,
				input: true
			},
			userType: {
				type: 'string',
				required: true,
				input: true,
				returned: true
			},
			isActive: {
				type: 'boolean',
				required: false,
				defaultValue: true,
				input: false
			}
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
				// TODO: Implement email sending for email change verification
				console.log(`Email change verification for ${user.email} to ${newEmail}: ${url}`);
			}
		}
	},
	// Plugins
	plugins: [
		// Two-factor authentication plugin
		twoFactor({
			issuer: env.BETTER_AUTH_URL || 'SIWES AI',
			skipVerificationOnEnable: false,
			totpOptions: {
				period: 30,
				digits: 6
			}
		}),
		// Multi-session support
		multiSession(),
		// Admin plugin for user management
		admin(),
		sveltekitCookies(getRequestEvent),
		
	]
});